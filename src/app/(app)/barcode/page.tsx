import type { Metadata } from 'next'
import { auth } from '@/auth'
import { listBatches } from '@/infrastructure/state/batch-store'
import { BarcodeLookup } from '@/features/scanner/components/BarcodeLookup'

export const metadata: Metadata = { title: 'Barcode' }

function shopLabel(storeName: string | null | undefined, purchasedAt: string): string {
  const date = new Date(purchasedAt).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  })
  return `${storeName ?? 'Grocery batch'} · ${date}`
}

export default async function BarcodePage() {
  const session = await auth()
  const ownerEmail = session?.user?.email
  const batches = ownerEmail ? await listBatches(ownerEmail) : []
  // Newest first; a product is nearly always added to the shop just scanned.
  const shops = batches
    .slice(0, 12)
    .map((batch) => ({ id: batch.id, label: shopLabel(batch.storeName, batch.purchasedAt) }))

  return (
    <main className="surface-page">
      <div className="scan-intro">
        <h1>Add an item by barcode.</h1>
        <p className="lede">
          Scan or type a product barcode to pull its nutrition, then add it to a shop — handy when a
          receipt missed something.
        </p>
      </div>

      <BarcodeLookup shops={shops} />
    </main>
  )
}
