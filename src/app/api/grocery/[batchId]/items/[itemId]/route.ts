import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { setItemConsumed } from '@/infrastructure/state/batch-store'

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

  const body = (await request.json()) as { consumed?: boolean }

  const updatedBatch = await setItemConsumed(ownerEmail, batchId, itemId, body.consumed ?? true)

  if (!updatedBatch) {
    return NextResponse.json({ message: 'Batch not found' }, { status: 404 })
  }

  return NextResponse.json(updatedBatch)
}