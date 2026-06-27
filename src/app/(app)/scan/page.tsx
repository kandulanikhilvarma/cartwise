import Link from 'next/link'

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
          This page will become the actual scan entry point. For now it explains the flow, keeps
          the journey light, and gives the user a direct route to the save/login step.
        </p>
        <div className="flow-list">
          {flow.map((item, index) => (
            <div className="flow-item" key={item}>
              <span>{index + 1}</span>
              <p>{item}</p>
            </div>
          ))}
        </div>
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
