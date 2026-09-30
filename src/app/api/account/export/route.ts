import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getProfile, listBatches } from '@/infrastructure/state/batch-store'

/**
 * Everything stored for the signed-in account, as one JSON file. Each batch
 * already exports as CSV; this is the whole account in one go, the "take it
 * with you" half of the data controls (deletion is the other half).
 */
export async function GET() {
  const session = await auth()
  const ownerEmail = session?.user?.email
  if (!ownerEmail) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const [profile, batches] = await Promise.all([getProfile(ownerEmail), listBatches(ownerEmail)])
  const exportedAt = new Date().toISOString()

  return new NextResponse(
    JSON.stringify({ exportedAt, account: { email: ownerEmail }, profile, batches }, null, 2),
    {
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'content-disposition': `attachment; filename="cartwise-export-${exportedAt.slice(0, 10)}.json"`,
        'cache-control': 'no-store',
      },
    },
  )
}
