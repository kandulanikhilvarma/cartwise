import {
  classifyFoodGroup,
  foodGroupFromOffCategories,
  type FoodGroup,
} from '@/features/nutrition/lib/food-group'
import { prisma } from '@/infrastructure/db/client'

export type NutritionMatch = {
  caloriesKcal: number
  proteinG: number
  carbsG: number
  fatG: number
  sugarG: number
  fiberG: number
  sodiumMg: number
  vitaminDMcg: number
  ironMg: number
  calciumMg: number
  matchConfidence: number
  unit: string
  source: 'usda' | 'off'
  foodGroup: FoodGroup | null
  novaGroup: number | null
  nutriScore: string | null
}

// L1: per-request memo. L2 (Postgres) is what survives a serverless cold start.
const memo = new Map<string, NutritionMatch | null>()

const FETCH_TIMEOUT_MS = 6_000
// A cached match older than this is refetched — source databases do get corrected.
const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000

const databaseUnavailable = !process.env.DATABASE_URL

// USDA FoodData Central nutrient numbers (values reported per 100 g).
const USDA_NUTRIENT = {
  energyKcal: '208',
  protein: '203',
  carbs: '205',
  fat: '204',
  sugar: '269',
  fiber: '291',
  sodiumMg: '307',
  vitaminDMcg: '328',
  ironMg: '303',
  calciumMg: '301',
} as const

function num(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0
}

function round2(value: number): number {
  return Math.round(value * 100) / 100
}

function normalize(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, ' ')
}

/**
 * A free-text search returns its best guess, which is sometimes wrong. Anything
 * physically impossible per 100 g means the wrong product was matched, and a
 * wrong match is worse than an honest "unmatched".
 */
function isPlausible(match: NutritionMatch): boolean {
  const { proteinG, carbsG, fatG, sugarG, fiberG, caloriesKcal } = match
  if ([proteinG, carbsG, fatG, sugarG, fiberG].some((value) => value < 0 || value > 100)) {
    return false
  }
  if (sugarG > carbsG + 1) return false
  if (proteinG + carbsG + fatG > 105) return false
  // 100 g of pure fat is about 900 kcal; nothing edible exceeds that.
  if (caloriesKcal < 0 || caloriesKcal > 900) return false
  return true
}

/**
 * A source that never answers must not hold the whole receipt open. Any network
 * or timeout failure degrades to "no match", which the UI already shows honestly.
 */
async function fetchJson(url: string, headers?: Record<string, string>): Promise<unknown | null> {
  try {
    const response = await fetch(url, {
      cache: 'no-store',
      headers,
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    })
    if (!response.ok) return null
    return await response.json()
  } catch {
    return null
  }
}

async function fromUsda(name: string): Promise<NutritionMatch | null> {
  const apiKey = process.env.USDA_FDC_API_KEY
  if (!apiKey) return null

  const url =
    `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${apiKey}` +
    `&query=${encodeURIComponent(name)}&pageSize=1&dataType=Foundation,SR%20Legacy`

  const payload = (await fetchJson(url)) as {
    foods?: Array<{ foodNutrients?: Array<{ nutrientNumber?: string; value?: number }> }>
  } | null

  const nutrients = payload?.foods?.[0]?.foodNutrients
  if (!nutrients || nutrients.length === 0) return null

  const pick = (nutrientNumber: string): number =>
    num(nutrients.find((n) => n.nutrientNumber === nutrientNumber)?.value)

  const caloriesKcal = pick(USDA_NUTRIENT.energyKcal)
  const proteinG = pick(USDA_NUTRIENT.protein)
  if (caloriesKcal === 0 && proteinG === 0) return null

  return {
    caloriesKcal,
    proteinG,
    carbsG: pick(USDA_NUTRIENT.carbs),
    fatG: pick(USDA_NUTRIENT.fat),
    sugarG: pick(USDA_NUTRIENT.sugar),
    fiberG: pick(USDA_NUTRIENT.fiber),
    sodiumMg: pick(USDA_NUTRIENT.sodiumMg),
    vitaminDMcg: pick(USDA_NUTRIENT.vitaminDMcg),
    ironMg: pick(USDA_NUTRIENT.ironMg),
    calciumMg: pick(USDA_NUTRIENT.calciumMg),
    matchConfidence: 0.85,
    unit: '100g',
    source: 'usda',
    // USDA Foundation foods carry no processing grade; the name is all there is.
    foodGroup: classifyFoodGroup(name),
    novaGroup: null,
    nutriScore: null,
  }
}

async function fromOpenFoodFacts(name: string): Promise<NutritionMatch | null> {
  const url =
    `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(name)}` +
    `&search_simple=1&action=process&json=1&page_size=1`

  const payload = (await fetchJson(url, {
    'user-agent': 'Cartwise/1.0',
    accept: 'application/json',
  })) as {
    products?: Array<{
      nutriments?: Record<string, unknown>
      nova_group?: unknown
      nutriscore_grade?: unknown
      categories_tags?: unknown
    }>
  } | null

  const product = payload?.products?.[0]
  const nutriments = product?.nutriments
  if (!nutriments) return null

  const g = (key: string): number => num(nutriments[key])
  const caloriesKcal = g('energy-kcal_100g') || Math.round(g('energy_100g') / 4.184)
  const proteinG = g('proteins_100g')
  if (caloriesKcal === 0 && proteinG === 0) return null

  const categories = Array.isArray(product?.categories_tags)
    ? (product.categories_tags as unknown[]).filter((tag): tag is string => typeof tag === 'string')
    : []
  const nova = Number(product?.nova_group)
  const grade = typeof product?.nutriscore_grade === 'string' ? product.nutriscore_grade : null

  return {
    caloriesKcal,
    proteinG,
    carbsG: g('carbohydrates_100g'),
    fatG: g('fat_100g'),
    sugarG: g('sugars_100g'),
    fiberG: g('fiber_100g'),
    sodiumMg: round2(g('sodium_100g') * 1000), // g -> mg
    vitaminDMcg: round2(g('vitamin-d_100g') * 1_000_000), // g -> µg
    ironMg: round2(g('iron_100g') * 1000), // g -> mg
    calciumMg: round2(g('calcium_100g') * 1000), // g -> mg
    matchConfidence: 0.7,
    unit: '100g',
    source: 'off',
    foodGroup: foodGroupFromOffCategories(categories) ?? classifyFoodGroup(name),
    novaGroup: Number.isInteger(nova) && nova >= 1 && nova <= 4 ? nova : null,
    nutriScore: grade && /^[a-e]$/i.test(grade) ? grade.toLowerCase() : null,
  }
}

