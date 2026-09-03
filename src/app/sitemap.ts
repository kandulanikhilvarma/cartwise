import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/shared/config/site'

const PUBLIC_ROUTES = [
  { path: '', priority: 1 },
  { path: '/how-it-works', priority: 0.8 },
  { path: '/about', priority: 0.6 },
  { path: '/faq', priority: 0.6 },
  { path: '/contact', priority: 0.4 },
  { path: '/privacy', priority: 0.3 },
  { path: '/terms', priority: 0.3 },
]

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()
  return PUBLIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    lastModified,
    changeFrequency: 'monthly',
    priority: route.priority,
  }))
}
