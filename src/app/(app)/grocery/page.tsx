import Link from 'next/link'
import { auth } from '@/auth'
import { listBatches } from '@/infrastructure/state/batch-store'

export default async function GroceryPage() {
  const session = await auth()
  const ownerEmail = session?.user?.email

  if (!ownerEmail) {
    return null
  }

  const batches = await listBatches(ownerEmail)

  return (
    <main className="surface-page">
      <div className="scan-intro">
        <h1>Your batches</h1>
        <p className="lede">Every receipt you scan lands here. Open one to see its items and nutrition.</p>
      </div>

      {batches.length ? (
        <div className="batch-list">
          {batches.map((batch) => {
            const matched = batch.items.filter((item) => item.matchConfidence != null).length
            return (
              <Link className="batch-card" href={`/grocery/${batch.id}`} key={batch.id}>
                <div>
                  <strong>{batch.storeName ?? 'Grocery batch'}</strong>
                  <p>
                    {batch.ocrStatus === 'processing'
                      ? 'Still processing…'
                      : batch.items.length === 0
                        ? 'No items matched'
                        : `${batch.items.length} items · ${matched} with nutrition`}
                  </p>
                </div>
                <span aria-hidden="true">→</span>
              </Link>
            )
          })}
        </div>
      ) : (
        <section className="surface-card empty-state">
          <h2>No batches yet</h2>
          <p>Scan your first grocery receipt and it’ll show up here.</p>
          <Link className="button button-primary" href="/scan">
            Scan a receipt
          </Link>
        </section>
      )}
    </main>
  )
}
