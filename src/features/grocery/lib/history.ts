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

export type UseItUpItem = {
  productName: string
  batchId: string
  daysAgo: number
}

const PERISHABLE = new Set(['produce', 'protein', 'dairy'])
const DAY_MS = 24 * 60 * 60 * 1000

/**
 * Fresh food from recent shops that is not marked eaten yet, oldest first
 * (PRD user story: "remind me about food I bought but haven't consumed").
 * Two to ten days old: a same-day shop needs no reminder, and past ten days
 * the food is gone one way or another.
 */
export function findUseItUp(batches: GroceryBatch[], now = Date.now(), limit = 8): UseItUpItem[] {
  const found: UseItUpItem[] = []
  for (const batch of batches) {
    const daysAgo = Math.floor((now - new Date(batch.purchasedAt).getTime()) / DAY_MS)
    if (daysAgo < 2 || daysAgo > 10) continue
    for (const item of batch.items) {
      if (item.consumed || !item.foodGroup || !PERISHABLE.has(item.foodGroup)) continue
      found.push({ productName: item.productName, batchId: batch.id, daysAgo })
    }
  }
  return found.sort((a, b) => b.daysAgo - a.daysAgo).slice(0, limit)
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

  // Pounds and dollars do not add up. The newest shop's currency is the one
  // shown, so only shops in that currency (or with none printed) are summed.
  const currency = batches.find((batch) => batch.currency)?.currency ?? null
  const spends = batches
    .filter((batch) => !currency || !batch.currency || batch.currency === currency)
    .map(batchSpend)
    .filter((value): value is number => value !== null)

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
    currency,
    shops,
    frequent: Array.from(counts.values())
      .filter((entry) => entry.timesBought > 1)
      .sort((a, b) => b.timesBought - a.timesBought || b.lastBought.localeCompare(a.lastBought))
      .slice(0, 8),
    produceChange,
  }
}
