import type { GroceryBatch, GroceryItem } from '@/features/grocery/types'

const batches = new Map<string, GroceryBatch>()

const demoItems: GroceryItem[] = [
  {
    id: 'item-001',
    productName: 'Greek yogurt',
    quantity: 1,
    unit: 'pack',
    caloriesKcal: 120,
    proteinG: 12,
    carbsG: 8,
    fatG: 4,
    sodiumMg: 65,
    vitaminDMcg: 2,
    ironMg: 0,
    calciumMg: 180,
  },
  {
    id: 'item-002',
    productName: 'Spinach',
    quantity: 1,
    unit: 'bag',
    caloriesKcal: 35,
    proteinG: 4,
    carbsG: 6,
    fatG: 0,
    sodiumMg: 55,
    vitaminDMcg: 0,
    ironMg: 2,
    calciumMg: 99,
  },
  {
    id: 'item-003',
    productName: 'Oats',
    quantity: 1,
    unit: 'box',
    caloriesKcal: 180,
    proteinG: 6,
    carbsG: 32,
    fatG: 3,
    sodiumMg: 2,
    vitaminDMcg: 0,
    ironMg: 1,
    calciumMg: 20,
  },
]

export function createDemoBatch(receiptName: string): GroceryBatch {
  const batch: GroceryBatch = {
    id: `batch-${Date.now()}`,
    storeName: receiptName,
    ocrStatus: 'done',
    purchasedAt: new Date().toISOString(),
    items: demoItems,
  }

  batches.set(batch.id, batch)
  return batch
}

export function getBatch(batchId: string): GroceryBatch | null {
  return batches.get(batchId) ?? null
}

export function listBatches(): GroceryBatch[] {
  return Array.from(batches.values()).sort((left, right) =>
    right.purchasedAt.localeCompare(left.purchasedAt),
  )
}