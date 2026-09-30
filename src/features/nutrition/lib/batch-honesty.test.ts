import { describe, expect, it } from 'vitest'
import { computeBatchSignals, computeSpend } from './batch-insights'
import type { GroceryItem } from '@/features/grocery/types'

function item(overrides: Partial<GroceryItem>): GroceryItem {
  return { id: 'x', productName: 'x', quantity: 1, matchConfidence: 0.85, ...overrides }
}

describe('claims made without data', () => {
  it('names no nutrient gap when nothing is weighed [C-8]', () => {
    const items = [
      item({ productName: 'Apples', foodGroup: 'produce', packGrams: null, vitaminDMcg: 0 }),
      item({ productName: 'Pears', foodGroup: 'produce', packGrams: null }),
    ]
    const gap = computeBatchSignals(items).find((signal) => signal.kind === 'gap')
    expect(gap).toBeUndefined()
  })

  it('prices protein only over lines with a price, a weight and a match [C-9]', () => {
    const items = [
      // 500 g at 20 g protein per 100 g = 100 g protein for 5.00.
      item({ productName: 'Chicken', linePrice: 5, packGrams: 500, proteinG: 20 }),
      // Priced but unweighed: its 10.00 must not be divided by the chicken's protein.
      item({ productName: 'Wine', linePrice: 10, packGrams: null, proteinG: null }),
    ]
    expect(computeSpend(items)?.costPerProteinGram).toBe(0.05)
    expect(computeSpend(items)?.total).toBe(15)
  })
})
