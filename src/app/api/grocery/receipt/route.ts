import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { completeBatch, createProcessingBatch } from '@/infrastructure/state/batch-store'
import { parseReceiptLines } from '@/infrastructure/ocr/receipt-ocr'
import { consumeRateLimit, requestClientKey } from '@/infrastructure/cache/rate-limit'
import { parseJsonBody } from '@/shared/lib/http'

const MAX_LINES = 200

export async function POST(request: Request) {
  const clientKey = requestClientKey(request)
  if (clientKey) {
    const rate = consumeRateLimit(`receipt:${clientKey}`, { limit: 10, windowMs: 60_000 })
    if (!rate.allowed) {
      return NextResponse.json({ message: 'Too many receipt uploads. Try again shortly.' }, { status: 429 })
    }
  }

  const session = await auth()
  const ownerEmail = session?.user?.email
  if (!ownerEmail) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const body = await parseJsonBody<{ lines?: unknown; fileName?: unknown }>(request)
  if (!body || !Array.isArray(body.lines)) {
    return NextResponse.json({ message: 'Receipt text lines are required' }, { status: 400 })
  }

  const lines = body.lines.filter((line): line is string => typeof line === 'string').slice(0, MAX_LINES)
  if (lines.length === 0) {
    return NextResponse.json({ message: 'No readable text found on the receipt' }, { status: 400 })
  }

  const fileName = typeof body.fileName === 'string' && body.fileName.trim() ? body.fileName.trim() : 'receipt'

  const parsed = await parseReceiptLines(lines)
  const batch = await createProcessingBatch(ownerEmail, fileName)
  const completed = await completeBatch(ownerEmail, batch.id, parsed.items, parsed.storeName ?? fileName)

  return NextResponse.json(completed ?? batch)
}
