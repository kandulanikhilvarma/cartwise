import { notFound } from 'next/navigation'
import { auth } from '@/auth'
import { getBatch } from '@/infrastructure/state/batch-store'
import { GroceryItemList } from '@/features/grocery/components/GroceryItemList'

type BatchPageProps = {
  params: Promise<{ batchId: string }>
}

export default async function BatchPage({ params }: BatchPageProps) {
  const { batchId } = await params
  const session = await auth()
  const ownerEmail = session?.user?.email

  if (!ownerEmail) {
    notFound()
  }

  const batch = await getBatch(ownerEmail, batchId)

  if (!batch) {
    notFound()
  }

  return (
    <main className="surface-page">
      <section className="surface-card">
        <p className="eyebrow">Batch detail</p>
        <h1>{batch.storeName ?? batchId}</h1>
        <p className="lede">
          This is the single batch view. It reads from the same shared batch store as upload, so
          the route reflects the current app state.
        </p>
        <p className="fine-print">OCR status: {batch.ocrStatus}</p>
        <GroceryItemList batchId={batch.id} items={batch.items} />
      </section>
    </main>
  )
}
