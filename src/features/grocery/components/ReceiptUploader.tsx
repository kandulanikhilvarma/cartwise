'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { GroceryBatch, GroceryItem } from '@/features/grocery/types'
import type { NutrientProfile } from '@/features/nutrition/lib/rda-constants'
import { NutritionSummary } from '@/features/nutrition/components/NutritionSummary'
import { ReceiptCropper } from '@/features/grocery/components/ReceiptCropper'
import { ocrReceiptToLines, type CropRect } from '@/features/grocery/lib/client-ocr'
import { joinPages } from '@/infrastructure/ocr/receipt-parse'
import { Button, buttonClass } from '@/shared/components/Button'

type Stage = 'idle' | 'reading' | 'matching'

const STAGE_COPY: Record<Exclude<Stage, 'idle'>, string> = {
  reading: 'Reading the receipt on your device.',
  matching: 'Matching items to nutrition data.',
}

// A long till roll photographed in sections. More than a handful is a sign the
// photos are of different shops, which belong in different batches.
const MAX_PAGES = 5

const SOURCE_LABEL: Record<string, string> = {
  usda: 'USDA',
  off: 'Open Food Facts',
}

type Page = {
  id: string
  file: File
  url: string
  crop: CropRect | null
}

function matchNote(item: GroceryItem): string {
  if (item.matchConfidence == null) {
    return 'No nutrition match — open the batch to fix the name or retry.'
  }
  const source = item.matchSource ? SOURCE_LABEL[item.matchSource] : null
  return source ? `Nutrition from ${source}.` : 'Nutrition matched.'
}

