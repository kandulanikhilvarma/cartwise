import Link from 'next/link'
import type { Metadata } from 'next'
import { auth } from '@/auth'
import { listBatches } from '@/infrastructure/state/batch-store'
import { BatchList } from '@/features/grocery/components/BatchList'

export const metadata: Metadata = { title: 'Batches' }

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
        <BatchList batches={batches} />
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
