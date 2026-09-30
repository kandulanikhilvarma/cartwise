import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/shared/config/site'

const PUBLIC_ROUTES = [
  { path: '', priority: 1 },
  { path: '/demo', priority: 0.8 },
  { path: '/how-it-works', priority: 0.8 },
  { path: '/about', priority: 0.6 },
  { path: '/faq', priority: 0.6 },
  { path: '/contact', priority: 0.4 },
  { path: '/privacy', priority: 0.3 },
  { path: '/terms', priority: 0.3 },
]

// No lastModified: stamping every page with the build time told crawlers that
// everything changed on every deploy.
export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    changeFrequency: 'monthly',
    priority: route.priority,
  }))
}
