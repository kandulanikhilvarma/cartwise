import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/shared/config/site'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Everything behind sign-in is per-user and has nothing to index.
      disallow: ['/api/', '/scan', '/grocery', '/barcode', '/settings', '/home'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
