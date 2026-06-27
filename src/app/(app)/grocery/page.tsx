import Link from 'next/link'
import { listBatches } from '@/infrastructure/state/batch-store'

export default function GroceryPage() {
  const batches = listBatches()

  return (
    <main className="surface-page">
      <section className="surface-card">
        <p className="eyebrow">Batches</p>
        <h1>Keep grocery runs in one place.</h1>
        <p className="lede">
          Batch history now reads from the shared batch store, so any uploaded receipt appears
          here right away.
        </p>
        <div className="batch-list">
          {batches.length ? (
            batches.map((batch) => (
              <article className="batch-card" key={batch.id}>
                <div>
                  <strong>{batch.storeName ?? 'Grocery batch'}</strong>
                  <p>
                    {batch.ocrStatus === 'processing'
                      ? 'Receipt is still processing.'
                      : 'Nutrition summary is ready.'}
                  </p>
                </div>
                <span>{batch.ocrStatus}</span>
                <Link href={`/grocery/${batch.id}`}>Open</Link>
              </article>
            ))
          ) : (
            <p className="fine-print">No batches yet. Upload one from Scan.</p>
          )}
        </div>
      </section>
    </main>
  )
}
