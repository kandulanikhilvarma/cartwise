export type BarcodeProduct = {
  code: string
  productName: string
  brand?: string
  caloriesKcal: number
  proteinG: number
  carbsG: number
  fatG: number
  sodiumMg: number
  /** Net weight of the pack, when Open Food Facts states it in g or ml. */
  packGrams: number | null
}

const FETCH_TIMEOUT_MS = 6_000

/** "400" with unit "g" is 400 g. Volume counts 1:1, as on receipts. Anything else is unknown. */
function packGramsOf(product: Record<string, unknown>): number | null {
  const amount = Number(product.product_quantity)
  const unit = String(product.product_quantity_unit ?? 'g').toLowerCase()
  if (!Number.isFinite(amount) || amount <= 0 || amount > 50_000) return null
  return unit === 'g' || unit === 'ml' ? amount : null
}

function per100g(values: Record<string, unknown>, key: string): number {
  const raw = values[`${key}_100g`]
  return typeof raw === 'number' && Number.isFinite(raw) ? raw : 0
}

/** EAN-8, UPC-A, EAN-13 and GTIN-14 are 8 to 14 digits. Anything else is not a barcode. */
export function normalizeBarcode(code: string): string | null {
  const digits = code.replace(/\D/g, '')
  return digits.length >= 8 && digits.length <= 14 ? digits : null
}

/**
 * Every figure is per 100 g, because that is what the UI says. The per-serving
 * energy used to fill in when the per-100 g value was missing, which put a
 * serving's calories next to 100 g of everything else.
 */
export function toProduct(code: string, product: Record<string, unknown>): BarcodeProduct | null {
  const nutriments = (product.nutriments as Record<string, unknown> | undefined) ?? {}
  const caloriesKcal =
    per100g(nutriments, 'energy-kcal') || Math.round(per100g(nutriments, 'energy') / 4.184)
  const proteinG = per100g(nutriments, 'proteins')
  // No figures at all is "not found", not a product with zero calories.
  if (caloriesKcal === 0 && proteinG === 0) return null

  const name = typeof product.product_name === 'string' ? product.product_name.trim() : ''
  return {
    code,
    productName: name || 'Unknown product',
    brand:
      typeof product.brands === 'string' && product.brands.trim()
        ? product.brands.split(',')[0]?.trim()
        : undefined,
    caloriesKcal,
    proteinG,
    carbsG: per100g(nutriments, 'carbohydrates'),
    fatG: per100g(nutriments, 'fat'),
    sodiumMg: Math.round(per100g(nutriments, 'sodium') * 1000 * 100) / 100,
    packGrams: packGramsOf(product),
  }
}

/** `reached: false` means Open Food Facts did not answer, which is not the same as "no such product". */
export async function fetchBarcode(
  code: string,
): Promise<{ reached: boolean; product: BarcodeProduct | null }> {
  try {
    const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${code}.json`, {
      headers: { 'user-agent': 'Cartwise/1.0', accept: 'application/json' },
      cache: 'no-store',
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    })
    if (response.status >= 500) return { reached: false, product: null }
    if (!response.ok) return { reached: true, product: null }

    const payload = (await response.json()) as { status?: number; product?: Record<string, unknown> }
    if (payload.status !== 1 || !payload.product) return { reached: true, product: null }
    return { reached: true, product: toProduct(code, payload.product) }
  } catch {
    return { reached: false, product: null }
  }
}
