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
        <h1>{batch.storeName ?? 'Grocery batch'}</h1>
        <p className="lede">
          Edit a name to re-match nutrition, mark items as eaten, or remove anything that isn’t yours.
        </p>
        <GroceryItemList batchId={batch.id} items={batch.items} />
      </section>
    </main>
  )
}
