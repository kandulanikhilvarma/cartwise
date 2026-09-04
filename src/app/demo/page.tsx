import Link from 'next/link'
import type { Metadata } from 'next'
import { MarketingFooter } from '@/shared/components/MarketingFooter'
import { MarketingNav } from '@/shared/components/MarketingNav'
import { NutritionSummary } from '@/features/nutrition/components/NutritionSummary'
import { parseReceiptLines } from '@/infrastructure/ocr/receipt-ocr'
import { SAMPLE_RECEIPT } from '@/features/grocery/lib/sample-receipt'

export const metadata: Metadata = {
  title: 'See it work',
  description:
    'Run a real grocery receipt through Cartwise — the same parser, the same nutrition sources, no account needed.',
}

// The sample is fixed, so the lookups behind it can be cached for an hour
// rather than refetched for every visitor.
export const revalidate = 3600

export default async function DemoPage() {
  const parsed = await parseReceiptLines(SAMPLE_RECEIPT)
  const matched = parsed.items.filter((item) => item.matchConfidence != null).length

  return (
    <main className="page-shell">
      <MarketingNav />

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

          <NutritionSummary items={parsed.items} currency={parsed.currency} />
        </section>
      </div>

      <section className="surface-card home-close">
        <h2>Now try it on your own shop.</h2>
        <p>One photo, one tap to sign in, and your read is built from your receipt instead of ours.</p>
        <div className="cta-row">
          <Link className="button button-primary" href="/scan">
            Scan your receipt
          </Link>
          <Link className="button button-secondary" href="/how-it-works">
            See how it works
          </Link>
        </div>
      </section>

      <MarketingFooter />
    </main>
  )
}
