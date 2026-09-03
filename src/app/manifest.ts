import type { MetadataRoute } from 'next'
import { SITE_NAME, SITE_TAGLINE } from '@/shared/config/site'

/**
 * The OCR already runs entirely on the device, so the app installs and opens
 * from the home screen like a camera app — which is where a receipt gets
 * photographed.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} — ${SITE_TAGLINE}`,
    short_name: SITE_NAME,
    description:
      'Turn one grocery receipt into a nutrition read of your whole shop. No daily food logging.',
    start_url: '/scan',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#f4eee1',
    theme_color: '#1f4433',
    categories: ['food', 'health', 'lifestyle'],
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
    ],
  }
}
