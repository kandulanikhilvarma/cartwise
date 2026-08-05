import { NextResponse } from 'next/server'
import { prisma } from '@/infrastructure/db/client'

// Public diagnostic: reports whether the server can reach the database.
// Safe to remove once deployment is stable.
export async function GET() {
  const hasDbUrl = Boolean(process.env.DATABASE_URL)
  const host = process.env.DATABASE_URL?.match(/@([^/:?]+)/)?.[1] ?? null

  if (!hasDbUrl) {
    return NextResponse.json({ db: 'no-url', hasDbUrl, host }, { status: 500 })
  }

  try {
    await prisma.$queryRaw`SELECT 1`
    return NextResponse.json({ db: 'ok', hasDbUrl, host })
  } catch (error) {
    return NextResponse.json(
      { db: 'error', hasDbUrl, host, message: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}
