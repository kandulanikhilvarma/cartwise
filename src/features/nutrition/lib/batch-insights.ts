import type { GroceryItem } from '@/features/grocery/types'
import { FOOD_GROUP_LABEL, type FoodGroup } from './food-group'
import {
  DAYS_IN_SHOP,
  householdSizeOf,
  rdaForProfile,
  shopReference,
  type NutrientProfile,
  type Rda,
} from './rda-constants'

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

/** Share of a week's supply for the household, as a percentage. */
function pct(value: number, weekly: number): number {
  return weekly > 0 ? (value / weekly) * 100 : 0
}

function days(value: number, weekly: number): string {
  if (weekly <= 0) return 'no reference'
  const supply = (value / weekly) * DAYS_IN_SHOP
  if (supply < 1) return `under a day’s worth`
  return `about ${supply.toFixed(supply < 10 ? 1 : 0)} days’ worth`
}

function forWhom(profile?: NutrientProfile | null): string {
  const size = householdSizeOf(profile)
  return size === 1 ? 'for one person' : `for ${size} people`
}

/** The nutrient running hardest against a week's supply. */
function findWatch(
  totals: NutrientTotals,
  weekly: Rda,
  items: GroceryItem[],
  profile?: NutrientProfile | null,
): Signal | null {
  const who = forWhom(profile)
  const candidates: Array<{ label: string; share: number; note: string }> = [
    {
      label: 'Sodium',
      share: pct(totals.sodiumMg, weekly.sodiumMg),
      note: `${round(totals.sodiumMg).toLocaleString()} mg in the shop — ${days(totals.sodiumMg, weekly.sodiumMg)} ${who}`,
    },
    {
      label: 'Sugar',
      share: pct(totals.sugarG, weekly.sugarG),
      note: `${round(totals.sugarG)} g in the shop — ${days(totals.sugarG, weekly.sugarG)} ${who}`,
    },
    {
      label: 'Fat',
      share: pct(totals.fatG, weekly.fatG),
      note: `${round(totals.fatG)} g in the shop — ${days(totals.fatG, weekly.fatG)} ${who}`,
    },
  ]

  const heaviest = candidates.sort((a, b) => b.share - a.share)[0]
  if (heaviest && heaviest.share >= 100) {
    return { kind: 'watch', label: heaviest.label, note: heaviest.note }
  }

  // Nothing is running high by mass, so processing level is the honest concern.
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
function findGap(
  totals: NutrientTotals,
  weekly: Rda,
  items: GroceryItem[],
  profile?: NutrientProfile | null,
  nutrientsKnown = true,
): Signal | null {
  const produce = items.filter((item) => item.foodGroup === 'produce').length
  if (produce === 0 && items.length > 0) {
    return {
      kind: 'gap',
      label: 'Fresh produce',
      note: 'No fruit or vegetables matched in this shop',
    }
  }
  // With nothing weighed every nutrient total is zero, and "0 µg of vitamin D"
  // would be a claim about the shop made from no data at all.
  if (!nutrientsKnown) return null

  const who = forWhom(profile)
  const candidates: Array<{ label: string; share: number; note: string }> = [
    {
      label: 'Vitamin D',
      share: pct(totals.vitaminDMcg, weekly.vitaminDMcg),
      note: `${totals.vitaminDMcg.toFixed(1)} µg — ${days(totals.vitaminDMcg, weekly.vitaminDMcg)} ${who}`,
    },
    {
      label: 'Fibre',
      share: pct(totals.fiberG, weekly.fiberG),
      note: `${round(totals.fiberG)} g — ${days(totals.fiberG, weekly.fiberG)} ${who}`,
    },
    {
      label: 'Iron',
      share: pct(totals.ironMg, weekly.ironMg),
      note: `${totals.ironMg.toFixed(1)} mg — ${days(totals.ironMg, weekly.ironMg)} ${who}`,
    },
    {
      label: 'Calcium',
      share: pct(totals.calciumMg, weekly.calciumMg),
      note: `${round(totals.calciumMg).toLocaleString()} mg — ${days(totals.calciumMg, weekly.calciumMg)} ${who}`,
    },
  ]

  const scarcest = candidates.sort((a, b) => a.share - b.share)[0]
  return scarcest ? { kind: 'gap', label: scarcest.label, note: scarcest.note } : null
}

/** Something that went right, named specifically. */
function findWin(
  totals: NutrientTotals,
  weekly: Rda,
  items: GroceryItem[],
  profile?: NutrientProfile | null,
): Signal | null {
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

  const who = forWhom(profile)

  if (pct(totals.fiberG, weekly.fiberG) >= 100) {
    return {
      kind: 'win',
      label: 'Fibre',
      note: `${round(totals.fiberG)} g — a full week ${who}`,
    }
  }

  if (pct(totals.proteinG, weekly.proteinG) >= 100) {
    return {
      kind: 'win',
      label: 'Protein',
      note: `${round(totals.proteinG)} g — a full week ${who}`,
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

  const weekly = shopReference(profile)
  const { totals, coverage } = computeBatchTotals(items)

  // Group counts survive without weights; nutrient claims do not.
  const nutrientSignalsPossible = coverage.weighed > 0
  const usable = nutrientSignalsPossible ? totals : EMPTY_TOTALS

  const signals: Array<Signal | null> = [
    nutrientSignalsPossible ? findWatch(totals, weekly, items, profile) : null,
    findGap(usable, weekly, items, profile, nutrientSignalsPossible),
    findWin(usable, weekly, items, profile),
  ]

  return signals.filter((signal): signal is Signal => signal !== null)
}

export { rdaForProfile, shopReference }

export type SpendSummary = {
  total: number
  itemsPriced: number
  byGroup: Array<{ group: FoodGroup; label: string; spend: number }>
  costPerProteinGram: number | null
}

/**
 * What the shop cost, from the prices already printed on the receipt. The
 * printed amount is the extended line total, so it is never multiplied by
 * quantity — "2 x BREAD 4.90" means 4.90 for both.
 */
export function computeSpend(items: GroceryItem[]): SpendSummary | null {
  const priced = items.filter(
    (item) => typeof item.linePrice === 'number' && Number.isFinite(item.linePrice),
  )
  if (priced.length === 0) return null

  const total = priced.reduce((sum, item) => sum + (item.linePrice ?? 0), 0)

  const groupSpend = new Map<FoodGroup, number>()
  for (const item of priced) {
    const group = item.foodGroup as FoodGroup | null | undefined
    if (!group) continue
    groupSpend.set(group, (groupSpend.get(group) ?? 0) + (item.linePrice ?? 0))
  }

  // Price per gram of protein only means something over lines that have all
  // three: a price, a weight and a match. Dividing the whole shop's spend by
  // the protein of the weighed lines alone inflated it.
  const costed = priced.filter((item) => item.packGrams != null && item.proteinG != null)
  const costedSpend = costed.reduce((sum, item) => sum + (item.linePrice ?? 0), 0)
  const costedProtein = computeBatchTotals(costed).totals.proteinG

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
    costPerProteinGram:
      costedProtein > 0 ? Math.round((costedSpend / costedProtein) * 100) / 100 : null,
  }
}
