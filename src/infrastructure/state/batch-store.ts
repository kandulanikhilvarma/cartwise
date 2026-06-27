import type { GroceryBatch, GroceryItem } from '@/features/grocery/types'

const batches = new Map<string, GroceryBatch>()
const completionTimers = new Map<string, ReturnType<typeof setTimeout>>()

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
    consumed: false,
    consumedAt: null,
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
    consumed: false,
    consumedAt: null,
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
    consumed: false,
    consumedAt: null,
  },
]

export function createProcessingBatch(receiptName: string): GroceryBatch {
  const batch: GroceryBatch = {
    id: `batch-${Date.now()}`,
    storeName: receiptName,
    ocrStatus: 'processing',
    purchasedAt: new Date().toISOString(),
    items: [],
  }

  batches.set(batch.id, batch)
  return batch
}

export function completeBatch(batchId: string): GroceryBatch | null {
  const batch = batches.get(batchId)
  if (!batch) return null

  const completedBatch: GroceryBatch = {
    ...batch,
    ocrStatus: 'done',
    items: demoItems,
  }

  batches.set(batchId, completedBatch)
  return completedBatch
}

export function scheduleBatchCompletion(batchId: string, delayMs = 1500): void {
  const existingTimer = completionTimers.get(batchId)
  if (existingTimer) {
    clearTimeout(existingTimer)
  }

  const timer = setTimeout(() => {
    completeBatch(batchId)
    completionTimers.delete(batchId)
  }, delayMs)

  completionTimers.set(batchId, timer)
}

export function getBatch(batchId: string): GroceryBatch | null {
  return batches.get(batchId) ?? null
}

export function listBatches(): GroceryBatch[] {
  return Array.from(batches.values()).sort((left, right) =>
    right.purchasedAt.localeCompare(left.purchasedAt),
  )
}

export function setItemConsumed(
  batchId: string,
  itemId: string,
  consumed: boolean,
): GroceryBatch | null {
  const batch = batches.get(batchId)
  if (!batch) return null

  const updatedBatch: GroceryBatch = {
    ...batch,
    items: batch.items.map((item) =>
      item.id === itemId
        ? {
            ...item,
            consumed,
            consumedAt: consumed ? new Date().toISOString() : null,
          }
        : item,
    ),
  }

  batches.set(batchId, updatedBatch)
  return updatedBatch
}