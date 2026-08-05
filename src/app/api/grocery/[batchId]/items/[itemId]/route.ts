import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { removeBatchItem, updateBatchItem } from '@/infrastructure/state/batch-store'
import { parseJsonBody } from '@/shared/lib/http'

type RouteParams = {
  params: Promise<{ batchId: string; itemId: string }>
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { batchId, itemId } = await params
  const session = await auth()
  const ownerEmail = session?.user?.email

  if (!ownerEmail) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const body = await parseJsonBody<{
    productName?: string
    quantity?: number
    unit?: string | null
    consumed?: boolean
  }>(request)

  if (!body) {
    return NextResponse.json({ message: 'Invalid request body' }, { status: 400 })
  }

  const updatedBatch = await updateBatchItem(ownerEmail, batchId, itemId, body)

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