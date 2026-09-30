import { MarketingFooter } from '@/shared/components/MarketingFooter'
import { MarketingNav } from '@/shared/components/MarketingNav'
import type { Metadata } from 'next'
import { JsonLd } from '@/shared/components/JsonLd'

export const metadata: Metadata = {
  title: 'FAQ',
  description:
    'Answers to first questions about Cartwise: meal logging, missed items, sign-in, and medical advice.',
  alternates: { canonical: '/faq' },
}

const faq = [
  {
    q: 'Do I need to manually log meals?',
    a: 'No. The MVP is explicitly receipt-first and avoids manual meal logging as a requirement.',
  },
  {
    q: 'What if receipt OCR misses a product?',
    a: 'You can edit or remove that item, and use barcode fallback to add missed products quickly.',
  },
  {
    q: 'Do I need to create a password?',
    a: 'No. Sign-in is currently OAuth-based for low-friction access.',
  },
  {
    q: 'Is this a medical recommendation tool?',
    a: 'No. It provides directional nutrition insights and should not replace medical guidance.',
  },
]

export default function FaqPage() {
  return (
    <div className="page-shell">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faq.map((item) => ({
            '@type': 'Question',
            name: item.q,
            acceptedAnswer: { '@type': 'Answer', text: item.a },
          })),
        }}
      />
      <MarketingNav />
      <main id="main">
      <section className="surface-card marketing-article">
        <p className="eyebrow">FAQ</p>
        <h1>Common questions from first-time users.</h1>
        <div className="faq-list">
          {faq.map((item) => (
            <article className="feature-card" key={item.q}>
              <h2>{item.q}</h2>
              <p>{item.a}</p>
            </article>
          ))}
        </div>
      </section>
      </main>
      <MarketingFooter />
    </div>
  )
}
