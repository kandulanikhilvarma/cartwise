import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { completeBatch, createProcessingBatch } from '@/infrastructure/state/batch-store'
import { extractReceiptItems } from '@/infrastructure/ocr/receipt-ocr'

export async function POST(request: Request) {
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

  const fileName = receipt.name || 'receipt'
  const batch = await createProcessingBatch(ownerEmail, fileName)

  const parsedReceipt = await extractReceiptItems(receipt).catch(() => ({
    storeName: null,
    items: [],
  }))

  const finalBatch = await completeBatch(
    ownerEmail,
    batch.id,
    parsedReceipt.items,
    parsedReceipt.storeName ?? fileName,
  )

  return NextResponse.json(finalBatch ?? batch)
}
