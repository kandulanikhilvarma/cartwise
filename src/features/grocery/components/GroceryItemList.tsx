'use client'

import { useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { GroceryItem } from '@/features/grocery/types'
import { FOOD_GROUP_LABEL, type FoodGroup } from '@/features/nutrition/lib/food-group'

type GroceryItemListProps = {
  batchId: string
  items: GroceryItem[]
}

type Draft = {
  productName: string
  quantity: string
  packGrams: string
}

type Undo = { item: GroceryItem; label: string }

function groupLabel(group?: string | null): string | null {
  if (!group) return null
  return FOOD_GROUP_LABEL[group as FoodGroup] ?? null
}

const SOURCE_LABEL: Record<string, string> = {
  usda: 'USDA',
  off: 'Open Food Facts',
}

/**
 * Which database answered, not a percentage. The stored confidence only ever
 * holds one of two source constants, so printing it as "70% match" invented a
 * precision the number never had.
 */
function sourceLabel(item: GroceryItem): string {
  return (item.matchSource && SOURCE_LABEL[item.matchSource]) ?? 'Matched'
}

function titleCase(value: string): string {
  return value.replace(/\b[a-z]/g, (character) => character.toUpperCase())
}

export function GroceryItemList({ batchId, items }: GroceryItemListProps) {
  const router = useRouter()
  const [localItems, setLocalItems] = useState(items)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState('')
  const [newName, setNewName] = useState('')
  const [newQuantity, setNewQuantity] = useState('1')
  const [newGrams, setNewGrams] = useState('')
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [draft, setDraft] = useState<Draft>({ productName: '', quantity: '1', packGrams: '' })
  const [undo, setUndo] = useState<Undo | null>(null)
  const editRef = useRef<HTMLInputElement>(null)

  const consumedCount = useMemo(
    () => localItems.filter((item) => item.consumed).length,
    [localItems],
  )
  const noWeightCount = useMemo(
    () => localItems.filter((item) => item.matchConfidence != null && !item.packGrams).length,
    [localItems],
  )

  async function apply(response: Response, message: string) {
    const updatedBatch = (await response.json()) as { items: GroceryItem[] }
    setLocalItems(updatedBatch.items)
    setStatus(message)
    router.refresh()
  }

  async function request(
    url: string,
    init: RequestInit,
    successMessage: string,
    failureMessage: string,
  ): Promise<boolean> {
    setIsSubmitting(true)
    setError(null)
    try {
      const response = await fetch(url, init)
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { message?: string } | null
        throw new Error(payload?.message ?? failureMessage)
      }
      await apply(response, successMessage)
      return true
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : failureMessage)
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  function retryMatch(item: GroceryItem) {
    void request(
      `/api/grocery/${batchId}/items/${item.id}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rematch: true }),
      },
      `Asked the nutrition sources about ${item.productName} again.`,
      'Could not reach the nutrition sources.',
    )
  }

  function toggleItem(item: GroceryItem) {
    const next = !item.consumed
    void request(
      `/api/grocery/${batchId}/items/${item.id}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consumed: next }),
      },
      `${item.productName} marked ${next ? 'eaten' : 'not eaten'}.`,
      'Could not update that item.',
    )
  }

  async function addItem() {
    const productName = newName.trim()
    if (!productName) {
      setError('Enter a product name.')
      return
    }

    const grams = newGrams.trim() ? Number(newGrams) : null
    const ok = await request(
      `/api/grocery/${batchId}/items`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName,
          quantity: Number(newQuantity) || 1,
          packGrams: grams,
        }),
      },
      `${productName} added and matched.`,
      'Could not add that item.',
    )

    if (ok) {
      setNewName('')
      setNewQuantity('1')
      setNewGrams('')
    }
  }

  function startEdit(item: GroceryItem) {
    setEditingItemId(item.id)
    setDraft({
      productName: item.productName,
      quantity: String(item.quantity),
      packGrams: item.packGrams ? String(item.packGrams) : '',
    })
    setError(null)
    setStatus(`Editing ${item.productName}.`)
    // Move focus into the row that just became editable.
    requestAnimationFrame(() => editRef.current?.focus())
  }

  async function saveEdit(itemId: string) {
    const productName = draft.productName.trim()
    if (!productName) {
      setError('Product name cannot be empty.')
      return
    }

    const grams = draft.packGrams.trim() ? Number(draft.packGrams) : null
    const ok = await request(
      `/api/grocery/${batchId}/items/${itemId}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName,
          quantity: Number(draft.quantity) || 1,
          packGrams: grams,
        }),
      },
      `${productName} saved and re-matched.`,
      'Could not save that item.',
    )

    if (ok) setEditingItemId(null)
  }

  async function removeItem(item: GroceryItem) {
    const ok = await request(
      `/api/grocery/${batchId}/items/${item.id}`,
      { method: 'DELETE' },
      `${item.productName} removed.`,
      'Could not remove that item.',
    )

    if (ok) {
      setUndo({ item, label: item.productName })
      if (editingItemId === item.id) setEditingItemId(null)
    }
  }

  async function undoRemove() {
    if (!undo) return
    const restored = undo.item
    setUndo(null)
    await request(
      `/api/grocery/${batchId}/items`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: restored.productName,
          quantity: restored.quantity,
          packGrams: restored.packGrams ?? null,
        }),
      },
      `${restored.productName} restored.`,
      'Could not restore that item.',
    )
  }

  return (
    <section className="surface-card">
      <div className="section-header">
        <p className="eyebrow">Items</p>
        <h2 className="num">
          {consumedCount} of {localItems.length} eaten
        </h2>
        {noWeightCount > 0 ? (
          <p className="fine-print">
            {noWeightCount} matched {noWeightCount === 1 ? 'item has' : 'items have'} no weight, so{' '}
            {noWeightCount === 1 ? 'it is' : 'they are'} left out of the totals. Edit one to add its
            pack size.
          </p>
        ) : null}
      </div>

      <div className="item-form-grid" role="group" aria-label="Add a grocery item">
        <label className="field">
          Product
          <input
            placeholder="Wholemeal bread"
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
          />
        </label>
        <label className="field">
          Quantity
          <input
            inputMode="decimal"
            value={newQuantity}
            onChange={(event) => setNewQuantity(event.target.value)}
          />
        </label>
        <label className="field">
          Weight in grams
          <input
            inputMode="decimal"
            placeholder="800"
            value={newGrams}
            onChange={(event) => setNewGrams(event.target.value)}
          />
        </label>
        <button className="button button-primary" disabled={isSubmitting} onClick={addItem} type="button">
          Add item
        </button>
      </div>

      <p aria-live="polite" className="sr-status">
        {status}
      </p>
      {error ? (
        <p aria-live="assertive" className="error-text">
          {error}
        </p>
      ) : null}

      <div className="stagger">
        {localItems.map((item) => (
          <article className={`item-row${item.consumed ? ' is-consumed' : ''}`} key={item.id}>
            <div className="item-main">
              {editingItemId === item.id ? (
                <div className="item-form-grid item-form-grid-inline">
                  <label className="field">
                    Product
                    <input
                      ref={editRef}
                      value={draft.productName}
                      onChange={(event) =>
                        setDraft((current) => ({ ...current, productName: event.target.value }))
                      }
                    />
                  </label>
                  <label className="field">
                    Quantity
                    <input
                      inputMode="decimal"
                      value={draft.quantity}
                      onChange={(event) =>
                        setDraft((current) => ({ ...current, quantity: event.target.value }))
                      }
                    />
                  </label>
                  <label className="field">
                    Weight in grams
                    <input
                      inputMode="decimal"
                      placeholder="Not on the receipt"
                      value={draft.packGrams}
                      onChange={(event) =>
                        setDraft((current) => ({ ...current, packGrams: event.target.value }))
                      }
                    />
                  </label>
                </div>
              ) : (
                <>
                  <span className="item-name">{item.productName}</span>
                  <div className="item-meta">
                    <span className="num">
                      {item.quantity} × {item.packGrams ? `${item.packGrams} g` : 'unknown weight'}
                    </span>
                    {item.linePrice != null ? (
                      <span className="num">{item.linePrice.toFixed(2)}</span>
                    ) : null}
                    {groupLabel(item.foodGroup) ? (
                      <span className="item-chip">{groupLabel(item.foodGroup)}</span>
                    ) : null}
                    {item.nutriScore ? (
                      <span className="item-chip">
                        Nutri-Score {item.nutriScore.toUpperCase()}
                      </span>
                    ) : null}
                    {item.novaGroup === 4 ? (
                      <span className="item-chip">Ultra-processed</span>
                    ) : null}
                    {(item.allergens ?? []).map((allergen) => (
                      <span className="item-chip is-allergen" key={allergen}>
                        Contains {allergen}
                      </span>
                    ))}
                    {(item.additives ?? []).length > 0 ? (
                      <span className="item-chip" title={(item.additives ?? []).map(titleCase).join(', ')}>
                        {(item.additives ?? []).length} additives
                      </span>
                    ) : null}
                    {item.matchConfidence == null ? (
                      <span className="item-chip is-unmatched">No nutrition match</span>
                    ) : !item.packGrams ? (
                      <span className="item-chip is-noweight">Not in totals — no weight</span>
                    ) : (
                      <span className="item-chip">{sourceLabel(item)}</span>
                    )}
                  </div>
                </>
              )}
            </div>
            <div className="item-actions">
              <button
                className="button button-secondary button-small"
                onClick={() => toggleItem(item)}
                type="button"
              >
                {item.consumed ? 'Mark not eaten' : 'Mark eaten'}
              </button>
              {item.matchConfidence == null && editingItemId !== item.id ? (
                <button
                  className="button button-secondary button-small"
                  disabled={isSubmitting}
                  onClick={() => retryMatch(item)}
                  type="button"
                >
                  Try match again
                </button>
              ) : null}
              {editingItemId === item.id ? (
                <>
                  <button
                    className="button button-primary button-small"
                    disabled={isSubmitting}
                    onClick={() => saveEdit(item.id)}
                    type="button"
                  >
                    Save
                  </button>
                  <button
                    className="button button-secondary button-small"
                    onClick={() => setEditingItemId(null)}
                    type="button"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  className="button button-secondary button-small"
                  onClick={() => startEdit(item)}
                  type="button"
                >
                  Edit
                </button>
              )}
              <button
                className="button button-danger button-small"
                disabled={isSubmitting}
                onClick={() => removeItem(item)}
                type="button"
              >
                Remove
              </button>
            </div>
          </article>
        ))}
      </div>

      {undo ? (
        <div className="toast" role="status">
          <span>{undo.label} removed.</span>
          <button onClick={undoRemove} type="button">
            Undo
          </button>
          <button onClick={() => setUndo(null)} type="button" aria-label="Dismiss">
            ✕
          </button>
        </div>
      ) : null}
    </section>
  )
}
