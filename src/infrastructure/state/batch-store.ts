import type { GroceryBatch, GroceryItem } from '@/features/grocery/types'
import { prisma } from '@/infrastructure/db/client'
import { lookupNutrition } from '@/infrastructure/services/food-lookup'

const memoryBatches = new Map<string, GroceryBatch>()
const memoryProfiles = new Map<string, UserProfile>()
const databaseUnavailable = !process.env.DATABASE_URL

export type UserProfile = {
  ageYears: number | null
  sex: string | null
  activityFactor: number
  householdSize: number
  units: string
  theme: string
}

export const DEFAULT_PROFILE: UserProfile = {
  ageYears: null,
  sex: null,
  activityFactor: 1.4,
  householdSize: 1,
  units: 'metric',
  theme: 'system',
}

export type BatchMeta = {
  storeName?: string | null
  purchasedAt?: Date | null
  totalSpend?: number | null
  currency?: string | null
  itemsTruncated?: boolean
}

type ItemRecord = {
  id: string
  productName: string
  quantity: number
  unit: string | null
  packGrams: number | null
  linePrice: number | null
  matchConfidence: number | null
  foodGroup: string | null
  novaGroup: number | null
  nutriScore: string | null
  caloriesKcal: number | null
  proteinG: number | null
  carbsG: number | null
  fatG: number | null
  sugarG: number | null
  fiberG: number | null
  sodiumMg: number | null
  vitaminDMcg: number | null
  ironMg: number | null
  calciumMg: number | null
  consumed: boolean
  consumedAt: Date | null
}

type BatchRecord = {
  id: string
  storeName: string | null
  ocrStatus: string
  purchasedAt: Date
  totalSpend: number | null
  currency: string | null
  itemsTruncated: boolean
  items: ItemRecord[]
}

function toGroceryItem(item: ItemRecord): GroceryItem {
  return {
    id: item.id,
    productName: item.productName,
    quantity: item.quantity,
    unit: item.unit,
    packGrams: item.packGrams,
    linePrice: item.linePrice,
    matchConfidence: item.matchConfidence,
    foodGroup: item.foodGroup,
    novaGroup: item.novaGroup,
    nutriScore: item.nutriScore,
    caloriesKcal: item.caloriesKcal,
    proteinG: item.proteinG,
    carbsG: item.carbsG,
    fatG: item.fatG,
    sugarG: item.sugarG,
    fiberG: item.fiberG,
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
    totalSpend: batch.totalSpend,
    currency: batch.currency,
    itemsTruncated: batch.itemsTruncated,
    items: batch.items.map(toGroceryItem),
  }
}

/**
 * Nutrition fields for a product name, or nulls when nothing matched. Used on
 * rename so an edited item stops reporting the previous product's figures —
 * the batch UI has always promised this and never did it.
 */
async function nutritionFieldsFor(productName: string) {
  const match = await lookupNutrition(productName)
  return {
    unit: match?.unit ?? null,
    matchConfidence: match?.matchConfidence ?? null,
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
  }
}

// ---------------------------------------------------------------------------
// Memory fallback (no DATABASE_URL configured)
// ---------------------------------------------------------------------------

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
    totalSpend: null,
    currency: null,
    itemsTruncated: false,
    items: [],
  })
}

function memoryCompleteBatch(
  batchId: string,
  items: GroceryItem[],
  meta: BatchMeta,
): GroceryBatch | null {
  const batch = loadMemoryBatch(batchId)
  if (!batch) return null

  return saveMemoryBatch({
    ...batch,
    storeName: meta.storeName ?? batch.storeName,
    purchasedAt: meta.purchasedAt?.toISOString() ?? batch.purchasedAt,
    totalSpend: meta.totalSpend ?? null,
    currency: meta.currency ?? null,
    itemsTruncated: meta.itemsTruncated ?? false,
    ocrStatus: 'done',
    items,
  })
}

function memoryListBatches(): GroceryBatch[] {
  return Array.from(memoryBatches.values()).sort((left, right) =>
    right.purchasedAt.localeCompare(left.purchasedAt),
  )
}

