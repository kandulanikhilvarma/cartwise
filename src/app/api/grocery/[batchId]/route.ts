import { NextResponse } from 'next/server'

const demoItems = [
  {
    id: 'item-001',
    productName: 'Greek yogurt',
    quantity: 1,
    unit: 'pack',
    caloriesKcal: 120,
    proteinG: 12,
    carbsG: 8,
    fatG: 4,
    sodiumMg: 65,
    vitaminDMcg: 2,
    ironMg: 0,
    calciumMg: 180,
  },
  {
    id: 'item-002',
    productName: 'Spinach',
    quantity: 1,
    unit: 'bag',
    caloriesKcal: 35,
    proteinG: 4,
    carbsG: 6,
    fatG: 0,
    sodiumMg: 55,
    vitaminDMcg: 0,
    ironMg: 2,
    calciumMg: 99,
  },
]

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ batchId: string }> },
) {
  const { batchId } = await params

  return NextResponse.json({
    id: batchId,
    storeName: 'Demo grocery batch',
    ocrStatus: 'done',
    purchasedAt: new Date().toISOString(),
    items: demoItems,
  })
}
