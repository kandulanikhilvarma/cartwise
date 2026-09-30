type RateLimitOptions = { limit: number; windowMs: number }
type RateLimitResult = { allowed: boolean; remaining: number; resetAt: number }

type Bucket = { count: number; resetAt: number }

const buckets = new Map<string, Bucket>()
const SWEEP_AT = 10_000

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN

export function memoryConsume(key: string, { limit, windowMs }: RateLimitOptions): RateLimitResult {
  const now = Date.now()
  // ponytail: full sweep only when large; a timer would not outlive a serverless instance.
  if (buckets.size > SWEEP_AT) {
    for (const [bucketKey, bucket] of buckets) {
      if (now >= bucket.resetAt) buckets.delete(bucketKey)
    }
  }

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

export function memoryBucketCount(): number {
  return buckets.size
}

/**
 * INCR and EXPIRE NX in one pipeline request, using the Upstash REST API
 * directly rather than a client library. They used to be two requests: when the
 * second one failed the key never expired, and that client stayed blocked.
 * NX sets the expiry only when the key has none, so the window is fixed.
 */
async function redisConsume(
  key: string,
  { limit, windowMs }: RateLimitOptions,
): Promise<RateLimitResult | null> {
  try {
    const response = await fetch(`${REDIS_URL}/pipeline`, {
      method: 'POST',
      headers: { authorization: `Bearer ${REDIS_TOKEN}`, 'content-type': 'application/json' },
      body: JSON.stringify([
        ['INCR', key],
        ['EXPIRE', key, String(Math.ceil(windowMs / 1000)), 'NX'],
      ]),
      cache: 'no-store',
      signal: AbortSignal.timeout(2_000),
    })
    if (!response.ok) return null

    const [incr] = (await response.json()) as Array<{ result?: unknown }>
    const count = Number(incr?.result)
    if (!Number.isFinite(count)) return null

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
