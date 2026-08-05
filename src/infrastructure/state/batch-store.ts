import type { GroceryBatch, GroceryItem } from '@/features/grocery/types'
import { prisma } from '@/infrastructure/db/client'

const memoryBatches = new Map<string, GroceryBatch>()
const databaseUnavailable = !process.env.DATABASE_URL

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
    matchConfidence: number | null
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
    matchConfidence: item.matchConfidence,
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
    items,
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

function memoryAddItem(
  batchId: string,
  input: { productName: string; quantity?: number; unit?: string | null },
): GroceryBatch | null {
  const batch = loadMemoryBatch(batchId)
  if (!batch) return null

  const quantity = Number.isFinite(input.quantity) && (input.quantity ?? 0) > 0 ? input.quantity ?? 1 : 1
  const item: GroceryItem = {
    id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    productName: input.productName,
    quantity,
    unit: input.unit?.trim() ? input.unit.trim() : 'item',
    matchConfidence: null,
    caloriesKcal: null,
    proteinG: null,
    carbsG: null,
    fatG: null,
    sodiumMg: null,
    vitaminDMcg: null,
    ironMg: null,
    calciumMg: null,
    consumed: false,
    consumedAt: null,
  }

  return saveMemoryBatch({
    ...batch,
    items: [...batch.items, item],
  })
}

function memoryUpdateItem(
  batchId: string,
  itemId: string,
  patch: {
    productName?: string
    quantity?: number
    unit?: string | null
    consumed?: boolean
  },
): GroceryBatch | null {
  const batch = loadMemoryBatch(batchId)
  if (!batch) return null

  return saveMemoryBatch({
    ...batch,
    items: batch.items.map((item) => {
      if (item.id !== itemId) {
        return item
      }

      const nextConsumed = patch.consumed ?? item.consumed ?? false
      const parsedQuantity =
        patch.quantity === undefined ? Number.NaN : Number.parseFloat(String(patch.quantity))
      const nextQuantity = Number.isFinite(parsedQuantity) && parsedQuantity > 0 ? parsedQuantity : item.quantity

      return {
        ...item,
        productName: patch.productName?.trim() ? patch.productName.trim() : item.productName,
        quantity: nextQuantity,
        unit: patch.unit === undefined ? item.unit : patch.unit,
        consumed: nextConsumed,
        consumedAt: nextConsumed ? item.consumedAt ?? new Date().toISOString() : null,
      }
    }),
  })
}

