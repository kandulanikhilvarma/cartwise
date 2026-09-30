import Image from 'next/image'
import { MarketingFooter } from '@/shared/components/MarketingFooter'
import { MarketingNav } from '@/shared/components/MarketingNav'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About',
  description:
    'Why Cartwise reads grocery receipts instead of asking you to log meals, and who it is for.',
  alternates: { canonical: '/about' },
}

export default function AboutPage() {
  return (
    <div className="page-shell">
      <MarketingNav />
      <main id="main">
      <figure className="page-banner">
        <Image src="/images/produce-flatlay.jpg" alt="A colourful spread of fresh vegetables." fill sizes="(max-width: 1160px) 100vw, 1120px" priority />
      </figure>
      <section className="surface-card marketing-article">
        <p className="eyebrow">About Cartwise</p>
        <h1>Built for people who actually buy groceries every week.</h1>
        <p className="lede">
          Cartwise exists to replace fragile food logging habits with passive grocery intelligence.
          The product starts with receipt scan because that is the one input weekly shoppers already
          have.
        </p>
        <div className="article-grid">
          <article>
            <h2>What we optimize for</h2>
            <p>
              Fast first value, low friction, and simple nutrition feedback that makes daily choices
              clearer without turning health into admin work.
            </p>
          </article>
          <article>
            <h2>What we avoid</h2>
            <p>
              Mandatory onboarding forms, forced item confirmations, and dashboards that require a
              week of setup before they are useful.
            </p>
          </article>
        </div>
      </section>
      </main>
      <MarketingFooter />
    </div>
  )
}
