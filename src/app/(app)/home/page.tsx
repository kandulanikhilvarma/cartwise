import Link from 'next/link'
import type { Metadata } from 'next'
import { auth } from '@/auth'
import { listBatches } from '@/infrastructure/state/batch-store'
import { summarizeHistory } from '@/features/grocery/lib/history'

export const metadata: Metadata = { title: 'Home' }

function money(value: number, currency: string | null): string {
  if (!currency) return value.toFixed(2)
  try {
    return value.toLocaleString(undefined, { style: 'currency', currency })
  } catch {
    return value.toFixed(2)
  }
}

function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
}

export default async function AppHomePage() {
  const session = await auth()
  const ownerEmail = session?.user?.email
  if (!ownerEmail) return null

  const batches = await listBatches(ownerEmail)
  const history = summarizeHistory(batches)
  const firstName = session.user?.name?.split(' ')[0]

  if (history.batchCount === 0) {
    return (
      <main className="surface-page">
        <div className="scan-intro">
          <h1>{firstName ? `Welcome, ${firstName}.` : 'Welcome.'}</h1>
          <p className="lede">
            Scan your first grocery receipt and this page starts showing what your shopping adds up
            to over time.
          </p>
        </div>
        <section className="surface-card empty-state">
          <h2>Nothing scanned yet</h2>
          <p>
            One photo of a receipt is all it takes. It is read on your device, matched to real
            nutrition data, and saved here.
          </p>
          <Link className="button button-primary" href="/scan">
            Scan a receipt
          </Link>
        </section>
      </main>
    )
  }

  const recent = [...history.shops].reverse().slice(0, 5)
  const maxSpend = Math.max(...history.shops.map((shop) => shop.spend ?? 0), 1)

  return (
    <main className="surface-page">
      <div className="scan-intro">
        <h1>{firstName ? `${firstName}’s shopping` : 'Your shopping'}</h1>
        <p className="lede">
          {history.batchCount} {history.batchCount === 1 ? 'shop' : 'shops'} scanned.
          {history.produceChange !== null && history.produceChange !== 0
            ? ` Your last shop had ${Math.abs(history.produceChange)} ${
                Math.abs(history.produceChange) === 1 ? 'item' : 'items'
              } ${history.produceChange > 0 ? 'more' : 'less'} fresh produce than the one before.`
            : ''}
        </p>
      </div>

      <div className="stat-row">
        <div className="stat-tile">
          <span className="stat-value">{history.batchCount}</span>
          <span className="stat-label">shops scanned</span>
        </div>
        <div className="stat-tile">
          <span className="stat-value">{history.itemCount}</span>
          <span className="stat-label">items captured</span>
        </div>
        <div className="stat-tile">
          <span className="stat-value">{history.matchedCount}</span>
          <span className="stat-label">matched to nutrition data</span>
        </div>
        <div className="stat-tile">
          <span className="stat-value">
            {history.totalSpend !== null ? money(history.totalSpend, history.currency) : '—'}
          </span>
          <span className="stat-label">
            {history.totalSpend !== null ? 'spent across those shops' : 'no prices read yet'}
          </span>
        </div>
      </div>

      <section className="surface-card">
        <div className="section-header">
          <p className="eyebrow">Recent shops</p>
          <h2>What each trip came to</h2>
        </div>
        <ul className="trend-list">
          {recent.map((shop) => (
            <li key={shop.batchId}>
              <Link href={`/grocery/${shop.batchId}`}>
                {shortDate(shop.purchasedAt)} · {shop.itemCount} items
              </Link>
              <span
                className="trend-bar"
                style={{ width: `${Math.round(((shop.spend ?? 0) / maxSpend) * 100)}%` }}
                aria-hidden="true"
              />
              <span className="num">
                {shop.spend !== null ? money(shop.spend, history.currency) : '—'}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {history.frequent.length > 0 ? (
        <section className="surface-card">
          <div className="section-header">
            <p className="eyebrow">Buy again</p>
            <h2>What you buy most weeks</h2>
            <p className="fine-print">
              Taken from what you have actually scanned, not a suggested list.
            </p>
          </div>
          <ul className="trend-list">
            {history.frequent.map((entry) => (
              <li key={entry.productName}>
                <span>{entry.productName}</span>
                <span
                  className="trend-bar"
                  style={{
                    width: `${Math.round((entry.timesBought / history.batchCount) * 100)}%`,
                  }}
                  aria-hidden="true"
                />
                <span className="num">
                  {entry.timesBought} of {history.batchCount}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="cta-row">
        <Link className="button button-primary" href="/scan">
          Scan another receipt
        </Link>
        <Link className="button button-secondary" href="/grocery">
          See all batches
        </Link>
      </div>
    </main>
  )
}