type CacheRow = {
  found: boolean
  source: string
  caloriesKcal: number | null
  proteinG: number | null
  carbsG: number | null
  fatG: number | null
  sugarG: number | null
  fiberG: number | null
  sodiumMg: number | null
  vitaminDMcg: number | null
  ironMg: number | null
  calciumMg: number | null
  matchConfidence: number | null
  foodGroup: string | null
  novaGroup: number | null
  nutriScore: string | null
}

function rowToMatch(row: CacheRow): NutritionMatch | null {
  if (!row.found) return null
  return {
    caloriesKcal: row.caloriesKcal ?? 0,
    proteinG: row.proteinG ?? 0,
    carbsG: row.carbsG ?? 0,
    fatG: row.fatG ?? 0,
    sugarG: row.sugarG ?? 0,
    fiberG: row.fiberG ?? 0,
    sodiumMg: row.sodiumMg ?? 0,
    vitaminDMcg: row.vitaminDMcg ?? 0,
    ironMg: row.ironMg ?? 0,
    calciumMg: row.calciumMg ?? 0,
    matchConfidence: row.matchConfidence ?? 0.7,
    unit: '100g',
    source: row.source === 'usda' ? 'usda' : 'off',
    foodGroup: (row.foodGroup as FoodGroup | null) ?? null,
    novaGroup: row.novaGroup,
    nutriScore: row.nutriScore,
  }
}

async function readCache(key: string): Promise<{ hit: boolean; match: NutritionMatch | null }> {
  if (databaseUnavailable) return { hit: false, match: null }
  try {
    const row = await prisma.foodMatch.findUnique({ where: { normalizedName: key } })
    if (!row) return { hit: false, match: null }
    if (Date.now() - row.fetchedAt.getTime() > CACHE_TTL_MS) return { hit: false, match: null }
    return { hit: true, match: rowToMatch(row) }
  } catch {
    // A cache that is down must not take the lookup down with it.
    return { hit: false, match: null }
  }
}

async function writeCache(key: string, match: NutritionMatch | null): Promise<void> {
  if (databaseUnavailable) return
  const data = {
    source: match?.source ?? 'off',
    found: match != null,
    foodGroup: match?.foodGroup ?? null,
    novaGroup: match?.novaGroup ?? null,
    nutriScore: match?.nutriScore ?? null,
    caloriesKcal: match?.caloriesKcal ?? null,
    proteinG: match?.proteinG ?? null,
    carbsG: match?.carbsG ?? null,
    fatG: match?.fatG ?? null,
    sugarG: match?.sugarG ?? null,
    fiberG: match?.fiberG ?? null,
    sodiumMg: match?.sodiumMg ?? null,
    vitaminDMcg: match?.vitaminDMcg ?? null,
    ironMg: match?.ironMg ?? null,
    calciumMg: match?.calciumMg ?? null,
    matchConfidence: match?.matchConfidence ?? null,
    fetchedAt: new Date(),
  }
  try {
    await prisma.foodMatch.upsert({
      where: { normalizedName: key },
      create: { normalizedName: key, ...data },
      update: data,
    })
  } catch {
    // Best-effort cache write.
  }
}

/**
 * Resolve real per-100g nutrition for a product name via USDA FDC, falling back
 * to Open Food Facts. Returns null when neither source has a usable match — the
 * caller must surface an "unmatched" item, never fabricated numbers.
 */
export async function lookupNutrition(name: string): Promise<NutritionMatch | null> {
  const key = normalize(name)
  if (!key) return null

  const memoed = memo.get(key)
  if (memoed !== undefined) return memoed

  const cached = await readCache(key)
  if (cached.hit) {
    memo.set(key, cached.match)
    return cached.match
  }

  const found = (await fromUsda(key)) ?? (await fromOpenFoodFacts(key))
  const result = found && isPlausible(found) ? found : null

  memo.set(key, result)
  await writeCache(key, result)
  return result
}

const LOOKUP_CONCURRENCY = 5

/**
 * Look names up with bounded concurrency. A receipt used to cost one serial
 * round trip per line; this keeps a 30-item shop inside a serverless timeout
 * without opening 30 sockets at once.
 */
export async function lookupNutritionMany(
  names: string[],
): Promise<Map<string, NutritionMatch | null>> {
  const unique = Array.from(new Set(names.map(normalize).filter(Boolean)))
  const results = new Map<string, NutritionMatch | null>()
  let cursor = 0

  async function worker(): Promise<void> {
    while (cursor < unique.length) {
      const key = unique[cursor++]
      results.set(key, await lookupNutrition(key))
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(LOOKUP_CONCURRENCY, unique.length) }, () => worker()),
  )

  return results
}

export { normalize as normalizeFoodName }
