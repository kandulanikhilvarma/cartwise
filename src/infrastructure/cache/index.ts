const cache = new Map<string, { value: unknown; expiresAt: number }>()

export function cacheGet<T>(key: string): T | null {
  const item = cache.get(key)
  if (!item) return null
  if (Date.now() > item.expiresAt) {
    cache.delete(key)
    return null
  }
  return item.value as T
}

export function cacheSet(key: string, value: unknown, ttlSeconds = 86400): void {
  cache.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 })
}

export function cacheDelete(key: string): void {
  cache.delete(key)
}
