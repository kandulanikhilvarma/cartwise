import { notFound } from 'next/navigation'

type BatchPageProps = {
  params: Promise<{ batchId: string }>
}

export default async function BatchPage({ params }: BatchPageProps) {
  const { batchId } = await params
  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? ''}/api/grocery/${batchId}`, {
    cache: 'no-store',
  })

  if (!response.ok) {
    notFound()
  }

  const batch = (await response.json()) as {
    id: string
    storeName?: string | null
    ocrStatus: string
    purchasedAt: string
    items: Array<{ id: string; productName: string; quantity: number; unit?: string | null }>
  }

  return (
    <main className="surface-page">
      <section className="surface-card">
        <p className="eyebrow">Batch detail</p>
        <h1>{batch.storeName ?? batchId}</h1>
        <p className="lede">
          This is the single batch view. It now reads from the same shared batch store as upload,
          so the route reflects the current app state.
        </p>
        <div className="batch-list">
          {batch.items.map((item) => (
            <article className="batch-card" key={item.id}>
              <div>
                <strong>{item.productName}</strong>
                <p>
                  {item.quantity} {item.unit ?? 'item'}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
