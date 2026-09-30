import { describe, expect, it } from 'vitest'
import {
  addBatchItem,
  createProcessingBatch,
  deleteAccount,
  deleteBatch,
  getBatch,
  listBatches,
} from './batch-store'

// vitest.config.ts pins DATABASE_URL empty, so this is the in-memory store.
describe('memory store', () => {
  it('keeps each user to their own batches', async () => {
    const mine = await createProcessingBatch('a@example.com', 'Shop A')
    await createProcessingBatch('b@example.com', 'Shop B')

    expect((await listBatches('a@example.com')).map((batch) => batch.id)).toEqual([mine.id])
    expect(await getBatch('b@example.com', mine.id)).toBeNull()
    expect(await deleteBatch('b@example.com', mine.id)).toBe(false)

    await deleteAccount('b@example.com')
    expect(await getBatch('a@example.com', mine.id)).not.toBeNull()
    expect(await listBatches('b@example.com')).toEqual([])
  })

  it('keeps the price of a restored item', async () => {
    const batch = await createProcessingBatch('c@example.com', null)
    const updated = await addBatchItem('c@example.com', batch.id, {
      productName: 'Milk',
      linePrice: 1.2,
    })
    expect(updated?.items[0]?.linePrice).toBe(1.2)
  })

  it('stores a scanned product with its own figures [N-1]', async () => {
    const batch = await createProcessingBatch('d@example.com', null)
    const updated = await addBatchItem('d@example.com', batch.id, {
      productName: 'Baked Beans',
      packGrams: 415,
      per100g: { caloriesKcal: 80, proteinG: 4.7, carbsG: 12.9, fatG: 0.4, sodiumMg: 240 },
    })
    expect(updated?.items[0]).toMatchObject({
      packGrams: 415,
      caloriesKcal: 80,
      matchSource: 'off',
      matchConfidence: 1,
    })
  })
})
