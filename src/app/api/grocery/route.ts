import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { listBatches } from '@/infrastructure/state/batch-store'

export async function GET() {
  const session = await auth()
  const ownerEmail = session?.user?.email

  if (!ownerEmail) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const batches = await listBatches(ownerEmail)

  return NextResponse.json({ batches })
}
