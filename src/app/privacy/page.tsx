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
            Your receipt photo never leaves your device. It is read in your own browser and only
            the text that comes out is sent to us. There is no image upload, so there is nothing
            for us to store, look at or lose.
          </p>
          <p>
            What we do keep is what the app needs to show you a shop later: your email address
            from Google sign-in, the parsed items, and the household settings you enter yourself.
          </p>
          <p>
            Product names are sent to USDA FoodData Central and Open Food Facts to look up
            nutrition. Those requests carry the product name and nothing that identifies you.
          </p>
          <p>
            We count page views through Vercel Analytics. It sets no cookie, follows you to no
            other site, and is served from this domain.
          </p>
          <p>
            You can export any shop to CSV from its own page, and delete your account and every
            batch under it from Settings. Both take effect immediately.
          </p>
        </div>
      </section>
      <MarketingFooter />
    </main>
  )
}
