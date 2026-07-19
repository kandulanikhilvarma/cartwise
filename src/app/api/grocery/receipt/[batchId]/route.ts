import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getBatch } from '@/infrastructure/state/batch-store'

type RouteParams = {
  params: Promise<{ batchId: string }>
}

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