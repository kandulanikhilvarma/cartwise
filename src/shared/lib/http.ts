// Parse a JSON request body, returning null on malformed/empty input so route
// handlers can answer 400 instead of throwing an unhandled 500.
export async function parseJsonBody<T>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T
  } catch {
    return null
  }
}
