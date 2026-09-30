import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import { getBatch } from '@/infrastructure/state/batch-store'
import type { GroceryItem } from '@/features/grocery/types'

const COLUMNS: Array<[header: string, read: (item: GroceryItem) => unknown]> = [
  ['Product', (item) => item.productName],
  ['Quantity', (item) => item.quantity],
  ['Pack grams', (item) => item.packGrams],
  ['Line price', (item) => item.linePrice],
  ['Food group', (item) => item.foodGroup],
  ['NOVA group', (item) => item.novaGroup],
  ['Nutri-Score', (item) => item.nutriScore],
  ['Match confidence', (item) => item.matchConfidence],
  ['Calories per 100g', (item) => item.caloriesKcal],
  ['Protein g per 100g', (item) => item.proteinG],
  ['Carbs g per 100g', (item) => item.carbsG],
  ['Fat g per 100g', (item) => item.fatG],
  ['Sugar g per 100g', (item) => item.sugarG],
  ['Fibre g per 100g', (item) => item.fiberG],
  ['Sodium mg per 100g', (item) => item.sodiumMg],
  ['Vitamin D mcg per 100g', (item) => item.vitaminDMcg],
  ['Iron mg per 100g', (item) => item.ironMg],
  ['Calcium mg per 100g', (item) => item.calciumMg],
  ['Consumed', (item) => (item.consumed ? 'yes' : 'no')],
]

function csvCell(value: unknown): string {
  if (value === null || value === undefined) return ''
  const text = String(value)
  // A leading =, +, - or @ (or a tab or CR before one) is executed as a formula
  // by spreadsheet apps.
  const safe = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text
  return /[",\r\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe
}

export async function GET(_request: Request, { params }: { params: Promise<{ batchId: string }> }) {
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

  const rows = [
    COLUMNS.map(([header]) => csvCell(header)).join(','),
    ...batch.items.map((item) => COLUMNS.map(([, read]) => csvCell(read(item))).join(',')),
  ]

  const slug = (batch.storeName ?? 'cartwise-batch').replace(/[^a-z0-9]+/gi, '-').toLowerCase()
  const date = batch.purchasedAt.slice(0, 10)

  return new NextResponse(rows.join('\r\n'), {
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="${slug}-${date}.csv"`,
    },
  })
}
