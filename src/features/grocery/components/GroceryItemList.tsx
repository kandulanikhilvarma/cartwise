'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { GroceryItem } from '@/features/grocery/types'

type GroceryItemListProps = {
  batchId: string
  items: GroceryItem[]
}

export function GroceryItemList({ batchId, items }: GroceryItemListProps) {
  const router = useRouter()
  const [localItems, setLocalItems] = useState(items)

  const consumedCount = useMemo(
    () => localItems.filter((item) => item.consumed).length,
    [localItems],
  )

  async function toggleItem(itemId: string, consumed: boolean) {
    const response = await fetch(`/api/grocery/${batchId}/items/${itemId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ consumed }),
    })

    if (!response.ok) {
      return
    }

    const updatedBatch = (await response.json()) as { items: GroceryItem[] }
    setLocalItems(updatedBatch.items)
    router.refresh()
  }

  return (
    <section className="surface-card">
      <div className="section-header">
        <p className="eyebrow">Items</p>
        <h2>
          {consumedCount}/{localItems.length} consumed
        </h2>
      </div>
      <div className="batch-list">
        {localItems.map((item) => (
          <article className={`batch-card ${item.consumed ? 'batch-card-done' : ''}`} key={item.id}>
            <div>
              <strong>{item.productName}</strong>
              <p>
                {item.quantity} {item.unit ?? 'item'}
              </p>
              <span className="item-state">{item.consumed ? 'Consumed' : 'Not consumed'}</span>
            </div>
            <button
              className="button button-secondary"
              onClick={() => toggleItem(item.id, !item.consumed)}
              type="button"
            >
              {item.consumed ? 'Mark not consumed' : 'Mark consumed'}
            </button>
          </article>
        ))}
      </div>
    </section>
  )
}