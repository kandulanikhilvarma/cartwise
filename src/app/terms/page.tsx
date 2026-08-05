import { MarketingFooter } from '@/shared/components/MarketingFooter'
import { MarketingNav } from '@/shared/components/MarketingNav'

export default function TermsPage() {
  return (
    <main className="page-shell">
      <MarketingNav />
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
      <MarketingFooter />
    </main>
  )
}
