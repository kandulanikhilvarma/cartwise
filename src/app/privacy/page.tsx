import { MarketingFooter } from '@/shared/components/MarketingFooter'
import { MarketingNav } from '@/shared/components/MarketingNav'

export default function PrivacyPage() {
  return (
    <main className="page-shell">
      <MarketingNav />
      <section className="surface-card marketing-article">
        <p className="eyebrow">Privacy</p>
        <h1>Privacy principles for receipt-first nutrition.</h1>
        <div className="legal-list">
          <p>
            We only collect what is required to run authentication, grocery batches, and nutrition
            summaries tied to your account.
          </p>
          <p>
            Receipt images are processed for OCR and are not intended to be permanent user media
            storage.
          </p>
          <p>
            You can request account-related support through the contact route while formal export
            and deletion self-service is planned for later phases.
          </p>
        </div>
      </section>
      <MarketingFooter />
    </main>
  )
}
