import Link from 'next/link'
import type { Metadata } from 'next'
import { MarketingFooter } from '@/shared/components/MarketingFooter'
import { MarketingNav } from '@/shared/components/MarketingNav'
import { NutritionSummary } from '@/features/nutrition/components/NutritionSummary'
import { parseReceiptLines } from '@/infrastructure/ocr/receipt-ocr'
import { SAMPLE_RECEIPT } from '@/features/grocery/lib/sample-receipt'
import { buttonClass } from '@/shared/components/Button'

export const metadata: Metadata = {
  title: 'See it work',
  description:
    'Run a real grocery receipt through Cartwise — the same parser, the same nutrition sources, no account needed.',
  alternates: { canonical: '/demo' },
}

// Rendered per request. The lookups use `cache: 'no-store'`, so an ISR
// `revalidate` here never took effect; it only made the build try to prerender
// the page and query the production database. Repeat visits are cheap anyway:
// every name is memoised in-process and cached in FoodMatch.
export const dynamic = 'force-dynamic'

export default async function DemoPage() {
  const parsed = await parseReceiptLines(SAMPLE_RECEIPT)
  const matched = parsed.items.filter((item) => item.matchConfidence != null).length

  return (
    <div className="page-shell">
      <MarketingNav />
      <main id="main">

      <section className="surface-card marketing-article">
        <p className="eyebrow">No account needed</p>
        <h1>This is a real receipt, read by the real thing.</h1>
        <p>
          Below is a sample supermarket receipt run through the same parser and the same nutrition
          sources your own scans use. Nothing here is stored, and none of the figures are invented —
          items we cannot match are shown as unmatched.
        </p>
      </section>

      <div className="signal-grid" style={{ alignItems: 'start' }}>
        <section className="surface-card">
          <div className="section-header">
            <p className="eyebrow">The receipt</p>
            <h2>What was photographed</h2>
          </div>
          <pre
            className="num"
            style={{
              margin: 0,
              whiteSpace: 'pre-wrap',
              fontSize: '0.84rem',
              lineHeight: 1.7,
              color: 'var(--ink-soft)',
            }}
          >
            {SAMPLE_RECEIPT.join('\n')}
          </pre>
        </section>

        <section className="surface-card">
          <div className="section-header">
            <p className="eyebrow">The read</p>
            <h2>What Cartwise made of it</h2>
            <p className="fine-print num">
              {matched} of {parsed.items.length} lines matched to nutrition data
              {parsed.totalSpend !== null ? ` · receipt total ${parsed.totalSpend.toFixed(2)}` : ''}.
            </p>
            {matched === 0 ? (
              <p className="error-text">
                Nothing matched, which means our nutrition sources are unreachable right now — not
                that this receipt has no nutrition in it. The parse above is still real. Try again
                shortly.
              </p>
            ) : null}
          </div>

          <NutritionSummary
            items={parsed.items}
            currency={parsed.currency}
            receiptTotal={parsed.totalSpend}
          />
        </section>
      </div>

      <section className="surface-card home-close">
        <h2>Now try it on your own shop.</h2>
        <p>One photo, one tap to sign in, and your read is built from your receipt instead of ours.</p>
        <div className="cta-row">
          <Link className={buttonClass('primary')} href="/scan">
            Scan your receipt
          </Link>
          <Link className={buttonClass()} href="/how-it-works">
            See how it works
          </Link>
        </div>
      </section>

      </main>
      <MarketingFooter />
    </div>
  )
}