function memoryRemoveItem(batchId: string, itemId: string): GroceryBatch | null {
  const batch = loadMemoryBatch(batchId)
  if (!batch) return null

  return saveMemoryBatch({
    ...batch,
    items: batch.items.filter((item) => item.id !== itemId),
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
      data: items.map((item) => ({
        batchId: batch.id,
        productName: item.productName,
        quantity: item.quantity,
        unit: item.unit ?? null,
        matchConfidence: item.matchConfidence ?? null,
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

async function databaseAddItem(
  ownerEmail: string,
  batchId: string,
  input: { productName: string; quantity?: number; unit?: string | null },
): Promise<GroceryBatch | null> {
  const batch = await prisma.groceryBatch.findFirst({
    where: {
      id: batchId,
      user: { email: ownerEmail },
    },
    select: { id: true },
  })

  if (!batch) {
    return null
  }

  await prisma.groceryItem.create({
    data: {
      batchId,
      productName: input.productName,
      quantity: Number.isFinite(input.quantity) && (input.quantity ?? 0) > 0 ? input.quantity ?? 1 : 1,
      unit: input.unit?.trim() ? input.unit.trim() : 'item',
      matchConfidence: null,
    },
  })

  return databaseGetBatch(ownerEmail, batchId)
}

async function databaseUpdateItem(
  ownerEmail: string,
  batchId: string,
  itemId: string,
  patch: {
    productName?: string
    quantity?: number
    unit?: string | null
    consumed?: boolean
  },
): Promise<GroceryBatch | null> {
  const item = await prisma.groceryItem.findFirst({
    where: {
      id: itemId,
      batchId,
      batch: {
        user: { email: ownerEmail },
      },
    },
    select: {
      id: true,
      consumed: true,
      consumedAt: true,
    },
  })

  if (!item) {
    return null
  }

  const data: {
    productName?: string
    quantity?: number
    unit?: string | null
    consumed?: boolean
    consumedAt?: Date | null
  } = {}

  if (patch.productName?.trim()) {
    data.productName = patch.productName.trim()
  }

  if (Number.isFinite(patch.quantity) && (patch.quantity ?? 0) > 0) {
    data.quantity = patch.quantity
  }

  if (patch.unit !== undefined) {
    data.unit = patch.unit
  }

  if (patch.consumed !== undefined) {
    data.consumed = patch.consumed
    data.consumedAt = patch.consumed ? item.consumedAt ?? new Date() : null
  }

  await prisma.groceryItem.update({
    where: { id: itemId },
    data,
  })

  return databaseGetBatch(ownerEmail, batchId)
}

async function databaseRemoveItem(
  ownerEmail: string,
  batchId: string,
  itemId: string,
): Promise<GroceryBatch | null> {
  const item = await prisma.groceryItem.findFirst({
    where: {
      id: itemId,
      batchId,
      batch: {
        user: { email: ownerEmail },
      },
    },
    select: { id: true },
  })

  if (!item) {
    return null
  }

  await prisma.groceryItem.delete({
    where: { id: itemId },
  })

  return databaseGetBatch(ownerEmail, batchId)
}

function shouldUseDatabase(): boolean {
  return !databaseUnavailable
}

export async function createProcessingBatch(
  ownerEmail: string,
  receiptName: string,
): Promise<GroceryBatch> {
  if (shouldUseDatabase()) {
    return databaseCreateProcessingBatch(ownerEmail, receiptName)
  }

  return memoryCreateProcessingBatch(receiptName)
}

export async function completeBatch(
  ownerEmail: string,
  batchId: string,
  items: GroceryItem[] = [],
  storeName?: string | null,
): Promise<GroceryBatch | null> {
  if (shouldUseDatabase()) {
    return databaseCompleteBatch(ownerEmail, batchId, items, storeName)
  }

  return memoryCompleteBatch(batchId, items, storeName)
}

export async function getBatch(ownerEmail: string, batchId: string): Promise<GroceryBatch | null> {
  if (shouldUseDatabase()) {
    return databaseGetBatch(ownerEmail, batchId)
  }

  return loadMemoryBatch(batchId)
}

export async function listBatches(ownerEmail: string): Promise<GroceryBatch[]> {
  if (shouldUseDatabase()) {
    return databaseListBatches(ownerEmail)
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
    return databaseSetItemConsumed(ownerEmail, batchId, itemId, consumed)
  }

  return memorySetItemConsumed(batchId, itemId, consumed)
}

export async function addBatchItem(
  ownerEmail: string,
  batchId: string,
  input: { productName: string; quantity?: number; unit?: string | null },
): Promise<GroceryBatch | null> {
  if (shouldUseDatabase()) {
    return databaseAddItem(ownerEmail, batchId, input)
  }

  return memoryAddItem(batchId, input)
}

export async function updateBatchItem(
  ownerEmail: string,
  batchId: string,
  itemId: string,
  patch: {
    productName?: string
    quantity?: number
    unit?: string | null
    consumed?: boolean
  },
): Promise<GroceryBatch | null> {
  if (shouldUseDatabase()) {
    return databaseUpdateItem(ownerEmail, batchId, itemId, patch)
  }

  return memoryUpdateItem(batchId, itemId, patch)
}

export async function removeBatchItem(
  ownerEmail: string,
  batchId: string,
  itemId: string,
): Promise<GroceryBatch | null> {
  if (shouldUseDatabase()) {
    return databaseRemoveItem(ownerEmail, batchId, itemId)
  }

  return memoryRemoveItem(batchId, itemId)
}

export async function markBatchFailed(
  ownerEmail: string,
  batchId: string,
  reason?: string,
): Promise<GroceryBatch | null> {
  if (reason) {
    console.error(`Receipt OCR failed for batch ${batchId}: ${reason}`)
  }

  if (shouldUseDatabase()) {
    const batch = await prisma.groceryBatch.findFirst({
      where: {
        id: batchId,
        user: { email: ownerEmail },
      },
      select: { id: true },
    })

    if (!batch) {
      return null
    }

    await prisma.groceryBatch.update({
      where: { id: batchId },
      data: { ocrStatus: 'failed' },
    })

    return databaseGetBatch(ownerEmail, batchId)
  }

  const memoryBatch = loadMemoryBatch(batchId)
  if (!memoryBatch) {
    return null
  }

  return saveMemoryBatch({
    ...memoryBatch,
    ocrStatus: 'failed',
  })
}