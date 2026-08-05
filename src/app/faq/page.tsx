import { MarketingFooter } from '@/shared/components/MarketingFooter'
import { MarketingNav } from '@/shared/components/MarketingNav'

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
    <main className="page-shell">
      <MarketingNav />
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
      <MarketingFooter />
    </main>
  )
}
