'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, buttonClass } from '@/shared/components/Button'

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
            <Button
              variant="primary"
              size="small"
              disabled={busy}
              onClick={saveName}
            >
              Save name
            </Button>
            <Button
              size="small"
              onClick={() => {
                setName(storeName)
                setEditing(false)
              }}
            >
              Cancel
            </Button>
          </>
        ) : (
          <Button
            size="small"
            onClick={() => setEditing(true)}
          >
            Rename
          </Button>
        )}

        <a className={buttonClass('secondary', 'small')} href={`/api/grocery/${batchId}/export`}>
          Export CSV
        </a>

        {confirming ? (
          <>
            <Button
              variant="danger"
              size="small"
              disabled={busy}
              onClick={remove}
            >
              {busy ? 'Deleting…' : 'Yes, delete this batch'}
            </Button>
            <Button
              size="small"
              onClick={() => setConfirming(false)}
            >
              Keep it
            </Button>
          </>
        ) : (
          <Button
            variant="danger"
            size="small"
            onClick={() => setConfirming(true)}
          >
            Delete batch
          </Button>
        )}
      </div>

      {error ? <p className="error-text">{error}</p> : null}
    </div>
  )
}
