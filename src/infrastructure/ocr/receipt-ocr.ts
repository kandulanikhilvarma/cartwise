import type { GroceryItem } from '@/features/grocery/types'
import { lookupNutritionMany, normalizeFoodName } from '@/infrastructure/services/food-lookup'
import {
  deriveStoreName,
  detectCurrency,
  extractTotalSpend,
  parseItemLines,
  parseReceiptDate,
} from './receipt-parse'

export type ReceiptParseResult = {
  storeName: string | null
  purchasedAt: Date | null
  totalSpend: number | null
  currency: string | null
  itemsTruncated: boolean
  items: GroceryItem[]
}

// A weekly shop runs to about 40 lines. The cap exists to bound the request,
// not to hide items, so crossing it is reported rather than silently applied.
const MAX_ITEMS = 60

async function buildItems(lines: string[]): Promise<{ items: GroceryItem[]; truncated: boolean }> {
  // No de-duplication by name: "YOGURT 500g" and "YOGURT 150g" are two
  // purchases. Overlap between photos is removed on the device (joinPages).
  const all = parseItemLines(lines)
  const parsed = all.slice(0, MAX_ITEMS)
  const truncated = all.length > MAX_ITEMS

  const matches = await lookupNutritionMany(parsed.map((line) => line.productName))

  const items = parsed.map((line, index) => {
    const match = matches.get(normalizeFoodName(line.productName)) ?? null
    return {
      id: `item-${Date.now()}-${index}`,
      productName: line.productName,
      quantity: line.quantity,
      packGrams: line.packGrams,
      linePrice: line.linePrice,
      unit: match?.unit ?? null,
      matchConfidence: match?.matchConfidence ?? null,
      matchSource: match?.source ?? null,
      allergens: match?.allergens ?? [],
      additives: match?.additives ?? [],
      foodGroup: match?.foodGroup ?? null,
      novaGroup: match?.novaGroup ?? null,
      nutriScore: match?.nutriScore ?? null,
      caloriesKcal: match?.caloriesKcal ?? null,
      proteinG: match?.proteinG ?? null,
      carbsG: match?.carbsG ?? null,
      fatG: match?.fatG ?? null,
      sugarG: match?.sugarG ?? null,
      fiberG: match?.fiberG ?? null,
      sodiumMg: match?.sodiumMg ?? null,
      vitaminDMcg: match?.vitaminDMcg ?? null,
      ironMg: match?.ironMg ?? null,
      calciumMg: match?.calciumMg ?? null,
      consumed: false,
      consumedAt: null,
    } satisfies GroceryItem
  })

  return { items, truncated }
}

/**
 * Parse raw OCR text lines (produced client-side by Tesseract) into grocery
 * items with real nutrition. OCR itself runs in the browser so this stays a
 * fast, serverless-safe request with no background job.
 */
export async function parseReceiptLines(lines: string[]): Promise<ReceiptParseResult> {
  const { items, truncated } = await buildItems(lines)

  return {
    storeName: deriveStoreName(lines),
    purchasedAt: parseReceiptDate(lines),
    totalSpend: extractTotalSpend(lines),
    currency: detectCurrency(lines),
    itemsTruncated: truncated,
    items,
  }
}
