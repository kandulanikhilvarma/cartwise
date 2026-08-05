import type { GroceryItem } from '@/features/grocery/types'

export type NutritionMatch = Required<
  Pick<
    GroceryItem,
    | 'caloriesKcal'
    | 'proteinG'
    | 'carbsG'
    | 'fatG'
    | 'sodiumMg'
    | 'vitaminDMcg'
    | 'ironMg'
    | 'calciumMg'
  >
> & {
  matchConfidence: number
  unit: string
}

// ponytail: per-instance name cache. Values are stable per food name, so a
// process-lifetime Map is fine; move to Redis with the rate limiter in Phase 2.
const cache = new Map<string, NutritionMatch | null>()

// USDA FoodData Central nutrient numbers (values reported per 100 g).
const USDA_NUTRIENT = {
  energyKcal: '208',
  protein: '203',
  carbs: '205',
  fat: '204',
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

async function fromUsda(name: string): Promise<NutritionMatch | null> {
  const apiKey = process.env.USDA_FDC_API_KEY
  if (!apiKey) return null

  const url =
    `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${apiKey}` +
    `&query=${encodeURIComponent(name)}&pageSize=1&dataType=Foundation,SR%20Legacy`

  const response = await fetch(url, { cache: 'no-store' }).catch(() => null)
  if (!response || !response.ok) return null

  const payload = (await response.json().catch(() => null)) as {
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
    sodiumMg: pick(USDA_NUTRIENT.sodiumMg),
    vitaminDMcg: pick(USDA_NUTRIENT.vitaminDMcg),
    ironMg: pick(USDA_NUTRIENT.ironMg),
    calciumMg: pick(USDA_NUTRIENT.calciumMg),
    matchConfidence: 0.85,
    unit: '100g',
  }
}

async function fromOpenFoodFacts(name: string): Promise<NutritionMatch | null> {
  const url =
    `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(name)}` +
    `&search_simple=1&action=process&json=1&page_size=1`

  const response = await fetch(url, {
    headers: { 'user-agent': 'Cartwise/1.0', accept: 'application/json' },
    cache: 'no-store',
  }).catch(() => null)
  if (!response || !response.ok) return null

  const payload = (await response.json().catch(() => null)) as {
    products?: Array<{ nutriments?: Record<string, unknown> }>
  } | null

  const nutriments = payload?.products?.[0]?.nutriments
  if (!nutriments) return null

  const g = (key: string): number => num(nutriments[key])
  const caloriesKcal = g('energy-kcal_100g') || Math.round(g('energy_100g') / 4.184)
  const proteinG = g('proteins_100g')
  if (caloriesKcal === 0 && proteinG === 0) return null

  return {
    caloriesKcal,
    proteinG,
    carbsG: g('carbohydrates_100g'),
    fatG: g('fat_100g'),
    sodiumMg: round2(g('sodium_100g') * 1000), // g -> mg
    vitaminDMcg: round2(g('vitamin-d_100g') * 1_000_000), // g -> µg
    ironMg: round2(g('iron_100g') * 1000), // g -> mg
    calciumMg: round2(g('calcium_100g') * 1000), // g -> mg
    matchConfidence: 0.7,
    unit: '100g',
  }
}

/**
 * Resolve real per-100g nutrition for a product name via USDA FDC, falling back
 * to Open Food Facts. Returns null when neither source has a usable match — the
 * caller must surface an "unmatched" item, never fabricated numbers.
 */
export async function lookupNutrition(name: string): Promise<NutritionMatch | null> {
  const key = name.trim().toLowerCase()
  if (!key) return null

  const cached = cache.get(key)
  if (cached !== undefined) return cached

  const result = (await fromUsda(key)) ?? (await fromOpenFoodFacts(key))
  cache.set(key, result)
  return result
}
