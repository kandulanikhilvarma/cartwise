import { recognize } from 'tesseract.js'
import type { GroceryItem } from '@/features/grocery/types'
import { lookupNutrition } from '@/infrastructure/services/food-lookup'
import { cleanLine, deriveProductName, deriveStoreName, extractQuantity, isNoiseLine } from './receipt-parse'

type ReceiptParseResult = {
  storeName: string | null
  items: GroceryItem[]
}

const MAX_ITEMS = 12

async function buildItems(lines: string[]): Promise<GroceryItem[]> {
  const items: GroceryItem[] = []
  const seen = new Set<string>()

  for (const rawLine of lines) {
    if (items.length >= MAX_ITEMS) {
      break
    }

    const line = cleanLine(rawLine)
    if (isNoiseLine(line)) {
      continue
    }

    const productName = deriveProductName(line)
    const normalizedKey = productName.toLowerCase()
    if (seen.has(normalizedKey)) {
      continue
    }
    seen.add(normalizedKey)

    const quantity = extractQuantity(line)
    // Real per-100g nutrition from USDA/OFF. No match -> null fields; the item
    // is surfaced as "unmatched" rather than backfilled with fake numbers.
    const match = await lookupNutrition(productName)

    items.push({
      id: `item-${Date.now()}-${items.length}`,
      productName,
      quantity,
      unit: match?.unit ?? null,
      matchConfidence: match?.matchConfidence ?? null,
      caloriesKcal: match?.caloriesKcal ?? null,
      proteinG: match?.proteinG ?? null,
      carbsG: match?.carbsG ?? null,
      fatG: match?.fatG ?? null,
      sodiumMg: match?.sodiumMg ?? null,
      vitaminDMcg: match?.vitaminDMcg ?? null,
      ironMg: match?.ironMg ?? null,
      calciumMg: match?.calciumMg ?? null,
      consumed: false,
      consumedAt: null,
    })
  }

  return items
}

export async function extractReceiptItems(file: File): Promise<ReceiptParseResult> {
  const image = Buffer.from(await file.arrayBuffer())
  const result = await recognize(image, 'eng')
  const lines = result.data.text.split(/\r?\n/)
  const items = await buildItems(lines)

  return {
    storeName: deriveStoreName(lines),
    items,
  }
}