function memoryAddItem(
  batchId: string,
  input: { productName: string; quantity?: number; unit?: string | null; packGrams?: number | null },
): GroceryBatch | null {
  const batch = loadMemoryBatch(batchId)
  if (!batch) return null

  const quantity =
    Number.isFinite(input.quantity) && (input.quantity ?? 0) > 0 ? (input.quantity ?? 1) : 1

  return saveMemoryBatch({
    ...batch,
    items: [
      ...batch.items,
      {
        id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        productName: input.productName,
        quantity,
        unit: input.unit?.trim() ? input.unit.trim() : 'item',
        packGrams: input.packGrams ?? null,
        linePrice: null,
        matchConfidence: null,
        foodGroup: null,
        novaGroup: null,
        nutriScore: null,
        caloriesKcal: null,
        proteinG: null,
        carbsG: null,
        fatG: null,
        sugarG: null,
        fiberG: null,
        sodiumMg: null,
        vitaminDMcg: null,
        ironMg: null,
        calciumMg: null,
        consumed: false,
        consumedAt: null,
      },
    ],
  })
}

async function memoryUpdateItem(
  batchId: string,
  itemId: string,
  patch: ItemPatch,
): Promise<GroceryBatch | null> {
  const batch = loadMemoryBatch(batchId)
  if (!batch) return null

  const target = batch.items.find((item) => item.id === itemId)
  if (!target) return null

  const nextName = patch.productName?.trim() || target.productName
  const renamed = nextName.toLowerCase() !== target.productName.toLowerCase()
  const nutrition = renamed ? await nutritionFieldsFor(nextName) : null

  return saveMemoryBatch({
    ...batch,
    items: batch.items.map((item) => {
      if (item.id !== itemId) return item

      const nextConsumed = patch.consumed ?? item.consumed ?? false
      const parsedQuantity =
        patch.quantity === undefined ? Number.NaN : Number.parseFloat(String(patch.quantity))
      const nextQuantity =
        Number.isFinite(parsedQuantity) && parsedQuantity > 0 ? parsedQuantity : item.quantity

      return {
        ...item,
        ...(nutrition ?? {}),
        productName: nextName,
        quantity: nextQuantity,
        unit: nutrition ? (nutrition.unit ?? item.unit) : patch.unit === undefined ? item.unit : patch.unit,
        packGrams: patch.packGrams === undefined ? item.packGrams : patch.packGrams,
        consumed: nextConsumed,
        consumedAt: nextConsumed ? (item.consumedAt ?? new Date().toISOString()) : null,
      }
    }),
  })
}

// ---------------------------------------------------------------------------
// Database
// ---------------------------------------------------------------------------

const ITEM_SELECT = {
  id: true,
  productName: true,
  quantity: true,
  unit: true,
  packGrams: true,
  linePrice: true,
  matchConfidence: true,
  foodGroup: true,
  novaGroup: true,
  nutriScore: true,
  caloriesKcal: true,
  proteinG: true,
  carbsG: true,
  fatG: true,
  sugarG: true,
  fiberG: true,
  sodiumMg: true,
  vitaminDMcg: true,
  ironMg: true,
  calciumMg: true,
  consumed: true,
  consumedAt: true,
} as const

async function getOrCreateUser(email: string) {
  return prisma.user.upsert({ where: { email }, create: { email }, update: {} })
}

