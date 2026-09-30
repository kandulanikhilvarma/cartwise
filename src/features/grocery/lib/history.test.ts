import { describe, expect, it } from 'vitest'
import { summarizeHistory } from './history'
import type { GroceryBatch } from '@/features/grocery/types'

function batch(overrides: Partial<GroceryBatch>): GroceryBatch {
  return {
    id: 'b',
    storeName: null,
    ocrStatus: 'done',
    purchasedAt: '2026-09-01T00:00:00.000Z',
    totalSpend: null,
    currency: null,
    itemsTruncated: false,
    items: [],
    ...overrides,
  }
}

describe('summarizeHistory', () => {
  it('does not add shops in different currencies [C-17]', () => {
    const history = summarizeHistory([
      batch({ id: 'new', purchasedAt: '2026-09-20T00:00:00.000Z', currency: 'GBP', totalSpend: 40 }),
      batch({ id: 'old', purchasedAt: '2026-09-10T00:00:00.000Z', currency: 'USD', totalSpend: 60 }),
      batch({ id: 'plain', purchasedAt: '2026-09-05T00:00:00.000Z', totalSpend: 10 }),
    ])
    expect(history.currency).toBe('GBP')
    expect(history.totalSpend).toBe(50)
  })

  it('counts a product once per shop for "buy again"', () => {
    const milk = { id: 'i', productName: 'Milk', quantity: 1, matchConfidence: null }
    const history = summarizeHistory([
      batch({ id: 'a', items: [milk, milk] }),
      batch({ id: 'b', items: [milk] }),
    ])
    expect(history.frequent).toEqual([
      expect.objectContaining({ productName: 'Milk', timesBought: 2 }),
    ])
  })
})
