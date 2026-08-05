import Link from 'next/link'
import { ReceiptUploader } from '@/features/grocery/components/ReceiptUploader'

export default function ScanPage() {
  return (
    <main className="surface-page">
      <div className="scan-intro">
        <h1>Scan a receipt.</h1>
        <p className="lede">
          Snap or upload your latest grocery receipt. It’s read on your device, matched to real nutrition
          data, and saved to your batches — no item-by-item confirming.
        </p>
      </div>

      <ReceiptUploader />

      <p className="fine-print">
        Missed an item, or scanning a single product?{' '}
        <Link href="/barcode">Look it up by barcode</Link>.
      </p>
    </main>
  )
}
