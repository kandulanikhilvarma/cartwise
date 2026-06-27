import { NextResponse } from 'next/server'
import { setItemConsumed } from '@/infrastructure/state/batch-store'

type RouteParams = {
  params: Promise<{ batchId: string; itemId: string }>
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { batchId, itemId } = await params
  const body = (await request.json()) as { consumed?: boolean }

  const updatedBatch = setItemConsumed(batchId, itemId, body.consumed ?? true)

  if (!updatedBatch) {
    return NextResponse.json({ message: 'Batch not found' }, { status: 404 })
  }

  return NextResponse.json(updatedBatch)
}