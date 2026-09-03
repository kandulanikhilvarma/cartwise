// The canonical origin. Vercel injects VERCEL_PROJECT_PRODUCTION_URL on every
// deployment, so a preview and production both resolve correctly without the
// value being hardcoded to a domain the app is not actually served from.
const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (vercelUrl ? `https://${vercelUrl}` : 'http://localhost:3000')

export const SITE_NAME = 'Cartwise'
export const SITE_TAGLINE = 'Snap your receipt. Know what you bought.'
