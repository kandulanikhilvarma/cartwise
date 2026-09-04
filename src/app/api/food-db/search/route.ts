import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { consumeRateLimit, requestClientKey } from '@/infrastructure/cache/rate-limit'
import { searchFoods } from '@/infrastructure/services/food-lookup'

export async function GET(request: Request) {
  const clientKey = requestClientKey(request)
  if (clientKey) {
    const rate = await consumeRateLimit(`foodsearch:${clientKey}`, { limit: 30, windowMs: 60_000 })
    if (!rate.allowed) {
      return NextResponse.json({ message: 'Too many searches. Try again shortly.' }, { status: 429 })
    }
  }

  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const query = new URL(request.url).searchParams.get('q')?.trim() ?? ''
  if (query.length < 2) {
    return NextResponse.json({ results: [] })
  }

  const results = await searchFoods(query.slice(0, 80))
  return NextResponse.json({ results })
}