async function databaseGetBatch(ownerEmail: string, batchId: string): Promise<GroceryBatch | null> {
  const batch = await prisma.groceryBatch.findFirst({
    where: { id: batchId, user: { email: ownerEmail } },
    include: { items: { select: ITEM_SELECT, orderBy: { productName: 'asc' } } },
  })
  return batch ? toGroceryBatch(batch) : null
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export type ItemPatch = {
  productName?: string
  quantity?: number
  unit?: string | null
  packGrams?: number | null
  consumed?: boolean
}

function hasDatabase(): boolean {
  return !databaseUnavailable
}

export async function createProcessingBatch(
  ownerEmail: string,
  receiptName: string,
): Promise<GroceryBatch> {
  if (!hasDatabase()) return memoryCreateProcessingBatch(receiptName)

  const user = await getOrCreateUser(ownerEmail)
  const batch = await prisma.groceryBatch.create({
    data: { userId: user.id, storeName: receiptName, ocrStatus: 'processing' },
    include: { items: { select: ITEM_SELECT } },
  })
  return toGroceryBatch(batch)
}

export async function completeBatch(
  ownerEmail: string,
  batchId: string,
  items: GroceryItem[] = [],
  meta: BatchMeta = {},
): Promise<GroceryBatch | null> {
  if (!hasDatabase()) return memoryCompleteBatch(batchId, items, meta)

  const batch = await prisma.groceryBatch.findFirst({
    where: { id: batchId, user: { email: ownerEmail } },
    select: { id: true, storeName: true },
  })
  if (!batch) return null

  await prisma.$transaction(async (tx) => {
    await tx.groceryBatch.update({
      where: { id: batch.id },
      data: {
        ocrStatus: 'done',
        storeName: meta.storeName ?? batch.storeName,
        // The shop happened when the receipt says, not when it was uploaded.
        ...(meta.purchasedAt ? { purchasedAt: meta.purchasedAt } : {}),
        totalSpend: meta.totalSpend ?? null,
        currency: meta.currency ?? null,
        itemsTruncated: meta.itemsTruncated ?? false,
      },
    })

    await tx.groceryItem.createMany({
      data: items.map((item) => ({
        batchId: batch.id,
        productName: item.productName,
        quantity: item.quantity,
        unit: item.unit ?? null,
        packGrams: item.packGrams ?? null,
        linePrice: item.linePrice ?? null,
        matchConfidence: item.matchConfidence ?? null,
        foodGroup: item.foodGroup ?? null,
        novaGroup: item.novaGroup ?? null,
        nutriScore: item.nutriScore ?? null,
        caloriesKcal: item.caloriesKcal ?? null,
        proteinG: item.proteinG ?? null,
        carbsG: item.carbsG ?? null,
        fatG: item.fatG ?? null,
        sugarG: item.sugarG ?? null,
        fiberG: item.fiberG ?? null,
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

export async function getBatch(ownerEmail: string, batchId: string): Promise<GroceryBatch | null> {
  if (!hasDatabase()) return loadMemoryBatch(batchId)
  return databaseGetBatch(ownerEmail, batchId)
}

export async function listBatches(ownerEmail: string): Promise<GroceryBatch[]> {
  if (!hasDatabase()) return memoryListBatches()

  const batches = await prisma.groceryBatch.findMany({
    where: { user: { email: ownerEmail } },
    orderBy: { purchasedAt: 'desc' },
    include: { items: { select: ITEM_SELECT } },
  })
  return batches.map(toGroceryBatch)
}

export async function renameBatch(
  ownerEmail: string,
  batchId: string,
  storeName: string,
): Promise<GroceryBatch | null> {
  const name = storeName.trim()
  if (!name) return null

  if (!hasDatabase()) {
    const batch = loadMemoryBatch(batchId)
    return batch ? saveMemoryBatch({ ...batch, storeName: name }) : null
  }

  const batch = await prisma.groceryBatch.findFirst({
    where: { id: batchId, user: { email: ownerEmail } },
    select: { id: true },
  })
  if (!batch) return null

  await prisma.groceryBatch.update({ where: { id: batchId }, data: { storeName: name } })
  return databaseGetBatch(ownerEmail, batchId)
}

export async function deleteBatch(ownerEmail: string, batchId: string): Promise<boolean> {
  if (!hasDatabase()) return memoryBatches.delete(batchId)

  const batch = await prisma.groceryBatch.findFirst({
    where: { id: batchId, user: { email: ownerEmail } },
    select: { id: true },
  })
  if (!batch) return false

  await prisma.groceryBatch.delete({ where: { id: batchId } })
  return true
}

export async function setItemConsumed(
  ownerEmail: string,
  batchId: string,
  itemId: string,
  consumed: boolean,
): Promise<GroceryBatch | null> {
  return updateBatchItem(ownerEmail, batchId, itemId, { consumed })
}

export async function addBatchItem(
  ownerEmail: string,
  batchId: string,
  input: { productName: string; quantity?: number; unit?: string | null; packGrams?: number | null },
): Promise<GroceryBatch | null> {
  if (!hasDatabase()) return memoryAddItem(batchId, input)

  const batch = await prisma.groceryBatch.findFirst({
    where: { id: batchId, user: { email: ownerEmail } },
    select: { id: true },
  })
  if (!batch) return null

  // A hand-added item gets the same lookup a scanned one does.
  const nutrition = await nutritionFieldsFor(input.productName)

  await prisma.groceryItem.create({
    data: {
      batchId,
      productName: input.productName,
      quantity:
        Number.isFinite(input.quantity) && (input.quantity ?? 0) > 0 ? (input.quantity ?? 1) : 1,
      packGrams: input.packGrams ?? null,
      ...nutrition,
      unit: nutrition.unit ?? (input.unit?.trim() ? input.unit.trim() : 'item'),
    },
  })

  return databaseGetBatch(ownerEmail, batchId)
}

export async function updateBatchItem(
  ownerEmail: string,
  batchId: string,
  itemId: string,
  patch: ItemPatch,
): Promise<GroceryBatch | null> {
  if (!hasDatabase()) return memoryUpdateItem(batchId, itemId, patch)

  const item = await prisma.groceryItem.findFirst({
    where: { id: itemId, batchId, batch: { user: { email: ownerEmail } } },
    select: { id: true, productName: true, consumed: true, consumedAt: true },
  })
  if (!item) return null

  const data: Record<string, unknown> = {}

  const nextName = patch.productName?.trim()
  if (nextName && nextName.toLowerCase() !== item.productName.toLowerCase()) {
    // Renaming means the old figures describe a different product. Re-match.
    Object.assign(data, await nutritionFieldsFor(nextName), { productName: nextName })
  } else if (nextName) {
    data.productName = nextName
  }

  if (Number.isFinite(patch.quantity) && (patch.quantity ?? 0) > 0) {
    data.quantity = patch.quantity
  }
  if (patch.packGrams !== undefined) {
    data.packGrams = patch.packGrams
  }
  if (patch.unit !== undefined && data.unit === undefined) {
    data.unit = patch.unit
  }
  if (patch.consumed !== undefined) {
    data.consumed = patch.consumed
    data.consumedAt = patch.consumed ? (item.consumedAt ?? new Date()) : null
  }

  await prisma.groceryItem.update({ where: { id: itemId }, data })
  return databaseGetBatch(ownerEmail, batchId)
}

export async function removeBatchItem(
  ownerEmail: string,
  batchId: string,
  itemId: string,
): Promise<GroceryBatch | null> {
  if (!hasDatabase()) {
    const batch = loadMemoryBatch(batchId)
    if (!batch) return null
    return saveMemoryBatch({ ...batch, items: batch.items.filter((item) => item.id !== itemId) })
  }

  const item = await prisma.groceryItem.findFirst({
    where: { id: itemId, batchId, batch: { user: { email: ownerEmail } } },
    select: { id: true },
  })
  if (!item) return null

  await prisma.groceryItem.delete({ where: { id: itemId } })
  return databaseGetBatch(ownerEmail, batchId)
}

export async function markBatchFailed(
  ownerEmail: string,
  batchId: string,
  reason?: string,
): Promise<GroceryBatch | null> {
  if (reason) {
    console.error(`Receipt OCR failed for batch ${batchId}: ${reason}`)
  }

  if (!hasDatabase()) {
    const batch = loadMemoryBatch(batchId)
    return batch ? saveMemoryBatch({ ...batch, ocrStatus: 'failed' }) : null
  }

  const batch = await prisma.groceryBatch.findFirst({
    where: { id: batchId, user: { email: ownerEmail } },
    select: { id: true },
  })
  if (!batch) return null

  await prisma.groceryBatch.update({ where: { id: batchId }, data: { ocrStatus: 'failed' } })
  return databaseGetBatch(ownerEmail, batchId)
}

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------

export async function getProfile(ownerEmail: string): Promise<UserProfile> {
  if (!hasDatabase()) return memoryProfiles.get(ownerEmail) ?? DEFAULT_PROFILE

  const profile = await prisma.profile.findFirst({
    where: { user: { email: ownerEmail } },
    select: {
      ageYears: true,
      sex: true,
      activityFactor: true,
      householdSize: true,
      units: true,
      theme: true,
    },
  })
  return profile ?? DEFAULT_PROFILE
}

export async function saveProfile(
  ownerEmail: string,
  patch: Partial<UserProfile>,
): Promise<UserProfile> {
  const current = await getProfile(ownerEmail)
  const next: UserProfile = {
    ageYears: patch.ageYears === undefined ? current.ageYears : patch.ageYears,
    sex: patch.sex === undefined ? current.sex : patch.sex,
    activityFactor: patch.activityFactor ?? current.activityFactor,
    householdSize: patch.householdSize ?? current.householdSize,
    units: patch.units ?? current.units,
    theme: patch.theme ?? current.theme,
  }

  if (!hasDatabase()) {
    memoryProfiles.set(ownerEmail, next)
    return next
  }

  const user = await getOrCreateUser(ownerEmail)
  await prisma.profile.upsert({
    where: { userId: user.id },
    create: { userId: user.id, ...next },
    update: next,
  })
  return next
}

/** Removes the account and every batch under it. Irreversible by design. */
export async function deleteAccount(ownerEmail: string): Promise<boolean> {
  if (!hasDatabase()) {
    memoryBatches.clear()
    memoryProfiles.delete(ownerEmail)
    return true
  }

  const user = await prisma.user.findUnique({ where: { email: ownerEmail }, select: { id: true } })
  if (!user) return false

  await prisma.user.delete({ where: { id: user.id } })
  return true
}
