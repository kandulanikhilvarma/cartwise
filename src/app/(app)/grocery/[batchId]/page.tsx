import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { auth } from '@/auth'
import { getBatch, getProfile, listFrequentItems } from '@/infrastructure/state/batch-store'
import { GroceryItemList } from '@/features/grocery/components/GroceryItemList'
import { BatchHeader } from '@/features/grocery/components/BatchHeader'
import { NutritionSummary } from '@/features/nutrition/components/NutritionSummary'

type BatchPageProps = {
  params: Promise<{ batchId: string }>
}

export const metadata: Metadata = { title: 'Batch' }

export default async function BatchPage({ params }: BatchPageProps) {
  const { batchId } = await params
  const session = await auth()
  const ownerEmail = session?.user?.email

  if (!ownerEmail) {
    notFound()
  }

  const [batch, profile, frequent] = await Promise.all([
    getBatch(ownerEmail, batchId),
    getProfile(ownerEmail),
    listFrequentItems(ownerEmail, { excludeBatchId: batchId }),
  ])

  if (!batch) {
    notFound()
  }

  return (
    <main className="surface-page">
      <BatchHeader
        batchId={batch.id}
        storeName={batch.storeName ?? 'Grocery batch'}
        purchasedAt={batch.purchasedAt}
      />

      {batch.itemsTruncated ? (
        <p className="notice">
          This receipt was longer than Cartwise reads in one pass, so the last lines were left out.
          Add anything missing below.
        </p>
      ) : null}

      {batch.items.length > 0 ? (
        <section className="surface-card">
          <NutritionSummary
            items={batch.items}
            profile={profile}
            currency={batch.currency ?? null}
            receiptTotal={batch.totalSpend}
          />
        </section>
      ) : null}

      <GroceryItemList batchId={batch.id} frequent={frequent} items={batch.items} />
    </main>
  )
}
