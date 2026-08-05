import Link from 'next/link'
import { MarketingFooter } from '@/shared/components/MarketingFooter'
import { MarketingNav } from '@/shared/components/MarketingNav'

export default function ContactPage() {
  return (
    <main className="page-shell">
      <MarketingNav />
      <section className="surface-card marketing-article">
        <p className="eyebrow">Contact</p>
        <h1>Reach the Cartwise team.</h1>
        <p className="lede">
          For product feedback, support, or collaboration questions, use the channels below.
        </p>
        <div className="article-grid">
          <article className="feature-card">
            <h2>Product feedback</h2>
            <p>Share your scan flow pain points and improvement ideas while MVP evolves.</p>
          </article>
          <article className="feature-card">
            <h2>Operational support</h2>
            <p>If account access or data display looks wrong, include context and timestamps.</p>
          </article>
        </div>
        <div className="cta-row">
          <Link className="button button-primary" href="/login">
            Go to login
          </Link>
          <Link className="button button-secondary" href="/">
            Back to homepage
          </Link>
        </div>
      </section>
      <MarketingFooter />
    </main>
  )
}
