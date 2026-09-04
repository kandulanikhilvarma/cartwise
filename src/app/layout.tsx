import type { Metadata, Viewport } from 'next'
import { Young_Serif, Hanken_Grotesk, Fragment_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SITE_URL } from '@/shared/config/site'
import './globals.css'

const youngSerif = Young_Serif({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-display',
})

const hankenGrotesk = Hanken_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
})

// A receipt is set in a monospace. Every figure in the app is too.
const fragmentMono = Fragment_Mono({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-mono',
})

export const metadata: Metadata = {
  title: {
    default: 'Cartwise — know what you bought',
    template: '%s · Cartwise',
  },
  description:
    'Snap your grocery receipt. Cartwise reads it on your device and matches every item to real nutrition data — no daily food logging.',
  metadataBase: new URL(SITE_URL),
  applicationName: 'Cartwise',
  openGraph: {
    title: 'Cartwise — know what you bought',
    description: 'One receipt in. Real nutrition out. No manual logging.',
    type: 'website',
    siteName: 'Cartwise',
    url: SITE_URL,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cartwise — know what you bought',
    description: 'One receipt in. Real nutrition out. No manual logging.',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f4eee1' },
    { media: '(prefers-color-scheme: dark)', color: '#14160f' },
  ],
}

// Applies a saved theme before first paint so the page never flashes the
// wrong ground. Kept inline and tiny for that reason.
const THEME_SCRIPT = `try{var t=localStorage.getItem('cartwise-theme');if(t==='light'||t==='dark'){document.documentElement.dataset.theme=t}}catch(e){}`

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body
        className={`${youngSerif.variable} ${hankenGrotesk.variable} ${fragmentMono.variable}`}
      >
        {/*
          Cartwise — direction contract (Persuade + Operate, one warm system)
          THESIS: A grocery receipt is proof of what you eat; the app reads like a
            weekend food broadsheet, refusing the cold blue-glass SaaS default.
          OWN-WORLD: Warm cream/paper ground, one committed deep grocery-green owning
            whole bands, marmalade accent, Young Serif display over Hanken Grotesk,
            Fragment Mono for every figure, real produce photography in framed plates.
          STORY: A weekly shopper sees their receipt become a legible nutrition read,
            trusts that nothing is faked, and scans their first receipt.
          FIRST VIEWPORT: Full-bleed produce plate under an oversized serif headline,
            green primary CTA beneath it.
          FORM: market editorial (user-pinned, grounded list). seed 06a51552.
          FINISH: unreviewed and undocumented is unfinished; this build ends with the
            finish review, the verdict, and DESIGN.md.
        */}
        {children}
        {/* Page counts only: cookieless, no cross-site identifier, served from
            this domain. Named in the privacy policy for that reason. */}
        <Analytics />
      </body>
    </html>
  )
}
