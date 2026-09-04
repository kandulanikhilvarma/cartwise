'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function BatchHeader({
  batchId,
  storeName,
  purchasedAt,
}: {
  batchId: string
  storeName: string
  purchasedAt: string
}) {
  const router = useRouter()
  const [name, setName] = useState(storeName)
  const [editing, setEditing] = useState(false)
  const [busy, setBusy] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const shopDate = new Date(purchasedAt).toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  async function saveName() {
    const next = name.trim()
    if (!next) {
      setError('A name is required.')
      return
    }

    setBusy(true)
    setError(null)
    try {
      const response = await fetch(`/api/grocery/${batchId}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ storeName: next }),
      })
      if (!response.ok) throw new Error('Could not rename that batch.')
      setEditing(false)
      router.refresh()
    } catch (renameError) {
      setError(renameError instanceof Error ? renameError.message : 'Could not rename that batch.')
    } finally {
      setBusy(false)
    }
  }

  async function remove() {
    setBusy(true)
    setError(null)
    try {
      const response = await fetch(`/api/grocery/${batchId}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Could not delete that batch.')
      router.push('/grocery')
      router.refresh()
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Could not delete that batch.')
      setBusy(false)
    }
  }

  return (
    <div className="scan-intro">
      {editing ? (
        <label className="field" style={{ maxWidth: '26rem' }}>
          Batch name
          <input value={name} onChange={(event) => setName(event.target.value)} autoFocus />
        </label>
      ) : (
        <h1>{storeName}</h1>
      )}

      <p className="lede num">Shopped {shopDate}</p>

      <div className="cta-row">
        {editing ? (
          <>
            <button
              className="button button-primary button-small"
              disabled={busy}
              onClick={saveName}
              type="button"
            >
              Save name
            </button>
            <button
              className="button button-secondary button-small"
              onClick={() => {
                setName(storeName)
                setEditing(false)
              }}
              type="button"
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            className="button button-secondary button-small"
            onClick={() => setEditing(true)}
            type="button"
          >
            Rename
          </button>
        )}

        <a className="button button-secondary button-small" href={`/api/grocery/${batchId}/export`}>
          Export CSV
        </a>

        {confirming ? (
          <>
            <button
              className="button button-danger button-small"
              disabled={busy}
              onClick={remove}
              type="button"
            >
              {busy ? 'Deleting…' : 'Yes, delete this batch'}
            </button>
            <button
              className="button button-secondary button-small"
              onClick={() => setConfirming(false)}
              type="button"
            >
              Keep it
            </button>
          </>
        ) : (
          <button
            className="button button-danger button-small"
            onClick={() => setConfirming(true)}
            type="button"
          >
            Delete batch
          </button>
        )}
      </div>

      {error ? <p className="error-text">{error}</p> : null}
    </div>
  )
}
