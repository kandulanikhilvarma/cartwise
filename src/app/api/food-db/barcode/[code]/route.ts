import { NextResponse } from 'next/server'
import { consumeRateLimit, requestClientKey } from '@/infrastructure/cache/rate-limit'
import { fetchBarcode, normalizeBarcode, type BarcodeProduct } from '@/infrastructure/services/barcode'

// Per-instance. Capped so a scan of many distinct codes cannot grow it forever.
const CACHE_LIMIT = 500
const barcodeCache = new Map<string, BarcodeProduct>()

type RouteParams = {
  params: Promise<{ code: string }>
}

export async function GET(request: Request, { params }: RouteParams) {
  const clientKey = requestClientKey(request)
  if (clientKey) {
    const rate = await consumeRateLimit(`barcode:${clientKey}`, { limit: 60, windowMs: 60_000 })
    if (!rate.allowed) {
      return NextResponse.json({ message: 'Too many barcode lookups. Slow down and retry.' }, { status: 429 })
    }
  }

  const { code: rawCode } = await params
  const code = normalizeBarcode(rawCode)
  if (!code) {
    return NextResponse.json({ message: 'A barcode is 8 to 14 digits.' }, { status: 400 })
  }

  const cached = barcodeCache.get(code)
  if (cached) return NextResponse.json(cached)

  // No stand-in products: a code Open Food Facts does not know is reported as
  // unknown, never answered with figures we made up.
  const { reached, product } = await fetchBarcode(code)
  if (!reached) {
    return NextResponse.json(
      { message: 'The product database is not answering. Try again shortly.' },
      { status: 503 },
    )
  }
  if (!product) {
    return NextResponse.json({ message: 'No product with that barcode.', notFound: true }, { status: 404 })
  }

  if (barcodeCache.size >= CACHE_LIMIT) {
    barcodeCache.delete(barcodeCache.keys().next().value as string)
  }
  barcodeCache.set(code, product)

  return NextResponse.json(product)
}
