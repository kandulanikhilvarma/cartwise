import { describe, expect, it } from 'vitest'
import { memoryBucketCount, memoryConsume } from './rate-limit'

describe('memoryConsume', () => {
  it('allows up to the limit, then refuses', () => {
    const options = { limit: 2, windowMs: 60_000 }
    expect(memoryConsume('t:one', options).allowed).toBe(true)
    expect(memoryConsume('t:one', options).allowed).toBe(true)
    expect(memoryConsume('t:one', options).allowed).toBe(false)
  })

  it('drops expired buckets once the map is large', () => {
    for (let index = 0; index <= 10_001; index += 1) {
      memoryConsume(`t:expired:${index}`, { limit: 1, windowMs: -1 })
    }
    memoryConsume('t:trigger', { limit: 1, windowMs: 60_000 })
    expect(memoryBucketCount()).toBeLessThan(100)
  })
})
