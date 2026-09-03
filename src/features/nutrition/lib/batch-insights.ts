import type { GroceryItem } from '@/features/grocery/types'
import { FOOD_GROUP_LABEL, type FoodGroup } from './food-group'
import { rdaForProfile, type NutrientProfile, type Rda } from './rda-constants'

export type NutrientTotals = {
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
}

export type BatchCoverage = {
  /** Items whose nutrition resolved to a real source. */
  matched: number
  /** Matched items that also stated a mass, so they can enter the totals. */
  weighed: number
  total: number
  /** Grams of food the totals actually describe. */
  totalGrams: number
}

export type BatchTotals = {
  totals: NutrientTotals
  coverage: BatchCoverage
}

const EMPTY_TOTALS: NutrientTotals = {
  caloriesKcal: 0,
  proteinG: 0,
  carbsG: 0,
  fatG: 0,
  sugarG: 0,
  fiberG: 0,
  sodiumMg: 0,
  vitaminDMcg: 0,
  ironMg: 0,
  calciumMg: 0,
}

const NUTRIENT_KEYS = Object.keys(EMPTY_TOTALS) as Array<keyof NutrientTotals>

/**
 * The mass an item contributes, in grams. Nutrition arrives per 100 g, so an
 * item with no stated mass cannot enter a total — adding its per-100g figures
 * would report "one arbitrary 100 g portion" as if it were the purchase.
 */
export function itemGrams(item: GroceryItem): number | null {
  if (typeof item.packGrams !== 'number' || !Number.isFinite(item.packGrams) || item.packGrams <= 0) {
    return null
  }
  const quantity =
    typeof item.quantity === 'number' && Number.isFinite(item.quantity) && item.quantity > 0
      ? item.quantity
      : 1
  return item.packGrams * quantity
}

export function isMatched(item: GroceryItem): boolean {
  return item.matchConfidence != null
}

/**
 * Batch totals scaled by real mass. Items without a stated weight are counted
 * in `coverage` and excluded from the figures rather than guessed at.
 */
export function computeBatchTotals(items: GroceryItem[]): BatchTotals {
  const totals: NutrientTotals = { ...EMPTY_TOTALS }
  let weighed = 0
  let totalGrams = 0

  for (const item of items) {
    if (!isMatched(item)) continue
    const grams = itemGrams(item)
    if (grams === null) continue

    weighed += 1
    totalGrams += grams
    const scale = grams / 100

    for (const key of NUTRIENT_KEYS) {
      const per100g = item[key]
      if (typeof per100g === 'number' && Number.isFinite(per100g)) {
        totals[key] += per100g * scale
      }
    }
  }

  return {
    totals,
    coverage: {
      matched: items.filter(isMatched).length,
      weighed,
      total: items.length,
      totalGrams: Math.round(totalGrams),
    },
  }
}

export type SignalKind = 'watch' | 'gap' | 'win'

export type Signal = {
  kind: SignalKind
  label: string
  note: string
}

function round(value: number): number {
  return Math.round(value)
}

function pct(value: number, reference: number): number {
  return reference > 0 ? (value / reference) * 100 : 0
}

/** The nutrient running hardest against its reference. */
function findWatch(totals: NutrientTotals, rda: Rda, items: GroceryItem[]): Signal | null {
  const candidates: Array<{ label: string; share: number; note: string }> = [
    {
      label: 'Sodium',
      share: pct(totals.sodiumMg, rda.sodiumMg),
      note: `${round(totals.sodiumMg)} mg across the shop, against a ${rda.sodiumMg} mg daily reference`,
    },
    {
      label: 'Sugar',
      share: pct(totals.sugarG, rda.sugarG),
      note: `${round(totals.sugarG)} g across the shop, against a ${rda.sugarG} g daily reference`,
    },
    {
      label: 'Saturated-fat load',
      share: pct(totals.fatG, rda.fatG),
      note: `${round(totals.fatG)} g of total fat, against a ${rda.fatG} g daily reference`,
    },
  ]

  const heaviest = candidates.sort((a, b) => b.share - a.share)[0]
  if (heaviest && heaviest.share >= 100) {
    return { kind: 'watch', label: heaviest.label, note: heaviest.note }
  }

  // Nothing is running high on mass, so processing level is the honest concern.
  const ultraProcessed = items.filter((item) => item.novaGroup === 4).length
  if (ultraProcessed >= 3) {
    return {
      kind: 'watch',
      label: 'Processed items',
      note: `${ultraProcessed} items are ultra-processed (NOVA group 4)`,
    }
  }

  return heaviest && heaviest.share > 0
    ? { kind: 'watch', label: heaviest.label, note: heaviest.note }
    : null
}

