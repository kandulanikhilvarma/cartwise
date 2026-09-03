import type { GroceryBatch, GroceryItem } from '@/features/grocery/types'
import { computeBatchTotals, computeSpend } from '@/features/nutrition/lib/batch-insights'

export type ShopPoint = {
  batchId: string
  label: string
  purchasedAt: string
  itemCount: number
  spend: number | null
  produceCount: number
}

export type FrequentItem = {
  productName: string
  timesBought: number
  lastBought: string
}

export type History = {
  batchCount: number
  itemCount: number
  matchedCount: number
  weighedCount: number
  totalSpend: number | null
  currency: string | null
  /** Oldest first, so a chart reads left to right. */
  shops: ShopPoint[]
  frequent: FrequentItem[]
  produceChange: number | null
}

function batchSpend(batch: GroceryBatch): number | null {
  if (typeof batch.totalSpend === 'number') return batch.totalSpend
  return computeSpend(batch.items)?.total ?? null
}

function produceCount(items: GroceryItem[]): number {
  return items.filter((item) => item.foodGroup === 'produce').length
}

/**
 * The across-batches view. Every scan used to be an island, which made the
 * weekly-shopper premise impossible to act on.
 */
export function summarizeHistory(batches: GroceryBatch[]): History {
  const items = batches.flatMap((batch) => batch.items)

  const shops: ShopPoint[] = [...batches]
    .sort((a, b) => a.purchasedAt.localeCompare(b.purchasedAt))
    .map((batch) => ({
      batchId: batch.id,
      label: batch.storeName ?? 'Grocery batch',
      purchasedAt: batch.purchasedAt,
      itemCount: batch.items.length,
      spend: batchSpend(batch),
      produceCount: produceCount(batch.items),
    }))

  const counts = new Map<string, FrequentItem>()
  for (const batch of batches) {
    // One batch counts once per product, however many lines it appeared on.
    const namesInBatch = new Set<string>()
    for (const item of batch.items) {
      const key = item.productName.toLowerCase()
      if (namesInBatch.has(key)) continue
      namesInBatch.add(key)

      const existing = counts.get(key)
      if (existing) {
        existing.timesBought += 1
        if (batch.purchasedAt > existing.lastBought) existing.lastBought = batch.purchasedAt
      } else {
        counts.set(key, {
          productName: item.productName,
          timesBought: 1,
          lastBought: batch.purchasedAt,
        })
      }
    }
  }

  const spends = shops.map((shop) => shop.spend).filter((value): value is number => value !== null)

  const lastTwo = shops.slice(-2)
  const produceChange =
    lastTwo.length === 2 ? lastTwo[1].produceCount - lastTwo[0].produceCount : null

  const { coverage } = computeBatchTotals(items)

  return {
    batchCount: batches.length,
    itemCount: items.length,
    matchedCount: coverage.matched,
    weighedCount: coverage.weighed,
    totalSpend: spends.length ? Math.round(spends.reduce((a, b) => a + b, 0) * 100) / 100 : null,
    currency: batches.find((batch) => batch.currency)?.currency ?? null,
    shops,
    frequent: Array.from(counts.values())
      .filter((entry) => entry.timesBought > 1)
      .sort((a, b) => b.timesBought - a.timesBought || b.lastBought.localeCompare(a.lastBought))
      .slice(0, 8),
    produceChange,
  }
}
