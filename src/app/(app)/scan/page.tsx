import Link from 'next/link'
import { ReceiptUploader } from '@/features/grocery/components/ReceiptUploader'

const flow = [
  'Capture your grocery receipt',
  'Auto-match line items without manual review steps',
  'Get three nutrition signals and edit only if needed',
]

export default function ScanPage() {
  return (
    <main className="surface-page">
      <section className="surface-card">
        <p className="eyebrow">Capture flow</p>
        <h1>Receipt first. Value in one pass.</h1>
        <p className="lede">
          The scan route is the core habit loop. Drop a receipt, let processing run, and review the
          nutrition output with lightweight corrections.
        </p>
        <div className="flow-list">
          {flow.map((item, index) => (
            <div className="flow-item" key={item}>
              <span>{index + 1}</span>
              <p>{item}</p>
            </div>
          ))}
        </div>
      </section>

      <ReceiptUploader />

      <section className="surface-card">
        <div className="cta-row">
          <Link className="button button-primary" href="/login">
            Save a batch
          </Link>
          <Link className="button button-secondary" href="/barcode">
            Try barcode lookup
          </Link>
        </div>
      </section>
    </main>
  )
}
