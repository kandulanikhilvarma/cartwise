import { NextResponse } from 'next/server'
import { getBatch } from '@/infrastructure/state/batch-store'

type RouteParams = {
  params: Promise<{ batchId: string }>
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { batchId } = await params
  const batch = getBatch(batchId)

  if (!batch) {
    return NextResponse.json({ message: 'Batch not found' }, { status: 404 })
  }

  return NextResponse.json(batch)
}