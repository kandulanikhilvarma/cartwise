import { NextResponse } from 'next/server'

const barcodeDatabase: Record<
  string,
  {
    code: string
    productName: string
    brand?: string
    caloriesKcal: number
    proteinG: number
    carbsG: number
    fatG: number
    sodiumMg: number
  }
> = {
  '0123456789012': {
    code: '0123456789012',
    productName: 'Peanut butter',
    brand: 'NutriLens Pantry',
    caloriesKcal: 190,
    proteinG: 8,
    carbsG: 7,
    fatG: 16,
    sodiumMg: 140,
  },
  '036000291452': {
    code: '036000291452',
    productName: 'Greek yogurt',
    brand: 'NutriLens Pantry',
    caloriesKcal: 120,
    proteinG: 12,
    carbsG: 8,
    fatG: 4,
    sodiumMg: 65,
  },
}

type RouteParams = {
  params: Promise<{ code: string }>
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { code } = await params
  const product = barcodeDatabase[code]

  if (!product) {
    return NextResponse.json({ message: 'Barcode not found', notFound: true }, { status: 404 })
  }

  return NextResponse.json(product)
}