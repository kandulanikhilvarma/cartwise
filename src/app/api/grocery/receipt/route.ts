import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { createProcessingBatch } from '@/infrastructure/state/batch-store'
import { consumeRateLimit, requestClientKey } from '@/infrastructure/cache/rate-limit'
import { enqueueReceiptProcessing } from '@/infrastructure/ocr/receipt-processor'

export async function POST(request: Request) {
  const clientKey = requestClientKey(request)
  const rate = consumeRateLimit(`receipt:${clientKey}`, { limit: 10, windowMs: 60_000 })
  if (!rate.allowed) {
    return NextResponse.json({ message: 'Too many receipt uploads. Try again shortly.' }, { status: 429 })
  }

  const session = await auth()
  const ownerEmail = session?.user?.email

  if (!ownerEmail) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const formData = await request.formData()
  const receipt = formData.get('receipt')
  if (!(receipt instanceof File)) {
    return NextResponse.json({ message: 'Receipt image is required' }, { status: 400 })
  }

  if (!receipt.type.startsWith('image/')) {
    return NextResponse.json({ message: 'Only image files are supported' }, { status: 400 })
  }

  const maxSizeBytes = 10 * 1024 * 1024
  if (receipt.size > maxSizeBytes) {
    return NextResponse.json({ message: 'Receipt image must be 10MB or smaller' }, { status: 400 })
  }

  const fileName = receipt.name || 'receipt'
  const batch = await createProcessingBatch(ownerEmail, fileName)
  enqueueReceiptProcessing(ownerEmail, batch.id, receipt)

  return NextResponse.json(batch)
}
