import { ImageResponse } from 'next/og'
import { SITE_TAGLINE } from '@/shared/config/site'

export const alt = 'Cartwise — snap your receipt, know what you bought'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

/**
 * Link previews were blank before this existed. Built from the same tokens as
 * the site so a shared link looks like the page it opens.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#f4eee1',
          padding: '72px 80px',
          fontFamily: 'Georgia, serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 13,
              background: '#1f4433',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#f4eede',
              fontSize: 30,
            }}
          >
            C
          </div>
          <div style={{ fontSize: 40, color: '#211c13', letterSpacing: '-0.02em' }}>Cartwise</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div
            style={{
              fontSize: 82,
              lineHeight: 1.05,
              color: '#211c13',
              letterSpacing: '-0.02em',
              maxWidth: 900,
            }}
          >
            {SITE_TAGLINE}
          </div>
          <div style={{ fontSize: 30, color: '#564f3f', maxWidth: 820 }}>
            One receipt in, real nutrition out — no daily food diary.
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 120, height: 4, background: '#bd6318' }} />
          <div style={{ fontSize: 24, color: '#564f3f' }}>
            USDA FoodData Central · Open Food Facts
          </div>
        </div>
      </div>
    ),
    size,
  )
}
