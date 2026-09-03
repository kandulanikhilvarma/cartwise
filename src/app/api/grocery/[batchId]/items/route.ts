import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { addBatchItem } from '@/infrastructure/state/batch-store'
import { parseJsonBody } from '@/shared/lib/http'

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
    productName?: string
    quantity?: number
    unit?: string | null
    packGrams?: number | null
  }>(request)

  if (!body) {
    return NextResponse.json({ message: 'Invalid request body' }, { status: 400 })
  }

  if (!body.productName?.trim()) {
    return NextResponse.json({ message: 'Product name is required' }, { status: 400 })
  }

  let packGrams: number | null = null
  if (body.packGrams !== undefined && body.packGrams !== null) {
    const grams = Number(body.packGrams)
    if (!Number.isFinite(grams) || grams <= 0 || grams > 50_000) {
      return NextResponse.json({ message: 'Weight must be between 1 g and 50 kg.' }, { status: 400 })
    }
    packGrams = grams
  }

  const updatedBatch = await addBatchItem(ownerEmail, batchId, {
    productName: body.productName.trim(),
    quantity: body.quantity,
    unit: body.unit,
    packGrams,
  })

  if (!updatedBatch) {
    return NextResponse.json({ message: 'Batch not found' }, { status: 404 })
  }

  return NextResponse.json(updatedBatch)
}
