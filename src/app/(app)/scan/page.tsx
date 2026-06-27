import Link from 'next/link'
import { ReceiptUploader } from '@/features/grocery/components/ReceiptUploader'

const flow = [
  'Upload a receipt or capture it on mobile',
  'Match grocery items automatically',
  'Review a clean summary before saving',
]

export default function ScanPage() {
  return (
    <main className="surface-page">
      <section className="surface-card">
        <p className="eyebrow">Capture flow</p>
        <h1>Show what the product does before asking for more effort.</h1>
        <p className="lede">
          Start with the value story, then try the receipt flow below. This keeps the first touch
          calm while still proving the app can turn a grocery receipt into useful nutrition output.
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
