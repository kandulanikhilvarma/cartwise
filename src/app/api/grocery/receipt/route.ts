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
  {
    id: 'item-003',
    productName: 'Oats',
    quantity: 1,
    unit: 'box',
    caloriesKcal: 180,
    proteinG: 6,
    carbsG: 32,
    fatG: 3,
    sodiumMg: 2,
    vitaminDMcg: 0,
    ironMg: 1,
    calciumMg: 20,
  },
]

export async function POST(request: Request) {
  const formData = await request.formData()
  const receipt = formData.get('receipt')
  const fileName = receipt instanceof File ? receipt.name : 'receipt'

  return NextResponse.json({
    id: `batch-${Date.now()}`,
    storeName: fileName,
    ocrStatus: 'done',
    purchasedAt: new Date().toISOString(),
    items: demoItems,
  })
}
