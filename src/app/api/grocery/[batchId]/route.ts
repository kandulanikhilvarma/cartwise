import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { deleteBatch, getBatch, renameBatch } from '@/infrastructure/state/batch-store'
import { parseJsonBody } from '@/shared/lib/http'

type RouteParams = { params: Promise<{ batchId: string }> }

export async function GET(_request: Request, { params }: RouteParams) {
  const { batchId } = await params
  const session = await auth()
  const ownerEmail = session?.user?.email

  if (!ownerEmail) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const batch = await getBatch(ownerEmail, batchId)
  if (!batch) {
    return NextResponse.json({ message: 'Batch not found' }, { status: 404 })
  }

  return NextResponse.json(batch)
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { batchId } = await params
  const session = await auth()
  const ownerEmail = session?.user?.email

  if (!ownerEmail) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const body = await parseJsonBody<{ storeName?: string }>(request)
  if (!body?.storeName?.trim()) {
    return NextResponse.json({ message: 'A name is required' }, { status: 400 })
  }

  const batch = await renameBatch(ownerEmail, batchId, body.storeName)
  if (!batch) {
    return NextResponse.json({ message: 'Batch not found' }, { status: 404 })
  }

  return NextResponse.json(batch)
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const { batchId } = await params
  const session = await auth()
  const ownerEmail = session?.user?.email

  if (!ownerEmail) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const removed = await deleteBatch(ownerEmail, batchId)
  if (!removed) {
    return NextResponse.json({ message: 'Batch not found' }, { status: 404 })
  }

  return NextResponse.json({ deleted: true })
}