export function ReceiptUploader({ profile }: { profile?: NutrientProfile | null }) {
  const router = useRouter()
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const pagesRef = useRef<Page[]>([])
  const [pages, setPages] = useState<Page[]>([])
  const [dragging, setDragging] = useState(false)
  const [stage, setStage] = useState<Stage>('idle')
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [batch, setBatch] = useState<GroceryBatch | null>(null)

  const isBusy = stage !== 'idle'
  const items = batch?.items ?? []
  const matchedCount = items.filter((item) => item.matchConfidence != null).length

  pagesRef.current = pages

  // Object URLs outlive the render that made them, so they are released when the
  // page is dropped or the component goes away, not on every state change.
  useEffect(() => {
    return () => {
      for (const page of pagesRef.current) URL.revokeObjectURL(page.url)
    }
  }, [])

  function addFiles(incoming: FileList | null) {
    const chosen = Array.from(incoming ?? [])
    if (chosen.length === 0) return

    if (chosen.some((file) => !file.type.startsWith('image/'))) {
      setError('Those need to be images. Use photos of your receipt.')
      return
    }

    // Worked out here, not inside a state updater: StrictMode runs updaters
    // twice, which made one object URL per photo that was never revoked.
    const room = MAX_PAGES - pagesRef.current.length
    if (room <= 0) {
      setError(`Cartwise reads up to ${MAX_PAGES} photos in one batch.`)
      return
    }
    const added = chosen.slice(0, room).map((file) => ({
      id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`,
      file,
      url: URL.createObjectURL(file),
      crop: null,
    }))

    setError(null)
    setBatch(null)
    setPages((current) => [...current, ...added])
  }

  function removePage(id: string) {
    setPages((current) => {
      const target = current.find((page) => page.id === id)
      if (target) URL.revokeObjectURL(target.url)
      return current.filter((page) => page.id !== id)
    })
    setBatch(null)
  }

  function setCrop(id: string, crop: CropRect | null) {
    setPages((current) => current.map((page) => (page.id === id ? { ...page, crop } : page)))
  }

  async function handleProcess() {
    if (pages.length === 0) {
      setError('Choose or take a photo of your receipt first.')
      return
    }

    setError(null)
    setBatch(null)
    setStage('reading')
    setProgress(0)

    try {
      const pageLines: string[][] = []
      for (const [index, page] of pages.entries()) {
        pageLines.push(
          await ocrReceiptToLines(
            page.file,
            // Each photo owns its slice of the bar, so the bar never restarts.
            (value) => setProgress((index + value) / pages.length),
            page.crop,
          ),
        )
      }
      // Overlapping photos repeat the lines at each seam; keep them once.
      const lines = joinPages(pageLines)

      if (lines.join('').trim().length === 0) {
        throw new Error('Couldn’t read any text. Try a sharper, well-lit photo of the whole receipt.')
      }

      setStage('matching')
      const response = await fetch('/api/grocery/receipt', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ lines }),
      })

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { message?: string } | null
        throw new Error(payload?.message ?? `Processing failed (${response.status}).`)
      }

      setBatch((await response.json()) as GroceryBatch)
      router.refresh()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Processing failed')
    } finally {
      setStage('idle')
    }
  }

  return (
    <div className="receipt-uploader">
      <div className="upload-card">
        <div className="upload-visual">
          <h2>Add a receipt</h2>
          <p>Read on your device — only the text is sent, never the photo.</p>
        </div>

        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          hidden
          onChange={(event) => {
            addFiles(event.target.files)
            event.target.value = ''
          }}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(event) => {
            addFiles(event.target.files)
            event.target.value = ''
          }}
        />

        {pages.length > 0 ? (
          <div className="page-list">
            {pages.map((page, index) => (
              <div className="page-card" key={page.id}>
                <div className="page-card-head">
                  <strong>
                    {pages.length > 1 ? `Photo ${index + 1} of ${pages.length}` : page.file.name}
                  </strong>
                  <Button
                    size="small"
                    disabled={isBusy}
                    onClick={() => removePage(page.id)}
                  >
                    Remove
                  </Button>
                </div>
                <ReceiptCropper
                  alt={`Receipt photo ${index + 1}`}
                  crop={page.crop}
                  disabled={isBusy}
                  onChange={(crop) => setCrop(page.id, crop)}
                  src={page.url}
                />
              </div>
            ))}

            {pages.length < MAX_PAGES ? (
              <div className="upload-drop-actions">
                <Button
                  disabled={isBusy}
                  onClick={() => cameraInputRef.current?.click()}
                >
                  Photograph the next part
                </Button>
                <Button
                  disabled={isBusy}
                  onClick={() => fileInputRef.current?.click()}
                >
                  Add another image
                </Button>
              </div>
            ) : null}
          </div>
        ) : (
          <div
            className={`upload-drop${dragging ? ' is-dragging' : ''}`}
            onDragOver={(event) => {
              event.preventDefault()
              setDragging(true)
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault()
              setDragging(false)
              addFiles(event.dataTransfer.files)
            }}
          >
            <p className="upload-drop-hint">
              Lay the receipt flat and fill the frame. A long till roll can go in as several
              photos — they are read as one shop.
            </p>
            <div className="upload-drop-actions">
              <Button variant="primary"  type="button" onClick={() => cameraInputRef.current?.click()}>
                Take photo
              </Button>
              <Button  type="button" onClick={() => fileInputRef.current?.click()}>
                Upload image
              </Button>
            </div>
          </div>
        )}

        <Button
          variant="primary"
          className="upload-process"
          disabled={isBusy || pages.length === 0}
          onClick={handleProcess}
        >
          {stage === 'reading'
            ? `Reading receipt… ${Math.round(progress * 100)}%`
            : stage === 'matching'
              ? 'Matching nutrition…'
              : pages.length > 1
                ? `Process ${pages.length} photos`
                : 'Process receipt'}
        </Button>

        {stage === 'reading' ? (
          <div className="progress-track" aria-hidden="true">
            <span className="progress-fill" style={{ width: `${Math.round(progress * 100)}%` }} />
          </div>
        ) : null}

        <p aria-live="polite" className="sr-status">
          {isBusy
            ? STAGE_COPY[stage]
            : pages.length > 0
              ? `Ready to process ${pages.length} ${pages.length === 1 ? 'photo' : 'photos'}.`
              : 'No receipt selected yet.'}
        </p>
        {error ? (
          <p aria-live="assertive" className="error-text">
            {error}
          </p>
        ) : null}
      </div>

      {batch ? (
        <section className="result-card" aria-live="polite">
          <h2>{batch.storeName ?? 'Your grocery batch'}</h2>
          <p className="fine-print num">
            {matchedCount} of {items.length} items matched to nutrition data.
          </p>

          {batch.itemsTruncated ? (
            <p className="notice">
              This receipt ran longer than Cartwise reads in one pass, so the last lines were left
              out. Open the batch to add anything missing.
            </p>
          ) : null}

          {items.length === 0 ? (
            <p className="error-text">
              No items could be read from this receipt. Try a clearer, well-lit photo of the whole receipt, or
              add items with the barcode scanner.
            </p>
          ) : (
            <>
              <div className="result-items stagger">
                {items.map((item) => (
                  <article className="result-item" key={item.id}>
                    <strong>{item.productName}</strong>
                    <p className="num">
                      {item.quantity} × {item.packGrams ? `${item.packGrams} g` : 'unknown weight'}
                      {item.linePrice != null ? ` · ${item.linePrice.toFixed(2)}` : ''}
                    </p>
                    <p className="fine-print">{matchNote(item)}</p>
                  </article>
                ))}
              </div>

              <NutritionSummary
                items={items}
                profile={profile}
                currency={batch.currency ?? null}
                receiptTotal={batch.totalSpend}
              />

              <div className="cta-row">
                <Link className={buttonClass('primary')} href={`/grocery/${batch.id}`}>
                  Open this batch
                </Link>
              </div>
            </>
          )}
        </section>
      ) : null}
    </div>
  )
}
