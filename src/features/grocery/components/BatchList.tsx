'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { GroceryBatch } from '@/features/grocery/types'
import { Button, buttonClass } from '@/shared/components/Button'

type SortKey = 'newest' | 'oldest' | 'largest' | 'name'

const SORTS: Array<{ value: SortKey; label: string }> = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'largest', label: 'Most items' },
  { value: 'name', label: 'Store name' },
]

// Receipt dates are stored as UTC midnight. Formatting them in the local zone
// showed a 25 March shop as 24 March anywhere west of Greenwich.
function shopDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

export function BatchList({ batches }: { batches: GroceryBatch[] }) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortKey>('newest')
  const [busyId, setBusyId] = useState<string | null>(null)
  // Delete takes two clicks, like the batch page: one mis-tap used to remove a
  // whole shop with no way back.
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase()
    const filtered = needle
      ? batches.filter(
          (batch) =>
            (batch.storeName ?? '').toLowerCase().includes(needle) ||
            batch.items.some((item) => item.productName.toLowerCase().includes(needle)),
        )
      : batches

    return [...filtered].sort((a, b) => {
      if (sort === 'oldest') return a.purchasedAt.localeCompare(b.purchasedAt)
      if (sort === 'largest') return b.items.length - a.items.length
      if (sort === 'name') return (a.storeName ?? '').localeCompare(b.storeName ?? '')
      return b.purchasedAt.localeCompare(a.purchasedAt)
    })
  }, [batches, query, sort])

  async function remove(batch: GroceryBatch) {
    setBusyId(batch.id)
    setError(null)
    try {
      const response = await fetch(`/api/grocery/${batch.id}`, { method: 'DELETE' })
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { message?: string } | null
        throw new Error(payload?.message ?? 'Could not delete that batch.')
      }
      setConfirmId(null)
      router.refresh()
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Could not delete that batch.')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <>
      <div className="field-row">
        <label className="field">
          Search
          <input
            type="search"
            value={query}
            placeholder="Store or product name"
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <label className="field">
          Order
          <select value={sort} onChange={(event) => setSort(event.target.value as SortKey)}>
            {SORTS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p aria-live="polite" className="sr-status">
        {query
          ? `${visible.length} of ${batches.length} ${batches.length === 1 ? 'batch' : 'batches'} match “${query}”.`
          : ''}
      </p>
      {/* Always mounted, so a screen reader announces the text when it arrives. */}
      <p className="error-text" role="alert">
        {error ?? ''}
      </p>

      {visible.length === 0 ? (
        <section className="surface-card empty-state">
          <h2>No batch matches that</h2>
          <p>Try a different store or product name, or clear the search.</p>
          <Button  onClick={() => setQuery('')} type="button">
            Clear search
          </Button>
        </section>
      ) : (
        <div className="batch-list stagger">
          {visible.map((batch) => {
            const matched = batch.items.filter((item) => item.matchConfidence != null).length
            const name = batch.storeName ?? 'Grocery batch'
            const label = `${name}, ${shopDate(batch.purchasedAt)}`
            const confirming = confirmId === batch.id
            return (
              <article className="batch-card" key={batch.id}>
                <div>
                  <Link href={`/grocery/${batch.id}`}>
                    <strong>{name}</strong>
                  </Link>
                  <p className="num">
                    {shopDate(batch.purchasedAt)} ·{' '}
                    {batch.ocrStatus === 'processing'
                      ? 'still processing'
                      : batch.items.length === 0
                        ? 'no items matched'
                        : `${batch.items.length} items · ${matched} with nutrition`}
                  </p>
                </div>
                <div className="item-actions">
                  {confirming ? (
                    <>
                      <Button
                        variant="danger"
                        size="small"
                        disabled={busyId === batch.id}
                        onClick={() => remove(batch)}
                        aria-label={`Confirm: delete ${label} and its items`}
                      >
                        {busyId === batch.id ? 'Deleting…' : 'Yes, delete'}
                      </Button>
                      <Button
                        size="small"
                        disabled={busyId === batch.id}
                        onClick={() => setConfirmId(null)}
                        aria-label={`Keep ${label}`}
                      >
                        Keep
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link
                        className={buttonClass('secondary', 'small')}
                        href={`/grocery/${batch.id}`}
                        aria-label={`Open ${label}`}
                      >
                        Open
                      </Link>
                      <Button
                        variant="danger"
                        size="small"
                        onClick={() => setConfirmId(batch.id)}
                        aria-label={`Delete ${label}`}
                      >
                        Delete
                      </Button>
                    </>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      )}
    </>
  )
}