/** What the shop is missing, rather than what it has too much of. */
function findGap(totals: NutrientTotals, rda: Rda, items: GroceryItem[]): Signal | null {
  const produce = items.filter((item) => item.foodGroup === 'produce').length
  if (produce === 0 && items.length > 0) {
    return {
      kind: 'gap',
      label: 'Fresh produce',
      note: 'No fruit or vegetables matched in this shop',
    }
  }

  const candidates: Array<{ label: string; share: number; note: string }> = [
    {
      label: 'Vitamin D',
      share: pct(totals.vitaminDMcg, rda.vitaminDMcg),
      note: `${totals.vitaminDMcg.toFixed(1)} µg against a ${rda.vitaminDMcg} µg daily reference`,
    },
    {
      label: 'Fibre',
      share: pct(totals.fiberG, rda.fiberG),
      note: `${round(totals.fiberG)} g against a ${rda.fiberG} g daily reference`,
    },
    {
      label: 'Iron',
      share: pct(totals.ironMg, rda.ironMg),
      note: `${totals.ironMg.toFixed(1)} mg against a ${rda.ironMg} mg daily reference`,
    },
    {
      label: 'Calcium',
      share: pct(totals.calciumMg, rda.calciumMg),
      note: `${round(totals.calciumMg)} mg against a ${rda.calciumMg} mg daily reference`,
    },
  ]

  const scarcest = candidates.sort((a, b) => a.share - b.share)[0]
  return scarcest ? { kind: 'gap', label: scarcest.label, note: scarcest.note } : null
}

/** Something that went right, named specifically. */
function findWin(totals: NutrientTotals, rda: Rda, items: GroceryItem[]): Signal | null {
  const groups = new Map<FoodGroup, number>()
  for (const item of items) {
    const group = item.foodGroup as FoodGroup | null | undefined
    if (group) groups.set(group, (groups.get(group) ?? 0) + 1)
  }

  const produce = groups.get('produce') ?? 0
  if (produce >= 3) {
    return {
      kind: 'win',
      label: FOOD_GROUP_LABEL.produce,
      note: `${produce} fruit and vegetable items in this shop`,
    }
  }

  if (pct(totals.fiberG, rda.fiberG) >= 100) {
    return {
      kind: 'win',
      label: 'Fibre',
      note: `${round(totals.fiberG)} g — past the ${rda.fiberG} g daily reference`,
    }
  }

  if (pct(totals.proteinG, rda.proteinG) >= 100) {
    return {
      kind: 'win',
      label: 'Protein',
      note: `${round(totals.proteinG)} g — past the ${rda.proteinG} g daily reference`,
    }
  }

  const unprocessed = items.filter((item) => item.novaGroup === 1).length
  if (unprocessed >= 3) {
    return {
      kind: 'win',
      label: 'Unprocessed food',
      note: `${unprocessed} items are unprocessed or minimally processed`,
    }
  }

  return produce > 0
    ? {
        kind: 'win',
        label: FOOD_GROUP_LABEL.produce,
        note: `${produce} fruit and vegetable ${produce === 1 ? 'item' : 'items'} in this shop`,
      }
    : null
}

/**
 * One thing to watch, one gap, one win — the read the homepage promises.
 * Returns fewer than three signals when the data cannot honestly support them.
 */
export function computeBatchSignals(
  items: GroceryItem[],
  profile?: NutrientProfile | null,
): Signal[] {
  if (items.length === 0) return []

  const rda = rdaForProfile(profile)
  const { totals, coverage } = computeBatchTotals(items)

  // Group counts survive without weights, but nutrient signals do not.
  const nutrientSignalsPossible = coverage.weighed > 0

  const signals: Array<Signal | null> = [
    nutrientSignalsPossible ? findWatch(totals, rda, items) : null,
    findGap(nutrientSignalsPossible ? totals : EMPTY_TOTALS, rda, items),
    findWin(nutrientSignalsPossible ? totals : EMPTY_TOTALS, rda, items),
  ]

  return signals.filter((signal): signal is Signal => signal !== null)
}

export type SpendSummary = {
  total: number
  itemsPriced: number
  byGroup: Array<{ group: FoodGroup; label: string; spend: number }>
  costPerProteinGram: number | null
}

/** What the shop cost, from the prices already printed on the receipt. */
export function computeSpend(items: GroceryItem[]): SpendSummary | null {
  const priced = items.filter(
    (item) => typeof item.unitPrice === 'number' && Number.isFinite(item.unitPrice),
  )
  if (priced.length === 0) return null

  const total = priced.reduce((sum, item) => sum + (item.unitPrice ?? 0) * (item.quantity || 1), 0)

  const groupSpend = new Map<FoodGroup, number>()
  for (const item of priced) {
    const group = item.foodGroup as FoodGroup | null | undefined
    if (!group) continue
    groupSpend.set(group, (groupSpend.get(group) ?? 0) + (item.unitPrice ?? 0) * (item.quantity || 1))
  }

  const { totals } = computeBatchTotals(items)

  return {
    total: Math.round(total * 100) / 100,
    itemsPriced: priced.length,
    byGroup: Array.from(groupSpend.entries())
      .map(([group, spend]) => ({
        group,
        label: FOOD_GROUP_LABEL[group],
        spend: Math.round(spend * 100) / 100,
      }))
      .sort((a, b) => b.spend - a.spend),
    costPerProteinGram: totals.proteinG > 0 ? Math.round((total / totals.proteinG) * 100) / 100 : null,
  }
}
