type RateLimitOptions = { limit: number; windowMs: number }
type RateLimitResult = { allowed: boolean; remaining: number; resetAt: number }

type Bucket = { count: number; resetAt: number }

const buckets = new Map<string, Bucket>()

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN

function memoryConsume(key: string, { limit, windowMs }: RateLimitOptions): RateLimitResult {
  const now = Date.now()
  const existing = buckets.get(key)

  if (!existing || now >= existing.resetAt) {
    const resetAt = now + windowMs
    buckets.set(key, { count: 1, resetAt })
    return { allowed: true, remaining: limit - 1, resetAt }
  }

  existing.count += 1
  return {
    allowed: existing.count <= limit,
    remaining: Math.max(0, limit - existing.count),
    resetAt: existing.resetAt,
  }
}

/**
 * INCR the key, then set an expiry the first time it is seen. Uses the Upstash
 * REST API directly rather than a client library — two fetches is the whole
 * protocol, and it keeps the dependency list where it is.
 */
async function redisConsume(
  key: string,
  { limit, windowMs }: RateLimitOptions,
): Promise<RateLimitResult | null> {
  try {
    const headers = { authorization: `Bearer ${REDIS_TOKEN}` }
    const seconds = Math.ceil(windowMs / 1000)

    const response = await fetch(`${REDIS_URL}/incr/${encodeURIComponent(key)}`, {
      headers,
      cache: 'no-store',
      signal: AbortSignal.timeout(2_000),
    })
    if (!response.ok) return null

    const count = Number(((await response.json()) as { result?: unknown }).result)
    if (!Number.isFinite(count)) return null

    if (count === 1) {
      await fetch(`${REDIS_URL}/expire/${encodeURIComponent(key)}/${seconds}`, {
        headers,
        cache: 'no-store',
        signal: AbortSignal.timeout(2_000),
      })
    }

    return {
      allowed: count <= limit,
      remaining: Math.max(0, limit - count),
      resetAt: Date.now() + windowMs,
    }
  } catch {
    return null
  }
}

/**
 * Fixed-window limiter. Shared across serverless instances when Upstash Redis
 * is configured; per-instance otherwise, which is better than nothing but does
 * not actually bound a multi-instance deployment.
 */
export async function consumeRateLimit(
  key: string,
  options: RateLimitOptions,
): Promise<RateLimitResult> {
  if (REDIS_URL && REDIS_TOKEN) {
    const shared = await redisConsume(key, options)
    // A limiter that is down must not lock every user out.
    if (shared) return shared
  }
  return memoryConsume(key, options)
}

export function requestClientKey(request: Request): string | null {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0]?.trim() || null
  return request.headers.get('x-real-ip')
}
