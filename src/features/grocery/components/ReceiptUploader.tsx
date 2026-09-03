'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { GroceryBatch } from '@/features/grocery/types'
import type { NutrientProfile } from '@/features/nutrition/lib/rda-constants'
import { NutritionSummary } from '@/features/nutrition/components/NutritionSummary'
import { ocrReceiptToLines } from '@/features/grocery/lib/client-ocr'

type Stage = 'idle' | 'preparing' | 'reading' | 'matching'

const STAGE_COPY: Record<Exclude<Stage, 'idle'>, string> = {
  preparing: 'Sharpening the photo on your device.',
  reading: 'Reading the receipt on your device.',
  matching: 'Matching items to nutrition data.',
}

export function ReceiptUploader({ profile }: { profile?: NutrientProfile | null }) {
  const router = useRouter()
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const [stage, setStage] = useState<Stage>('idle')
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [batch, setBatch] = useState<GroceryBatch | null>(null)

  const isBusy = stage !== 'idle'
  const items = batch?.items ?? []
  const matchedCount = items.filter((item) => item.matchConfidence != null).length

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  function chooseFile(next: File | null) {
    if (next && !next.type.startsWith('image/')) {
      setError('That file isn’t an image. Use a photo of your receipt.')
      return
    }
    setError(null)
    setBatch(null)
    setFile(next)
  }

  async function handleProcess() {
    if (!file) {
      setError('Choose or take a photo of your receipt first.')
      return
    }

    setError(null)
    setBatch(null)
    setStage('preparing')
    setProgress(0)

    try {
      setStage('reading')
      const lines = await ocrReceiptToLines(file, setProgress)
      if (lines.join('').trim().length === 0) {
        throw new Error('Couldn’t read any text. Try a sharper, well-lit photo of the whole receipt.')
      }

      setStage('matching')
      const response = await fetch('/api/grocery/receipt', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ lines, fileName: file.name }),
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
          onChange={(event) => chooseFile(event.target.files?.[0] ?? null)}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(event) => chooseFile(event.target.files?.[0] ?? null)}
        />

        {file && previewUrl ? (
          <div className="upload-preview">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt="Selected receipt preview" />
            <div className="upload-preview-meta">
              <strong>{file.name}</strong>
              <button
                className="button button-secondary"
                type="button"
                disabled={isBusy}
                onClick={() => setFile(null)}
              >
                Change
              </button>
            </div>
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
              chooseFile(event.dataTransfer.files?.[0] ?? null)
            }}
          >
            <p className="upload-drop-hint">
              Lay the receipt flat, fill the frame, and keep the whole strip in shot.
            </p>
            <div className="upload-drop-actions">
              <button className="button button-primary" type="button" onClick={() => cameraInputRef.current?.click()}>
                Take photo
              </button>
              <button className="button button-secondary" type="button" onClick={() => fileInputRef.current?.click()}>
                Upload image
              </button>
            </div>
          </div>
        )}

        <button
          className="button button-primary upload-process"
          disabled={isBusy || !file}
          type="button"
          onClick={handleProcess}
        >
          {stage === 'preparing'
            ? 'Preparing the photo…'
            : stage === 'reading'
              ? `Reading receipt… ${Math.round(progress * 100)}%`
              : stage === 'matching'
                ? 'Matching nutrition…'
                : 'Process receipt'}
        </button>

        {stage === 'reading' ? (
          <div className="progress-track" aria-hidden="true">
            <span className="progress-fill" style={{ width: `${Math.round(progress * 100)}%` }} />
          </div>
        ) : null}

        <p aria-live="polite" className="sr-status">
          {isBusy
            ? STAGE_COPY[stage]
            : file
              ? 'Ready to process.'
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
                    {item.matchConfidence != null ? (
                      <p className="fine-print num">
                        Match confidence: {Math.round(item.matchConfidence * 100)}%
                      </p>
                    ) : (
                      <p className="fine-print">No nutrition match — open the batch to fix the name.</p>
                    )}
                  </article>
                ))}
              </div>

              <NutritionSummary
                items={items}
                profile={profile}
                currency={batch.currency ?? null}
              />

              <div className="cta-row">
                <Link className="button button-primary" href={`/grocery/${batch.id}`}>
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
