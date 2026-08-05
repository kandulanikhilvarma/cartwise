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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newName, setNewName] = useState('')
  const [newQuantity, setNewQuantity] = useState('1')
  const [newUnit, setNewUnit] = useState('item')
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editQuantity, setEditQuantity] = useState('1')
  const [editUnit, setEditUnit] = useState('item')

  const consumedCount = useMemo(
    () => localItems.filter((item) => item.consumed).length,
    [localItems],
  )

  async function refreshFromResponse(response: Response) {
    const updatedBatch = (await response.json()) as { items: GroceryItem[] }
    setLocalItems(updatedBatch.items)
    router.refresh()
  }

  async function toggleItem(itemId: string, consumed: boolean) {
    setError(null)
    const response = await fetch(`/api/grocery/${batchId}/items/${itemId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ consumed }),
    })

    if (!response.ok) {
      setError('Could not update item state.')
      return
    }

    await refreshFromResponse(response)
  }

  async function addItem() {
    const productName = newName.trim()
    if (!productName) {
      setError('Enter a product name.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch(`/api/grocery/${batchId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName,
          quantity: Number(newQuantity) || 1,
          unit: newUnit.trim() || 'item',
        }),
      })

      if (!response.ok) {
        throw new Error('Could not add item.')
      }

      await refreshFromResponse(response)
      setNewName('')
      setNewQuantity('1')
      setNewUnit('item')
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not add item.')
    } finally {
      setIsSubmitting(false)
    }
  }

  function startEdit(item: GroceryItem) {
    setEditingItemId(item.id)
    setEditName(item.productName)
    setEditQuantity(String(item.quantity))
    setEditUnit(item.unit ?? 'item')
    setError(null)
  }

  async function saveEdit(itemId: string) {
    const productName = editName.trim()
    if (!productName) {
      setError('Product name cannot be empty.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch(`/api/grocery/${batchId}/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName,
          quantity: Number(editQuantity) || 1,
          unit: editUnit.trim() || 'item',
        }),
      })

      if (!response.ok) {
        throw new Error('Could not save item changes.')
      }

      await refreshFromResponse(response)
      setEditingItemId(null)
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : 'Could not save item changes.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  async function removeItem(itemId: string) {
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch(`/api/grocery/${batchId}/items/${itemId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Could not remove item.')
      }

      await refreshFromResponse(response)
      if (editingItemId === itemId) {
        setEditingItemId(null)
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not remove item.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="surface-card">
      <div className="section-header">
        <p className="eyebrow">Items</p>
        <h2>
          {consumedCount}/{localItems.length} consumed
        </h2>
      </div>
      <section className="item-form-grid" aria-label="Add grocery item">
        <input
          aria-label="Product name"
          placeholder="Add product name"
          value={newName}
          onChange={(event) => setNewName(event.target.value)}
        />
        <input
          aria-label="Quantity"
          inputMode="decimal"
          value={newQuantity}
          onChange={(event) => setNewQuantity(event.target.value)}
        />
        <input
          aria-label="Unit"
          placeholder="item"
          value={newUnit}
          onChange={(event) => setNewUnit(event.target.value)}
        />
        <button className="button button-primary" disabled={isSubmitting} onClick={addItem} type="button">
          Add item
        </button>
      </section>
      {error ? <p className="error-text">{error}</p> : null}
      <div className="batch-list">
        {localItems.map((item) => (
          <article className={`batch-card ${item.consumed ? 'batch-card-done' : ''}`} key={item.id}>
            <div className="item-main">
              {editingItemId === item.id ? (
                <div className="item-form-grid item-form-grid-inline">
                  <input
                    aria-label="Edit product name"
                    value={editName}
                    onChange={(event) => setEditName(event.target.value)}
                  />
                  <input
                    aria-label="Edit quantity"
                    inputMode="decimal"
                    value={editQuantity}
                    onChange={(event) => setEditQuantity(event.target.value)}
                  />
                  <input
                    aria-label="Edit unit"
                    value={editUnit}
                    onChange={(event) => setEditUnit(event.target.value)}
                  />
                </div>
              ) : (
                <>
                  <strong>{item.productName}</strong>
                  <p>
                    {item.quantity} {item.unit ?? 'item'}
                  </p>
                </>
              )}
              <span className="item-state">{item.consumed ? 'Consumed' : 'Not consumed'}</span>
            </div>
            <div className="item-actions">
              <button
                className="button button-secondary"
                onClick={() => toggleItem(item.id, !item.consumed)}
                type="button"
              >
                {item.consumed ? 'Mark not consumed' : 'Mark consumed'}
              </button>
              {editingItemId === item.id ? (
                <>
                  <button
                    className="button button-primary"
                    disabled={isSubmitting}
                    onClick={() => saveEdit(item.id)}
                    type="button"
                  >
                    Save
                  </button>
                  <button
                    className="button button-secondary"
                    onClick={() => setEditingItemId(null)}
                    type="button"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button className="button button-secondary" onClick={() => startEdit(item)} type="button">
                  Edit
                </button>
              )}
              <button
                className="button button-danger"
                disabled={isSubmitting}
                onClick={() => removeItem(item.id)}
                type="button"
              >
                Remove
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}