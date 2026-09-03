import { NextResponse } from 'next/server'
import { consumeRateLimit, requestClientKey } from '@/infrastructure/cache/rate-limit'

type BarcodeProduct = {
  code: string
  productName: string
  brand?: string
  caloriesKcal: number
  proteinG: number
  carbsG: number
  fatG: number
  sodiumMg: number
}

const fallbackDatabase: Record<string, BarcodeProduct> = {
  '0123456789012': {
    code: '0123456789012',
    productName: 'Peanut butter',
    brand: 'Cartwise Pantry',
    caloriesKcal: 190,
    proteinG: 8,
    carbsG: 7,
    fatG: 16,
    sodiumMg: 140,
  },
  '036000291452': {
    code: '036000291452',
    productName: 'Greek yogurt',
    brand: 'Cartwise Pantry',
    caloriesKcal: 120,
    proteinG: 12,
    carbsG: 8,
    fatG: 4,
    sodiumMg: 65,
  },
}

const barcodeCache = new Map<string, BarcodeProduct>()

function readNutriFact(values: Record<string, unknown>, key: string): number {
  const rawValue = values[key]
  return typeof rawValue === 'number' && Number.isFinite(rawValue) ? rawValue : 0
}

function normalizeCode(code: string): string {
  return code.replace(/\D/g, '')
}

function toProduct(code: string, product: Record<string, unknown>): BarcodeProduct {
  const nutriments = (product.nutriments as Record<string, unknown> | undefined) ?? {}
  const energyKcal =
    readNutriFact(nutriments, 'energy-kcal_100g') ||
    readNutriFact(nutriments, 'energy-kcal_serving') ||
    Math.round(readNutriFact(nutriments, 'energy_100g') / 4.184)

  return {
    code,
    productName: typeof product.product_name === 'string' && product.product_name.trim()
      ? product.product_name
      : 'Unknown product',
    brand:
      typeof product.brands === 'string' && product.brands.trim()
        ? product.brands.split(',')[0]?.trim()
        : undefined,
    caloriesKcal: energyKcal,
    proteinG: readNutriFact(nutriments, 'proteins_100g'),
    carbsG: readNutriFact(nutriments, 'carbohydrates_100g'),
    fatG: readNutriFact(nutriments, 'fat_100g'),
    sodiumMg: readNutriFact(nutriments, 'sodium_100g') * 1000,
  }
}

async function fetchOpenFoodFacts(code: string): Promise<BarcodeProduct | null> {
  const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${code}.json`, {
    headers: {
      'user-agent': 'Cartwise/1.0',
      accept: 'application/json',
    },
    cache: 'no-store',
  })

  if (!response.ok) {
    return null
  }

  const payload = (await response.json()) as {
    status?: number
    product?: Record<string, unknown>
  }

  if (payload.status !== 1 || !payload.product) {
    return null
  }

  return toProduct(code, payload.product)
}

type RouteParams = {
  params: Promise<{ code: string }>
}

export async function GET(_request: Request, { params }: RouteParams) {
  const clientKey = requestClientKey(_request)
  if (clientKey) {
    const rate = await consumeRateLimit(`barcode:${clientKey}`, { limit: 60, windowMs: 60_000 })
    if (!rate.allowed) {
      return NextResponse.json({ message: 'Too many barcode lookups. Slow down and retry.' }, { status: 429 })
    }
  }

  const { code: rawCode } = await params
  const code = normalizeCode(rawCode)

  if (!code) {
    return NextResponse.json({ message: 'Barcode not found', notFound: true }, { status: 404 })
  }

  const cachedProduct = barcodeCache.get(code)
  if (cachedProduct) {
    return NextResponse.json(cachedProduct)
  }

  const liveProduct = await fetchOpenFoodFacts(code).catch(() => null)
  const product = liveProduct ?? fallbackDatabase[code]

  if (!product) {
    return NextResponse.json({ message: 'Barcode not found', notFound: true }, { status: 404 })
  }

  barcodeCache.set(code, product)

  return NextResponse.json(product)
}