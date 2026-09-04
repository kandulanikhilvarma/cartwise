'use client'

import { useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { GroceryItem } from '@/features/grocery/types'
import { FOOD_GROUP_LABEL, type FoodGroup } from '@/features/nutrition/lib/food-group'

type FrequentItem = {
  productName: string
  packGrams: number | null
  timesBought: number
}

type GroceryItemListProps = {
  batchId: string
  items: GroceryItem[]
  /** Items this shopper has bought in more than one previous batch. */
  frequent?: FrequentItem[]
}

type Draft = {
  productName: string
  quantity: string
  packGrams: string
}

type Undo = { item: GroceryItem; label: string }

type FoodCandidate = { name: string; brand: string | null; source: string }

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

export function GroceryItemList({ batchId, items, frequent = [] }: GroceryItemListProps) {
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
  const [searchItemId, setSearchItemId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<FoodCandidate[] | null>(null)
  const [searching, setSearching] = useState(false)
  const editRef = useRef<HTMLInputElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

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

  function openSearch(item: GroceryItem) {
    setSearchItemId(item.id)
    setSearchQuery(item.productName)
    setSearchResults(null)
    setError(null)
    requestAnimationFrame(() => searchRef.current?.select())
  }

  async function runSearch() {
    const query = searchQuery.trim()
    if (query.length < 2) {
      setError('Type at least two characters to search.')
      return
    }

    setSearching(true)
    setError(null)
    try {
      const response = await fetch(`/api/food-db/search?q=${encodeURIComponent(query)}`)
      if (!response.ok) throw new Error('Could not reach the food databases.')
      const payload = (await response.json()) as { results?: FoodCandidate[] }
      setSearchResults(payload.results ?? [])
    } catch (searchError) {
      setError(
        searchError instanceof Error ? searchError.message : 'Could not reach the food databases.',
      )
    } finally {
      setSearching(false)
    }
  }

  async function applyCandidate(itemId: string, candidate: FoodCandidate) {
    // Renaming is what re-runs the lookup, so picking a candidate is a rename to
    // the name the source itself uses.
    const ok = await request(
      `/api/grocery/${batchId}/items/${itemId}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productName: candidate.name }),
      },
      `Matched to ${candidate.name}.`,
      'Could not apply that match.',
    )

    if (ok) {
      setSearchItemId(null)
      setSearchResults(null)
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

  function addFrequent(entry: FrequentItem) {
    void request(
      `/api/grocery/${batchId}/items`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: entry.productName,
          quantity: 1,
          packGrams: entry.packGrams,
        }),
      },
      `${entry.productName} added and matched.`,
      'Could not add that item.',
    )
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

      {frequent.length > 0 ? (
        <div className="buy-again">
          <p className="fine-print">
            You have bought these in more than one previous shop, and they are not in this one yet.
          </p>
          <div className="buy-again-row">
            {frequent.map((entry) => (
              <button
                className="buy-again-chip"
                disabled={isSubmitting}
                key={entry.productName}
                onClick={() => addFrequent(entry)}
                type="button"
              >
                <span>{entry.productName}</span>
                <span className="fine-print num">
                  {entry.timesBought}×{entry.packGrams ? ` · ${entry.packGrams} g` : ''}
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

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

                  {searchItemId === item.id ? (
                    <div className="food-search">
                      <div className="field-row">
                        <label className="field">
                          Search the food databases
                          <input
                            ref={searchRef}
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                            onKeyDown={(event) => {
                              if (event.key === 'Enter') void runSearch()
                            }}
                          />
                        </label>
                        <button
                          className="button button-secondary button-small"
                          disabled={searching}
                          onClick={() => void runSearch()}
                          type="button"
                        >
                          {searching ? 'Searching…' : 'Search'}
                        </button>
                        <button
                          className="button button-secondary button-small"
                          onClick={() => {
                            setSearchItemId(null)
                            setSearchResults(null)
                          }}
                          type="button"
                        >
                          Close
                        </button>
                      </div>

                      {searchResults?.length === 0 ? (
                        <p className="fine-print">
                          Neither database has anything under that name. Try a plainer word —
                          “cheddar” rather than a brand and pack size.
                        </p>
                      ) : null}

                      {searchResults && searchResults.length > 0 ? (
                        <ul className="food-search-results">
                          {searchResults.map((candidate) => (
                            <li key={`${candidate.source}-${candidate.name}`}>
                              <button
                                className="food-search-result"
                                disabled={isSubmitting}
                                onClick={() => void applyCandidate(item.id, candidate)}
                                type="button"
                              >
                                <span>{candidate.name}</span>
                                <span className="fine-print">
                                  {candidate.brand ? `${candidate.brand} · ` : ''}
                                  {SOURCE_LABEL[candidate.source] ?? candidate.source}
                                </span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  ) : null}
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
                <>
                  <button
                    className="button button-secondary button-small"
                    disabled={isSubmitting}
                    onClick={() => retryMatch(item)}
                    type="button"
                  >
                    Try match again
                  </button>
                  <button
                    className="button button-secondary button-small"
                    onClick={() => openSearch(item)}
                    type="button"
                  >
                    Search food
                  </button>
                </>
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
