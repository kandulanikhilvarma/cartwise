import { describe, it, expect } from 'vitest'
import { computeBatchInsights } from './batch-insights'
import { RDA } from './rda-constants'
import type { GroceryItem } from '@/features/grocery/types'

function item(overrides: Partial<GroceryItem>): GroceryItem {
  return { id: 'x', productName: 'x', quantity: 1, ...overrides }
}

describe('computeBatchInsights', () => {
  it('warns when calories exceed the RDA', () => {
    const [calories] = computeBatchInsights([item({ caloriesKcal: RDA.caloriesKcal + 1 })])
    expect(calories.tone).toBe('warning')
  })

  it('warns when sodium exceeds the RDA upper limit', () => {
    const insights = computeBatchInsights([item({ sodiumMg: RDA.sodiumMg + 1 })])
    expect(insights.find((i) => i.label === 'Sodium')!.tone).toBe('warning')
  })

  it('flags zero vitamin D sources as a warning', () => {
    const insights = computeBatchInsights([item({ vitaminDMcg: 0 })])
    expect(insights.find((i) => i.label === 'Vitamin D sources')!.tone).toBe('warning')
  })

  it('treats null nutrients as zero (unmatched items do not fake totals)', () => {
    const [calories] = computeBatchInsights([item({ caloriesKcal: null })])
    expect(calories.value).toBe('0 kcal')
  })
})
