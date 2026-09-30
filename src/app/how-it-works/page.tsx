import Image from 'next/image'
import { MarketingFooter } from '@/shared/components/MarketingFooter'
import { MarketingNav } from '@/shared/components/MarketingNav'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'How it works',
  description:
    'From a receipt photo to a nutrition read: on-device OCR, weight-scaled USDA and Open Food Facts data, and three signals.',
  alternates: { canonical: '/how-it-works' },
}

const flow = [
  {
    title: '1. Capture receipt',
    body: 'Take a photo of your grocery receipt, or upload one from your device.',
  },
  {
    title: '2. Read on your device',
    body: 'Your phone reads the receipt text and turns each line into a grocery item.',
  },
  {
    title: '3. Insight summary',
    body: 'You get three immediate nutrition signals, then optional deeper breakdown.',
  },
  {
    title: '4. Correct only where needed',
    body: 'Edit, remove, or add items when a receipt line is unclear or missed.',
  },
]

export default function HowItWorksPage() {
  return (
    <div className="page-shell">
      <MarketingNav />
      <main id="main">
      <figure className="page-banner">
        <Image src="/images/groceries-bag.jpg" alt="A reusable kraft grocery bag." fill sizes="(max-width: 1160px) 100vw, 1120px" priority />
      </figure>
      <section className="surface-card marketing-article">
        <p className="eyebrow">Product flow</p>
        <h1>From receipt photo to grocery nutrition in one flow.</h1>
        <div className="feature-strip" style={{ marginTop: 24 }}>
          {flow.map((step) => (
            <article className="feature-card" key={step.title}>
              <h2>{step.title}</h2>
              <p>{step.body}</p>
            </article>
          ))}
        </div>
      </section>
      </main>
      <MarketingFooter />
    </div>
  )
}
