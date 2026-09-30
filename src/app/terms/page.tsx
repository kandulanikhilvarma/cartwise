import { MarketingFooter } from '@/shared/components/MarketingFooter'
import { MarketingNav } from '@/shared/components/MarketingNav'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of use',
  description:
    'The terms for using Cartwise, a receipt-based nutrition tool that is not medical advice.',
  alternates: { canonical: '/terms' },
}

export default function TermsPage() {
  return (
    <div className="page-shell">
      <MarketingNav />
      <main id="main">
      <section className="surface-card marketing-article">
        <p className="eyebrow">Terms</p>
        <h1>Cartwise terms of use (MVP)</h1>
        <div className="legal-list">
          <p>
            Cartwise provides informational nutrition estimates derived from receipt and barcode
            data. It is not medical advice.
          </p>
          <p>
            You are responsible for reviewing OCR-derived items and making corrections where needed
            before relying on any nutrition summary.
          </p>
          <p>
            Service behavior may evolve during MVP validation as reliability, accuracy, and feature
            coverage improve.
          </p>
        </div>
      </section>
      </main>
      <MarketingFooter />
    </div>
  )
}
