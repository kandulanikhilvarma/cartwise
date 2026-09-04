import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { lookupNutrition, shouldRecordMiss } from './food-lookup'

const usdaResponse = {
  foods: [
    {
      description: 'Milk, whole',
      foodNutrients: [
        { nutrientNumber: '208', value: 61 },
        { nutrientNumber: '203', value: 3.2 },
        { nutrientNumber: '205', value: 4.8 },
        { nutrientNumber: '204', value: 3.3 },
        { nutrientNumber: '307', value: 43 },
        { nutrientNumber: '328', value: 1.3 },
        { nutrientNumber: '303', value: 0.03 },
        { nutrientNumber: '301', value: 113 },
      ],
    },
  ],
}

// Open Food Facts search returns nutriments per 100g, sodium/iron/calcium in grams.
const offResponse = {
  products: [
    {
      nutriments: {
        'energy-kcal_100g': 52,
        proteins_100g: 0.3,
        carbohydrates_100g: 14,
        fat_100g: 0.2,
        sodium_100g: 0.001, // 1 mg
        'vitamin-d_100g': 0.000002, // 2 µg
        iron_100g: 0.00012, // 0.12 mg
        calcium_100g: 0.006, // 6 mg
      },
    },
  ],
}

function mockFetchOnce(json: unknown, ok = true) {
  return vi.fn().mockResolvedValue({ ok, json: async () => json })
}

describe('lookupNutrition', () => {
  beforeEach(() => {
    process.env.USDA_FDC_API_KEY = 'test-key'
  })
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('maps USDA FDC nutrients per 100g', async () => {
    vi.stubGlobal('fetch', mockFetchOnce(usdaResponse))
    const result = await lookupNutrition('whole milk usda')
    expect(result).not.toBeNull()
    expect(result).toMatchObject({
      caloriesKcal: 61,
      proteinG: 3.2,
      sodiumMg: 43,
      vitaminDMcg: 1.3,
      calciumMg: 113,
      unit: '100g',
    })
    expect(result!.matchConfidence).toBeGreaterThan(0.5)
  })

  it('falls back to Open Food Facts and converts g to mg/µg', async () => {
    // USDA returns no foods -> OFF used
    const fetch = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ foods: [] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => offResponse })
    vi.stubGlobal('fetch', fetch)

    const result = await lookupNutrition('apple off fallback')
    expect(result).toMatchObject({
      caloriesKcal: 52,
      sodiumMg: 1,
      vitaminDMcg: 2,
      ironMg: 0.12,
      calciumMg: 6,
    })
  })

  it('returns null when nothing matches', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ foods: [] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ products: [] }) })
    vi.stubGlobal('fetch', fetch)

    const result = await lookupNutrition('zzz nonexistent food xyz')
    expect(result).toBeNull()
  })

  it('caches results by normalized name', async () => {
    const fetch = mockFetchOnce(usdaResponse)
    vi.stubGlobal('fetch', fetch)

    await lookupNutrition('Cheddar Cheese Cache')
    await lookupNutrition('  cheddar cheese cache ')
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('stops asking once a source has answered', async () => {
    const fetch = mockFetchOnce(usdaResponse)
    vi.stubGlobal('fetch', fetch)

    // USDA matched, so Open Food Facts is never called for the same name.
    await lookupNutrition('short circuit food')
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('returns null when a source is unreachable, without inventing a match', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ foods: [] }) })
      .mockResolvedValueOnce({ ok: false, status: 503, json: async () => ({}) })
    vi.stubGlobal('fetch', fetch)

    expect(await lookupNutrition('offline source food')).toBeNull()
  })
})

describe('shouldRecordMiss', () => {
  // A 503 is the source failing, not the source saying it has nothing. Writing
  // that down cached one Open Food Facts outage as "not found" for every item
  // on the receipt, for the whole 30-day TTL.
  it('records a miss only when every source answered', () => {
    expect(shouldRecordMiss([{ reached: true, match: null }])).toBe(true)
    expect(
      shouldRecordMiss([
        { reached: true, match: null },
        { reached: true, match: null },
      ]),
    ).toBe(true)
  })

  it('refuses to record a miss when any source was unreachable', () => {
    expect(
      shouldRecordMiss([
        { reached: true, match: null },
        { reached: false, match: null },
      ]),
    ).toBe(false)
    expect(shouldRecordMiss([{ reached: false, match: null }])).toBe(false)
  })
})

describe('implausible matches', () => {
  beforeEach(() => {
    process.env.USDA_FDC_API_KEY = 'test-key'
  })
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('rejects a match whose macros cannot fit in 100 g', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          foods: [
            {
              foodNutrients: [
                { nutrientNumber: '208', value: 400 },
                { nutrientNumber: '203', value: 80 },
                { nutrientNumber: '205', value: 80 },
                { nutrientNumber: '204', value: 80 },
              ],
            },
          ],
        }),
      }),
    )
    // A wrong match is worse than an honest unmatched item.
    expect(await lookupNutrition('impossible macro food')).toBeNull()
  })

  it('rejects an energy value no food can reach', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          foods: [
            {
              foodNutrients: [
                { nutrientNumber: '208', value: 5000 },
                { nutrientNumber: '203', value: 5 },
              ],
            },
          ],
        }),
      }),
    )
    expect(await lookupNutrition('impossible energy food')).toBeNull()
  })
})
