import { describe, expect, it } from 'vitest'
import { findUseItUp, summarizeHistory } from './history'
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

  it('lists fresh food not yet eaten from 2-10 day old shops, oldest first [N-2]', () => {
    const now = Date.parse('2026-09-20T12:00:00.000Z')
    const food = (productName: string, foodGroup: string, consumed = false) => ({
      id: productName,
      productName,
      quantity: 1,
      matchConfidence: 1,
      foodGroup,
      consumed,
    })
    const list = findUseItUp(
      [
        batch({ id: 'today', purchasedAt: '2026-09-20T00:00:00.000Z', items: [food('Kale', 'produce')] }),
        batch({
          id: 'recent',
          purchasedAt: '2026-09-17T00:00:00.000Z',
          items: [food('Milk', 'dairy'), food('Rice', 'pantry'), food('Eggs', 'protein', true)],
        }),
        batch({ id: 'older', purchasedAt: '2026-09-12T00:00:00.000Z', items: [food('Spinach', 'produce')] }),
        batch({ id: 'old', purchasedAt: '2026-09-01T00:00:00.000Z', items: [food('Apples', 'produce')] }),
      ],
      now,
    )
    expect(list.map((entry) => entry.productName)).toEqual(['Spinach', 'Milk'])
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
