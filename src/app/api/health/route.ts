import { NextResponse } from 'next/server'
import { prisma } from '@/infrastructure/db/client'

// Public, so it says only whether the app can serve. The host name and driver
// error used to be in the body, which told anyone where the database lives.
export async function GET() {
  // No DATABASE_URL is a supported mode (in-memory store), not an outage.
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ ok: true, db: 'memory' })
  }

  try {
    await prisma.$queryRaw`SELECT 1`
    return NextResponse.json({ ok: true, db: 'ok' })
  } catch (error) {
    console.error('Health check: database unreachable', error)
    return NextResponse.json({ ok: false, db: 'error' }, { status: 503 })
  }
}
