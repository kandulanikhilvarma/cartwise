import Link from 'next/link'

const batches = [
  {
    id: 'batch-001',
    label: 'Weekly grocery run',
    status: 'Processing',
    detail: 'Receipt parsed, nutrition summary pending.',
  },
  {
    id: 'batch-002',
    label: 'Top-up shop',
    status: 'Done',
    detail: '3 insights ready for review.',
  },
]

export default function GroceryPage() {
  return (
    <main className="surface-page">
      <section className="surface-card">
        <p className="eyebrow">Batches</p>
        <h1>Keep grocery runs in one place.</h1>
        <p className="lede">
          Batch history will later support saving and returning users. For now this page shows the
          shape of the product and gives each batch a simple, scannable summary.
        </p>
        <div className="batch-list">
          {batches.map((batch) => (
            <article className="batch-card" key={batch.id}>
              <div>
                <strong>{batch.label}</strong>
                <p>{batch.detail}</p>
              </div>
              <span>{batch.status}</span>
              <Link href={`/grocery/${batch.id}`}>Open</Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
