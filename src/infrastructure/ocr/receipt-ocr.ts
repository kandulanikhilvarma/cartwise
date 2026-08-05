import { recognize } from 'tesseract.js'
import type { GroceryItem } from '@/features/grocery/types'

type ReceiptParseResult = {
  storeName: string | null
  items: GroceryItem[]
}

type NutrientProfile = {
  caloriesKcal: number
  proteinG: number
  carbsG: number
  fatG: number
  sodiumMg: number
  vitaminDMcg: number
  ironMg: number
  calciumMg: number
  unit?: string | null
}

const keywordProfiles: Array<{ keywords: string[]; profile: NutrientProfile }> = [
  {
    keywords: ['yogurt', 'yoghurt'],
    profile: { caloriesKcal: 120, proteinG: 12, carbsG: 8, fatG: 4, sodiumMg: 65, vitaminDMcg: 2, ironMg: 0, calciumMg: 180, unit: 'cup' },
  },
  {
    keywords: ['spinach', 'kale', 'lettuce'],
    profile: { caloriesKcal: 35, proteinG: 4, carbsG: 6, fatG: 0, sodiumMg: 55, vitaminDMcg: 0, ironMg: 2, calciumMg: 99, unit: 'bag' },
  },
  {
    keywords: ['oats', 'oatmeal'],
    profile: { caloriesKcal: 180, proteinG: 6, carbsG: 32, fatG: 3, sodiumMg: 2, vitaminDMcg: 0, ironMg: 1, calciumMg: 20, unit: 'box' },
  },
  {
    keywords: ['milk'],
    profile: { caloriesKcal: 150, proteinG: 8, carbsG: 12, fatG: 5, sodiumMg: 120, vitaminDMcg: 2, ironMg: 0, calciumMg: 300, unit: 'bottle' },
  },
  {
    keywords: ['egg', 'eggs'],
    profile: { caloriesKcal: 70, proteinG: 6, carbsG: 0.5, fatG: 5, sodiumMg: 70, vitaminDMcg: 1, ironMg: 1, calciumMg: 25, unit: 'dozen' },
  },
  {
    keywords: ['banana'],
    profile: { caloriesKcal: 105, proteinG: 1, carbsG: 27, fatG: 0, sodiumMg: 1, vitaminDMcg: 0, ironMg: 0, calciumMg: 6, unit: 'each' },
  },
  {
    keywords: ['apple'],
    profile: { caloriesKcal: 95, proteinG: 0.5, carbsG: 25, fatG: 0, sodiumMg: 2, vitaminDMcg: 0, ironMg: 0, calciumMg: 11, unit: 'each' },
  },
  {
    keywords: ['bread'],
    profile: { caloriesKcal: 80, proteinG: 3, carbsG: 15, fatG: 1, sodiumMg: 130, vitaminDMcg: 0, ironMg: 1, calciumMg: 20, unit: 'loaf' },
  },
  {
    keywords: ['peanut butter', 'peanut'],
    profile: { caloriesKcal: 190, proteinG: 8, carbsG: 7, fatG: 16, sodiumMg: 140, vitaminDMcg: 0, ironMg: 1, calciumMg: 10, unit: 'jar' },
  },
  {
    keywords: ['chicken'],
    profile: { caloriesKcal: 165, proteinG: 31, carbsG: 0, fatG: 4, sodiumMg: 75, vitaminDMcg: 0, ironMg: 1, calciumMg: 15, unit: 'pack' },
  },
  {
    keywords: ['rice', 'pasta'],
    profile: { caloriesKcal: 200, proteinG: 4, carbsG: 42, fatG: 1, sodiumMg: 5, vitaminDMcg: 0, ironMg: 1, calciumMg: 15, unit: 'bag' },
  },
  {
    keywords: ['cheese'],
    profile: { caloriesKcal: 110, proteinG: 7, carbsG: 1, fatG: 9, sodiumMg: 180, vitaminDMcg: 0, ironMg: 0, calciumMg: 200, unit: 'block' },
  },
]

function cleanLine(line: string): string {
  return line
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s.,&'/-]/g, ' ')
    .trim()
}

function isNoiseLine(line: string): boolean {
  const normalized = line.toLowerCase()
  return (
    !normalized ||
    normalized.length < 3 ||
    /^(total|subtotal|tax|change|cash|card|visa|mastercard|debit|credit|thank you|receipt|store|date|time|balance|amount|qty|quantity)$/i.test(
      normalized,
    ) ||
    /^[\d\s.,-]+$/.test(normalized)
  )
}

function extractQuantity(line: string): number {
  const quantityMatch = line.match(/^(\d+(?:\.\d+)?)\s*(?:x|×|pcs?|pack|bags?|boxes?)?\b/i)
  if (!quantityMatch) {
    return 1
  }

  const quantity = Number(quantityMatch[1])
  return Number.isFinite(quantity) && quantity > 0 ? quantity : 1
}

function deriveProductName(line: string): string {
  const quantityStripped = line.replace(/^(\d+(?:\.\d+)?)\s*(?:x|×)?\s*/i, '')
  const priceStripped = quantityStripped.replace(/\s+\$?\d+(?:\.\d{2})?\s*$/i, '')
  const cleaned = priceStripped.replace(/\s{2,}/g, ' ').trim()
  return cleaned || line.trim()
}

function pickProfile(productName: string): NutrientProfile {
  const normalized = productName.toLowerCase()
  for (const entry of keywordProfiles) {
    if (entry.keywords.some((keyword) => normalized.includes(keyword))) {
      return entry.profile
    }
  }

  return {
    caloriesKcal: 140,
    proteinG: 4,
    carbsG: 16,
    fatG: 6,
    sodiumMg: 90,
    vitaminDMcg: 0,
    ironMg: 1,
    calciumMg: 40,
    unit: 'item',
  }
}

function buildItems(lines: string[]): GroceryItem[] {
  const items: GroceryItem[] = []
  const seen = new Set<string>()

  for (const rawLine of lines) {
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
    const profile = pickProfile(productName)
    const confidence = Math.max(0.5, Math.min(0.98, 0.56 + Math.min(productName.length, 22) * 0.015))

    items.push({
      id: `item-${Date.now()}-${items.length}`,
      productName,
      quantity,
      unit: profile.unit ?? 'item',
      matchConfidence: Number(confidence.toFixed(2)),
      caloriesKcal: profile.caloriesKcal,
      proteinG: profile.proteinG,
      carbsG: profile.carbsG,
      fatG: profile.fatG,
      sodiumMg: profile.sodiumMg,
      vitaminDMcg: profile.vitaminDMcg,
      ironMg: profile.ironMg,
      calciumMg: profile.calciumMg,
      consumed: false,
      consumedAt: null,
    })
  }

  return items.slice(0, 12)
}

function deriveStoreName(lines: string[]): string | null {
  for (const rawLine of lines.slice(0, 5)) {
    const line = cleanLine(rawLine)
    if (isNoiseLine(line)) {
      continue
    }

    const lettersOnly = line.replace(/[^a-z]/gi, '')
    if (lettersOnly.length < 3) {
      continue
    }

    if (/^[A-Z0-9 &'-]+$/.test(line)) {
      return line
    }
  }

  return null
}

export async function extractReceiptItems(file: File): Promise<ReceiptParseResult> {
  const image = Buffer.from(await file.arrayBuffer())
  const result = await recognize(image, 'eng')
  const lines = result.data.text.split(/\r?\n/)
  const items = buildItems(lines)

  return {
    storeName: deriveStoreName(lines),
    items,
  }
}
