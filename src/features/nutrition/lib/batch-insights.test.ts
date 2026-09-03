import { describe, it, expect } from 'vitest'
import {
  computeBatchSignals,
  computeBatchTotals,
  computeSpend,
  itemGrams,
} from './batch-insights'
import { rdaForProfile, RDA } from './rda-constants'
import { classifyFoodGroup } from './food-group'
import type { GroceryItem } from '@/features/grocery/types'

function item(overrides: Partial<GroceryItem>): GroceryItem {
  return { id: 'x', productName: 'x', quantity: 1, matchConfidence: 0.85, ...overrides }
}

describe('itemGrams', () => {
  it('multiplies pack mass by quantity', () => {
    expect(itemGrams(item({ packGrams: 500, quantity: 2 }))).toBe(1000)
  })

  it('returns null when the receipt did not state a mass', () => {
    expect(itemGrams(item({ packGrams: null }))).toBeNull()
    expect(itemGrams(item({ packGrams: 0 }))).toBeNull()
  })
})

describe('computeBatchTotals', () => {
  it('scales per-100g figures by real mass', () => {
    // 500 g of something at 61 kcal/100 g is 305 kcal, not 61.
    const { totals } = computeBatchTotals([item({ packGrams: 500, caloriesKcal: 61, proteinG: 3.2 })])
    expect(totals.caloriesKcal).toBeCloseTo(305)
    expect(totals.proteinG).toBeCloseTo(16)
  })

  it('excludes items with no stated mass instead of counting them as 100 g', () => {
    const { totals, coverage } = computeBatchTotals([
      item({ packGrams: 200, caloriesKcal: 100 }),
      item({ packGrams: null, caloriesKcal: 900 }),
    ])
    expect(totals.caloriesKcal).toBeCloseTo(200)
    expect(coverage.weighed).toBe(1)
    expect(coverage.total).toBe(2)
  })

  it('excludes unmatched items from totals but counts them', () => {
    const { totals, coverage } = computeBatchTotals([
      item({ packGrams: 100, caloriesKcal: 50, matchConfidence: null }),
    ])
    expect(totals.caloriesKcal).toBe(0)
    expect(coverage.matched).toBe(0)
    expect(coverage.total).toBe(1)
  })

  it('reports the mass the totals actually describe', () => {
    const { coverage } = computeBatchTotals([
      item({ packGrams: 250, caloriesKcal: 10 }),
      item({ packGrams: 750, caloriesKcal: 10 }),
    ])
    expect(coverage.totalGrams).toBe(1000)
  })
})

describe('computeBatchSignals', () => {
  it('returns nothing for an empty batch', () => {
    expect(computeBatchSignals([])).toEqual([])
  })

  it('names sodium as the thing to watch when it runs past the reference', () => {
    const signals = computeBatchSignals([
      item({ packGrams: 1000, sodiumMg: 400, foodGroup: 'pantry' }),
    ])
    const watch = signals.find((signal) => signal.kind === 'watch')
    expect(watch?.label).toBe('Sodium')
  })

  it('calls out missing produce as the gap', () => {
    const signals = computeBatchSignals([item({ packGrams: 500, foodGroup: 'snack' })])
    const gap = signals.find((signal) => signal.kind === 'gap')
    expect(gap?.label).toBe('Fresh produce')
  })

  it('names produce as the win when the shop has several', () => {
    const produce = [1, 2, 3].map((n) =>
      item({ id: `p${n}`, packGrams: 200, foodGroup: 'produce', fiberG: 2 }),
    )
    const win = computeBatchSignals(produce).find((signal) => signal.kind === 'win')
    expect(win?.label).toBe('Fresh produce')
    expect(win?.note).toContain('3')
  })

  it('still reports group signals when no item has a weight', () => {
    const signals = computeBatchSignals([
      item({ packGrams: null, foodGroup: 'produce' }),
      item({ id: 'b', packGrams: null, foodGroup: 'produce' }),
    ])
    // No weights means no nutrient claim, but produce can still be counted.
    expect(signals.every((signal) => signal.kind !== 'watch')).toBe(true)
    expect(signals.find((signal) => signal.kind === 'win')?.label).toBe('Fresh produce')
  })
})

describe('computeSpend', () => {
  it('returns null when the receipt carried no prices', () => {
    expect(computeSpend([item({ unitPrice: null })])).toBeNull()
  })

  it('totals price by quantity and groups it', () => {
    const spend = computeSpend([
      item({ unitPrice: 2.5, quantity: 2, foodGroup: 'produce' }),
      item({ id: 'b', unitPrice: 4, quantity: 1, foodGroup: 'protein' }),
    ])
    expect(spend?.total).toBe(9)
    // Sorted by spend: produce is 2.50 x 2, protein is 4.00 x 1.
    expect(spend?.byGroup[0]).toMatchObject({ group: 'produce', spend: 5 })
    expect(spend?.byGroup[1]).toMatchObject({ group: 'protein', spend: 4 })
  })
})

describe('rdaForProfile', () => {
  it('falls back to the average adult reference with no profile', () => {
    expect(rdaForProfile(null)).toEqual(RDA)
  })

  it('raises iron for women under 50 and lowers it after', () => {
    expect(rdaForProfile({ sex: 'female', ageYears: 30 }).ironMg).toBe(18)
    expect(rdaForProfile({ sex: 'female', ageYears: 55 }).ironMg).toBe(8)
    expect(rdaForProfile({ sex: 'male', ageYears: 30 }).ironMg).toBe(8)
  })

  it('scales energy with the activity factor', () => {
    const sedentary = rdaForProfile({ sex: 'male', activityFactor: 1.2 })
    const active = rdaForProfile({ sex: 'male', activityFactor: 1.8 })
    expect(active.caloriesKcal).toBeGreaterThan(sedentary.caloriesKcal)
  })
})

describe('classifyFoodGroup', () => {
  it('files common groceries into groups', () => {
    expect(classifyFoodGroup('Organic Bananas')).toBe('produce')
    expect(classifyFoodGroup('Whole Milk')).toBe('dairy')
    expect(classifyFoodGroup('Chicken Breast')).toBe('protein')
    expect(classifyFoodGroup('Sourdough Bread')).toBe('grain')
  })

  it('prefers the more specific rule', () => {
    expect(classifyFoodGroup('Coconut Water')).toBe('drink')
  })

  it('returns null rather than guessing', () => {
    expect(classifyFoodGroup('Zzyzx 4000')).toBeNull()
  })
})
