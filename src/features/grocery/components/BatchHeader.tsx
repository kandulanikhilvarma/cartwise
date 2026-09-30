'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, buttonClass } from '@/shared/components/Button'

async function failure(response: Response, fallback: string): Promise<Error> {
  const payload = (await response.json().catch(() => null)) as { message?: string } | null
  return new Error(payload?.message ?? fallback)
}

// When a button swaps for another, focus goes to its replacement. Otherwise it
// falls back to <body> and a keyboard user starts again from the top.
function focusNext(ref: React.RefObject<HTMLElement | null>) {
  requestAnimationFrame(() => ref.current?.focus())
}

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
  const nameRef = useRef<HTMLInputElement>(null)
  const renameRef = useRef<HTMLButtonElement>(null)
  const deleteRef = useRef<HTMLButtonElement>(null)
  const keepRef = useRef<HTMLButtonElement>(null)

  // Stored as UTC midnight; formatting in the local zone moved it a day back
  // anywhere west of Greenwich.
  const shopDate = new Date(purchasedAt).toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
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
      if (!response.ok) throw await failure(response, 'Could not rename that batch.')
      setEditing(false)
      focusNext(renameRef)
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
      if (!response.ok) throw await failure(response, 'Could not delete that batch.')
      router.push('/grocery')
      router.refresh()
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Could not delete that batch.')
      setBusy(false)
    }
  }

  return (
    <div className="scan-intro">
      {/* The heading stays while renaming, so the page keeps its name. */}
      <h1>{storeName}</h1>
      {editing ? (
        <label className="field" style={{ maxWidth: '26rem' }}>
          Batch name
          <input ref={nameRef} value={name} onChange={(event) => setName(event.target.value)} />
        </label>
      ) : null}

      <p className="lede num">Shopped {shopDate}</p>

      <div className="cta-row">
        {editing ? (
          <>
            <Button variant="primary" size="small" disabled={busy} onClick={saveName}>
              Save name
            </Button>
            <Button
              size="small"
              onClick={() => {
                setName(storeName)
                setEditing(false)
                focusNext(renameRef)
              }}
            >
              Cancel
            </Button>
          </>
        ) : (
          <Button
            ref={renameRef}
            size="small"
            onClick={() => {
              setEditing(true)
              focusNext(nameRef)
            }}
          >
            Rename
          </Button>
        )}

        <a className={buttonClass('secondary', 'small')} href={`/api/grocery/${batchId}/export`}>
          Export CSV
        </a>

        {confirming ? (
          <>
            <Button variant="danger" size="small" disabled={busy} onClick={remove}>
              {busy ? 'Deleting…' : 'Yes, delete this batch'}
            </Button>
            <Button
              ref={keepRef}
              size="small"
              onClick={() => {
                setConfirming(false)
                focusNext(deleteRef)
              }}
            >
              Keep it
            </Button>
          </>
        ) : (
          <Button
            ref={deleteRef}
            variant="danger"
            size="small"
            onClick={() => {
              setConfirming(true)
              focusNext(keepRef)
            }}
          >
            Delete batch
          </Button>
        )}
      </div>

      <p className="error-text" role="alert">
        {error ?? ''}
      </p>
    </div>
  )
}
