import type { GroceryBatch, GroceryItem } from '@/features/grocery/types'
import { prisma } from '@/infrastructure/db/client'

const completionTimers = new Map<string, ReturnType<typeof setTimeout>>()
const memoryBatches = new Map<string, GroceryBatch>()
let databaseUnavailable = !process.env.DATABASE_URL

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

type BatchRecord = {
  id: string
  storeName: string | null
  ocrStatus: string
  purchasedAt: Date
  items: Array<{
    id: string
    productName: string
    quantity: number
    unit: string | null
    caloriesKcal: number | null
    proteinG: number | null
    carbsG: number | null
    fatG: number | null
    sodiumMg: number | null
    vitaminDMcg: number | null
    ironMg: number | null
    calciumMg: number | null
    consumed: boolean
    consumedAt: Date | null
  }>
}

function toGroceryItem(item: BatchRecord['items'][number]): GroceryItem {
  return {
    id: item.id,
    productName: item.productName,
    quantity: item.quantity,
    unit: item.unit,
    caloriesKcal: item.caloriesKcal,
    proteinG: item.proteinG,
    carbsG: item.carbsG,
    fatG: item.fatG,
    sodiumMg: item.sodiumMg,
    vitaminDMcg: item.vitaminDMcg,
    ironMg: item.ironMg,
    calciumMg: item.calciumMg,
    consumed: item.consumed,
    consumedAt: item.consumedAt?.toISOString() ?? null,
  }
}

function toGroceryBatch(batch: BatchRecord): GroceryBatch {
  return {
    id: batch.id,
    storeName: batch.storeName,
    ocrStatus: batch.ocrStatus as GroceryBatch['ocrStatus'],
    purchasedAt: batch.purchasedAt.toISOString(),
    items: batch.items.map(toGroceryItem),
  }
}

function makeDemoItems(batchId: string) {
  return demoItems.map((item) => ({
    batchId,
    productName: item.productName,
    quantity: item.quantity,
    unit: item.unit ?? null,
    caloriesKcal: item.caloriesKcal ?? null,
    proteinG: item.proteinG ?? null,
    carbsG: item.carbsG ?? null,
    fatG: item.fatG ?? null,
    sodiumMg: item.sodiumMg ?? null,
    vitaminDMcg: item.vitaminDMcg ?? null,
    ironMg: item.ironMg ?? null,
    calciumMg: item.calciumMg ?? null,
    consumed: item.consumed ?? false,
    consumedAt: item.consumedAt ? new Date(item.consumedAt) : null,
  }))
}

function saveMemoryBatch(batch: GroceryBatch): GroceryBatch {
  memoryBatches.set(batch.id, batch)
  return batch
}

function loadMemoryBatch(batchId: string): GroceryBatch | null {
  return memoryBatches.get(batchId) ?? null
}

function memoryCreateProcessingBatch(receiptName: string): GroceryBatch {
  return saveMemoryBatch({
    id: `batch-${Date.now()}`,
    storeName: receiptName,
    ocrStatus: 'processing',
    purchasedAt: new Date().toISOString(),
    items: [],
  })
}

function memoryCompleteBatch(
  batchId: string,
  items: GroceryItem[],
  storeName?: string | null,
): GroceryBatch | null {
  const batch = loadMemoryBatch(batchId)
  if (!batch) return null

  return saveMemoryBatch({
    ...batch,
    storeName: storeName ?? batch.storeName,
    ocrStatus: 'done',
    items: items.length ? items : demoItems,
  })
}

function memoryListBatches(): GroceryBatch[] {
  return Array.from(memoryBatches.values()).sort((left, right) =>
    right.purchasedAt.localeCompare(left.purchasedAt),
  )
}

function memorySetItemConsumed(
  batchId: string,
  itemId: string,
  consumed: boolean,
): GroceryBatch | null {
  const batch = loadMemoryBatch(batchId)
  if (!batch) return null

  return saveMemoryBatch({
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
  })
}

async function getOrCreateUser(email: string) {
  return prisma.user.upsert({
    where: { email },
    create: { email },
    update: {},
  })
}

async function databaseCreateProcessingBatch(
  ownerEmail: string,
  receiptName: string,
): Promise<GroceryBatch> {
  const user = await getOrCreateUser(ownerEmail)
  const batch = await prisma.groceryBatch.create({
    data: {
      userId: user.id,
      storeName: receiptName,
      ocrStatus: 'processing',
    },
    include: { items: true },
  })

  return toGroceryBatch(batch)
}

async function databaseGetBatch(ownerEmail: string, batchId: string): Promise<GroceryBatch | null> {
  const batch = await prisma.groceryBatch.findFirst({
    where: {
      id: batchId,
      user: { email: ownerEmail },
    },
    include: { items: true },
  })

  return batch ? toGroceryBatch(batch) : null
}

