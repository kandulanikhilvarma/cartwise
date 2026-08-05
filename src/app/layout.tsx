import type { Metadata } from 'next'
import { Young_Serif, Hanken_Grotesk } from 'next/font/google'
import './globals.css'

const youngSerif = Young_Serif({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-display',
})

const hankenGrotesk = Hanken_Grotesk({
  subsets: ['latin'],
  variable: '--font-body',
})

export const metadata: Metadata = {
  title: {
    default: 'Cartwise — know what you bought',
    template: '%s · Cartwise',
  },
  description:
    'Snap your grocery receipt. Cartwise reads it on your device and matches every item to real nutrition data — no daily food logging.',
  metadataBase: new URL('https://cartwise.app'),
  openGraph: {
    title: 'Cartwise — know what you bought',
    description: 'One receipt in. Real nutrition out. No manual logging.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${youngSerif.variable} ${hankenGrotesk.variable}`}>
        {/*
          Cartwise homepage — direction contract (Persuade)
          THESIS: A grocery receipt is proof of what you eat; the page reads like a
            weekend food broadsheet, refusing the cold blue-glass SaaS hero.
          OWN-WORLD: Warm cream/paper ground, one committed deep grocery-green owning
            whole bands, marmalade accent, Young Serif display over Hanken Grotesk,
            real produce/receipt/shopper photography in tall framed plates.
          STORY: A weekly shopper sees their receipt become a legible nutrition read,
            trusts that nothing is faked, and scans their first receipt.
          FIRST VIEWPORT: Oversized serif headline left, full-bleed produce plate right,
            green primary CTA under the headline.
          FORM: market editorial (user-pinned, grounded list). seed 06a51552.
          FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md
        */}
        {children}
      </body>
    </html>
  )
}
