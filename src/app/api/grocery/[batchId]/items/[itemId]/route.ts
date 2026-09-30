import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { removeBatchItem, updateBatchItem, type ItemPatch } from '@/infrastructure/state/batch-store'
import { cleanName, cleanQuantity, parseJsonBody } from '@/shared/lib/http'

type RouteParams = {
  params: Promise<{ batchId: string; itemId: string }>
}

function badRequest(message: string) {
  return NextResponse.json({ message }, { status: 400 })
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { batchId, itemId } = await params
  const session = await auth()
  const ownerEmail = session?.user?.email

  if (!ownerEmail) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const body = await parseJsonBody<Record<string, unknown>>(request)
  if (!body || typeof body !== 'object') {
    return badRequest('Invalid request body')
  }

  // Every field is optional, and each one that is present must be the right type.
  const patch: ItemPatch = {}

  if (body.productName !== undefined) {
    const name = cleanName(body.productName)
    if (!name) return badRequest('A product name is up to 120 characters.')
    patch.productName = name
  }

  if (body.quantity !== undefined) {
    const quantity = cleanQuantity(body.quantity)
    if (quantity === null) return badRequest('Quantity must be between 0 and 1000.')
    patch.quantity = quantity
  }

  if (body.unit !== undefined) {
    patch.unit = body.unit === null ? null : cleanName(body.unit, 20)
  }

  if (body.packGrams !== undefined && body.packGrams !== null) {
    const grams = Number(body.packGrams)
    if (!Number.isFinite(grams) || grams <= 0 || grams > 50_000) {
      return badRequest('Weight must be between 1 g and 50 kg.')
    }
    patch.packGrams = grams
  } else if (body.packGrams === null) {
    patch.packGrams = null
  }

  if (body.consumed !== undefined) {
    if (typeof body.consumed !== 'boolean') return badRequest('consumed must be true or false.')
    patch.consumed = body.consumed
  }

  if (body.rematch === true) patch.rematch = true

  const updatedBatch = await updateBatchItem(ownerEmail, batchId, itemId, patch)

  if (!updatedBatch) {
    return NextResponse.json({ message: 'Batch not found' }, { status: 404 })
  }

  return NextResponse.json(updatedBatch)
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const { batchId, itemId } = await params
  const session = await auth()
  const ownerEmail = session?.user?.email

  if (!ownerEmail) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const updatedBatch = await removeBatchItem(ownerEmail, batchId, itemId)

  if (!updatedBatch) {
    return NextResponse.json({ message: 'Batch not found' }, { status: 404 })
  }

  return NextResponse.json(updatedBatch)
}
