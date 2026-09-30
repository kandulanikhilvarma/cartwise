// Parse a JSON request body, returning null on malformed/empty input so route
// handlers can answer 400 instead of throwing an unhandled 500.
export async function parseJsonBody<T>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T
  } catch {
    return null
  }
}

/**
 * Trimmed text, or null when the value is not a usable name. A request body is
 * untyped: `{ "productName": 5 }` used to reach `.trim()` and throw a 500, and
 * an unbounded string went on to the database and both nutrition sources.
 */
export function cleanName(value: unknown, max = 120): string | null {
  if (typeof value !== 'string') return null
  const text = value.trim()
  return text && text.length <= max ? text : null
}

/** A positive, bounded quantity, or null. */
export function cleanQuantity(value: unknown): number | null {
  const quantity = typeof value === 'number' ? value : Number.NaN
  return Number.isFinite(quantity) && quantity > 0 && quantity <= 1000 ? quantity : null
}
