import Link from 'next/link'
import { MarketingFooter } from '@/shared/components/MarketingFooter'
import { MarketingNav } from '@/shared/components/MarketingNav'
import { buttonClass } from '@/shared/components/Button'

export default function NotFound() {
  return (
    <div className="page-shell">
      <MarketingNav />
      <main id="main">
      <section className="surface-card marketing-article">
        <p className="eyebrow">404</p>
        <h1>We could not find that page.</h1>
        <p className="lede">
          The page might have moved, or the URL may be incorrect. Continue from one of the core
          routes below.
        </p>
        <div className="cta-row">
          <Link className={buttonClass('primary')} href="/scan">
            Go to scan
          </Link>
          <Link className={buttonClass()} href="/">
            Return home
          </Link>
        </div>
      </section>
      </main>
      <MarketingFooter />
    </div>
  )
}
