import { MarketingFooter } from '@/shared/components/MarketingFooter'
import { MarketingNav } from '@/shared/components/MarketingNav'

const outcomes = [
  {
    title: 'Receipt scan is the entry point',
    text: 'Start with one grocery receipt and immediately get structured items you can review.',
  },
  {
    title: 'Three nutrition signals on first load',
    text: 'Get one high concern, one deficiency signal, and one positive takeaway from your shop.',
  },
  {
    title: 'Corrections stay lightweight',
    text: 'Only edit or remove an item when OCR misses. No forced confirmation checklist.',
  },
]

const steps = [
  'Capture or upload your grocery receipt',
  'We parse and match items automatically in the background',
  'Review your batch, edit if needed, and track what you consumed',
]

const trustNotes = [
  'Google sign-in only. No password setup.',
  'Receipt images are processed for OCR and not meant as permanent storage.',
  'Barcode lookup is available when an item is missed on receipt scan.',
]

export default function HomePage() {
  return (
    <main className="page-shell">
      <MarketingNav />
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Cartwise for weekly grocery shoppers</p>
          <h1 className="hero-title">Snap your receipt. Know what you bought and what it means.</h1>
          <p className="lede">
            Cartwise turns one receipt into a grocery batch, nutrition summary, and actionable
            signals in under a minute without manual meal logging.
          </p>
          <p className="hero-support">No onboarding form. No calorie diary setup. One clear first step.</p>
          <div className="cta-row">
            <a className="button button-primary" href="/scan">
              Start with receipt scan
            </a>
            <a className="button button-secondary" href="/login">
              Sign in with Google
            </a>
          </div>
        </div>

        <aside className="hero-panel" aria-label="Product summary">
          <div className="panel-badge">Zero-friction MVP</div>
          <div className="panel-title">Built to remove daily logging fatigue</div>
          <div className="panel-metric">
            <span>&lt; 10s</span>
            <small>target OCR processing window</small>
          </div>
          <div className="panel-metric">
            <span>3</span>
            <small>first insights per batch</small>
          </div>
          <div className="panel-metric">
            <span>4</span>
            <small>focused MVP capabilities</small>
          </div>
        </aside>
      </section>

      <section className="feature-strip" id="features">
        {outcomes.map((item) => (
          <article className="feature-card" key={item.title}>
            <h2>{item.title}</h2>
            <p>{item.text}</p>
          </article>
        ))}
      </section>

      <section className="process" id="how-it-works">
        <div className="section-header">
          <h2>How the first value loop works</h2>
        </div>
        <div className="step-list">
          {steps.map((step, index) => (
            <div className="step" key={step}>
              <span>{index + 1}</span>
              <p>{step}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="surface-card home-trust" aria-label="Trust and product boundaries">
        <div className="section-header">
          <h2>What this product does and does not do</h2>
        </div>
        <div className="trust-list">
          {trustNotes.map((note) => (
            <p key={note}>{note}</p>
          ))}
        </div>
        <div className="cta-row">
          <a className="button button-primary" href="/scan">
            Try receipt flow now
          </a>
          <a className="button button-secondary" href="/barcode">
            Use barcode fallback
          </a>
        </div>
      </section>
      <MarketingFooter />
    </main>
  )
}
