import type { Instrumentation } from 'next'

/**
 * One place every server-side error passes through. Before this, failures were
 * a scatter of console.error calls in individual route handlers, which meant a
 * broken route was only visible to whoever happened to open the Vercel logs.
 *
 * The structured line is the baseline and always runs: it is greppable and any
 * log drain can pick it up without extra wiring. ERROR_WEBHOOK_URL is optional
 * and posts the same payload somewhere durable when one is configured.
 */
export const onRequestError: Instrumentation.onRequestError = async (
  error,
  request,
  context,
) => {
  const payload = {
    level: 'error',
    at: new Date().toISOString(),
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    path: request.path,
    method: request.method,
    router: context.routerKind,
    route: context.routePath,
    routeType: context.routeType,
    rendered: context.renderSource,
  }

  console.error(JSON.stringify(payload))

  const webhook = process.env.ERROR_WEBHOOK_URL
  if (!webhook) return

  try {
    await fetch(webhook, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
      // Reporting an error must never become a second, slower error.
      signal: AbortSignal.timeout(3_000),
    })
  } catch {
    // Nothing useful to do here: the failure is already on stderr above.
  }
}
