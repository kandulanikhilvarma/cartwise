import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { addBatchItem } from '@/infrastructure/state/batch-store'

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

  const body = (await request.json()) as {
    productName?: string
    quantity?: number
    unit?: string | null
  }

  if (!body.productName?.trim()) {
    return NextResponse.json({ message: 'Product name is required' }, { status: 400 })
  }

  const updatedBatch = await addBatchItem(ownerEmail, batchId, {
    productName: body.productName.trim(),
    quantity: body.quantity,
    unit: body.unit,
  })

  if (!updatedBatch) {
    return NextResponse.json({ message: 'Batch not found' }, { status: 404 })
  }

  return NextResponse.json(updatedBatch)
}
