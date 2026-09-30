import Link from 'next/link'
import type { Metadata } from 'next'
import { auth } from '@/auth'
import { getProfile } from '@/infrastructure/state/batch-store'
import { ReceiptUploader } from '@/features/grocery/components/ReceiptUploader'

export const metadata: Metadata = { title: 'Scan a receipt' }

export default async function ScanPage() {
  const session = await auth()
  const ownerEmail = session?.user?.email
  const profile = ownerEmail ? await getProfile(ownerEmail) : null

  return (
    <main className="surface-page">
      <div className="scan-intro">
        <h1>Scan a receipt.</h1>
        <p className="lede">
          Snap or upload your latest grocery receipt. It’s read on your device, matched to real nutrition
          data, and saved to your batches — no item-by-item confirming.
        </p>
      </div>

      <ReceiptUploader profile={profile} signedIn={Boolean(ownerEmail)} />

      <p className="fine-print">
        Missed an item, or scanning a single product?{' '}
        <Link href="/barcode">Look it up by barcode</Link>.
      </p>
    </main>
  )
}