async function databaseListBatches(ownerEmail: string): Promise<GroceryBatch[]> {
  const batches = await prisma.groceryBatch.findMany({
    where: { user: { email: ownerEmail } },
    orderBy: { purchasedAt: 'desc' },
    include: { items: true },
  })

  return batches.map(toGroceryBatch)
}

async function databaseCompleteBatch(
  ownerEmail: string,
  batchId: string,
  items: GroceryItem[],
  storeName?: string | null,
): Promise<GroceryBatch | null> {
  const batch = await prisma.groceryBatch.findFirst({
    where: {
      id: batchId,
      user: { email: ownerEmail },
    },
    include: { items: true },
  })

  if (!batch) {
    return null
  }

  await prisma.$transaction(async (tx) => {
    await tx.groceryBatch.update({
      where: { id: batch.id },
      data: {
        ocrStatus: 'done',
        storeName: storeName ?? batch.storeName,
      },
    })

    await tx.groceryItem.createMany({
      data: (items.length ? items : demoItems).map((item) => ({
        batchId: batch.id,
        productName: item.productName,
        quantity: item.quantity,
        unit: item.unit ?? null,
        caloriesKcal: item.caloriesKcal ?? null,
        proteinG: item.proteinG ?? null,
        carbsG: item.carbsG ?? null,
        fatG: item.fatG ?? null,
        sodiumMg: item.sodiumMg ?? null,
        vitaminDMcg: item.vitaminDMcg ?? null,
        ironMg: item.ironMg ?? null,
        calciumMg: item.calciumMg ?? null,
        consumed: item.consumed ?? false,
        consumedAt: item.consumedAt ? new Date(item.consumedAt) : null,
      })),
    })
  })

  return databaseGetBatch(ownerEmail, batchId)
}

async function databaseSetItemConsumed(
  ownerEmail: string,
  batchId: string,
  itemId: string,
  consumed: boolean,
): Promise<GroceryBatch | null> {
  const batch = await prisma.groceryBatch.findFirst({
    where: {
      id: batchId,
      user: { email: ownerEmail },
    },
    include: { items: true },
  })

  if (!batch) {
    return null
  }

  const targetItem = batch.items.find((item) => item.id === itemId)
  if (targetItem) {
    await prisma.groceryItem.update({
      where: { id: itemId },
      data: {
        consumed,
        consumedAt: consumed ? new Date() : null,
      },
    })
  }

  return databaseGetBatch(ownerEmail, batchId)
}

function shouldUseDatabase(): boolean {
  return !databaseUnavailable
}

function disableDatabaseFallback() {
  databaseUnavailable = true
}

export async function createProcessingBatch(
  ownerEmail: string,
  receiptName: string,
): Promise<GroceryBatch> {
  if (shouldUseDatabase()) {
    try {
      return await databaseCreateProcessingBatch(ownerEmail, receiptName)
    } catch {
      disableDatabaseFallback()
    }
  }

  return memoryCreateProcessingBatch(receiptName)
}

export async function completeBatch(
  ownerEmail: string,
  batchId: string,
  items: GroceryItem[] = demoItems,
  storeName?: string | null,
): Promise<GroceryBatch | null> {
  if (shouldUseDatabase()) {
    try {
      return await databaseCompleteBatch(ownerEmail, batchId, items, storeName)
    } catch {
      disableDatabaseFallback()
    }
  }

  return memoryCompleteBatch(batchId, items, storeName)
}

export function scheduleBatchCompletion(ownerEmail: string, batchId: string, delayMs = 1500): void {
  const existingTimer = completionTimers.get(batchId)
  if (existingTimer) {
    clearTimeout(existingTimer)
  }

  const timer = setTimeout(() => {
    void completeBatch(ownerEmail, batchId)
    completionTimers.delete(batchId)
  }, delayMs)

  completionTimers.set(batchId, timer)
}

export async function getBatch(ownerEmail: string, batchId: string): Promise<GroceryBatch | null> {
  if (shouldUseDatabase()) {
    try {
      return await databaseGetBatch(ownerEmail, batchId)
    } catch {
      disableDatabaseFallback()
    }
  }

  return loadMemoryBatch(batchId)
}

export async function listBatches(ownerEmail: string): Promise<GroceryBatch[]> {
  if (shouldUseDatabase()) {
    try {
      return await databaseListBatches(ownerEmail)
    } catch {
      disableDatabaseFallback()
    }
  }

  return memoryListBatches()
}

export async function setItemConsumed(
  ownerEmail: string,
  batchId: string,
  itemId: string,
  consumed: boolean,
): Promise<GroceryBatch | null> {
  if (shouldUseDatabase()) {
    try {
      return await databaseSetItemConsumed(ownerEmail, batchId, itemId, consumed)
    } catch {
      disableDatabaseFallback()
    }
  }

  return memorySetItemConsumed(batchId, itemId, consumed)
}