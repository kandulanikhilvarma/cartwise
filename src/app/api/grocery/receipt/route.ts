import { NextResponse } from 'next/server'
import { createDemoBatch } from '@/infrastructure/state/batch-store'

export async function POST(request: Request) {
  const formData = await request.formData()
  const receipt = formData.get('receipt')
  const fileName = receipt instanceof File ? receipt.name : 'receipt'
  const batch = createDemoBatch(fileName)

  return NextResponse.json(batch)
}
