import { MarketingFooter } from '@/shared/components/MarketingFooter'
import { MarketingNav } from '@/shared/components/MarketingNav'

const flow = [
  {
    title: '1. Capture receipt',
    body: 'Use camera capture or upload a grocery receipt image from your device.',
  },
  {
    title: '2. Automatic matching',
    body: 'OCR parsing runs in the background and converts lines into grocery items.',
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
    <main className="page-shell">
      <MarketingNav />
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
      <MarketingFooter />
    </main>
  )
}
