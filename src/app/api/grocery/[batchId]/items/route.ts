import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { addBatchItem } from '@/infrastructure/state/batch-store'
import { cleanName, cleanQuantity, parseJsonBody } from '@/shared/lib/http'

type RouteParams = {
  params: Promise<{ batchId: string }>
}

export async function POST(request: Request, { params }: RouteParams) {
  const { batchId } = await params
  const session = await auth()
  const ownerEmail = session?.user?.email

  if (!ownerEmail) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const body = await parseJsonBody<{
    productName?: unknown
    quantity?: unknown
    unit?: unknown
    packGrams?: number | null
    linePrice?: unknown
  }>(request)

  if (!body) {
    return NextResponse.json({ message: 'Invalid request body' }, { status: 400 })
  }

  const productName = cleanName(body.productName)
  if (!productName) {
    return NextResponse.json(
      { message: 'A product name of up to 120 characters is required.' },
      { status: 400 },
    )
  }

  const quantity = body.quantity === undefined ? 1 : cleanQuantity(body.quantity)
  if (quantity === null) {
    return NextResponse.json({ message: 'Quantity must be between 0 and 1000.' }, { status: 400 })
  }

  let packGrams: number | null = null
  if (body.packGrams !== undefined && body.packGrams !== null) {
    const grams = Number(body.packGrams)
    if (!Number.isFinite(grams) || grams <= 0 || grams > 50_000) {
      return NextResponse.json({ message: 'Weight must be between 1 g and 50 kg.' }, { status: 400 })
    }
    packGrams = grams
  }

  // Undo sends the price back so a restored line keeps its spend.
  const price = Number(body.linePrice)
  const linePrice =
    body.linePrice != null && Number.isFinite(price) && price >= 0 && price < 100_000 ? price : null

  const updatedBatch = await addBatchItem(ownerEmail, batchId, {
    productName,
    quantity,
    unit: cleanName(body.unit, 20),
    packGrams,
    linePrice,
  })

  if (!updatedBatch) {
    return NextResponse.json({ message: 'Batch not found' }, { status: 404 })
  }

  return NextResponse.json(updatedBatch)
}
