import Link from 'next/link'
import { MarketingFooter } from '@/shared/components/MarketingFooter'
import { MarketingNav } from '@/shared/components/MarketingNav'
import { buttonClass } from '@/shared/components/Button'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'How to reach the person who builds Cartwise with a question, a bug, or a receipt it read wrongly.',
  alternates: { canonical: '/contact' },
}

export default function ContactPage() {
  return (
    <div className="page-shell">
      <MarketingNav />
      <main id="main">
      <section className="surface-card marketing-article">
        <h1>Get in touch.</h1>
        <p className="lede">
          Product feedback, support, a wrong nutrition match, or a partnership — email us and we’ll reply.
        </p>
        <p>
          <a className={buttonClass('primary')} href="mailto:kandulanikhilvarma@gmail.com">
            kandulanikhilvarma@gmail.com
          </a>
        </p>
        <p className="fine-print">
          For a scan or account issue, include what you did and roughly when — it helps us reproduce it fast.
        </p>
        <div className="cta-row">
          <Link className={buttonClass()} href="/">
            Back to home
          </Link>
        </div>
      </section>
      </main>
      <MarketingFooter />
    </div>
  )
}
