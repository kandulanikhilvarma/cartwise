'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { GroceryBatch } from '@/features/grocery/types'
import { NutritionSummary } from '@/features/nutrition/components/NutritionSummary'
import { ocrReceiptToLines } from '@/features/grocery/lib/client-ocr'

type Stage = 'idle' | 'reading' | 'matching'

export function ReceiptUploader() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [stage, setStage] = useState<Stage>('idle')
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [batch, setBatch] = useState<GroceryBatch | null>(null)

  const isBusy = stage !== 'idle'
  const items = batch?.items ?? []
  const matchedCount = items.filter((item) => item.matchConfidence != null).length

  async function handleProcess() {
    if (!file) {
      setError('Choose a receipt image first.')
      return
    }

    setError(null)
    setBatch(null)
    setStage('reading')
    setProgress(0)

    try {
      const lines = await ocrReceiptToLines(file, setProgress)
      setStage('matching')

      const response = await fetch('/api/grocery/receipt', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ lines, fileName: file.name }),
      })

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { message?: string } | null
        throw new Error(payload?.message ?? 'Receipt processing failed')
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
          <p className="eyebrow">Receipt first</p>
          <h2>Start with your latest grocery receipt.</h2>
          <p>Text is read on your device, then matched to real nutrition data. Nothing is uploaded but the text.</p>
        </div>

        <label className="upload-field">
          <span>Receipt image</span>
          <input
            ref={fileInputRef}
            accept="image/*"
            capture="environment"
            type="file"
            disabled={isBusy}
            onChange={(event) => {
              setFile(event.target.files?.[0] ?? null)
              setError(null)
            }}
          />
        </label>

        <div className="cta-row">
          <button className="button button-primary" disabled={isBusy || !file} type="button" onClick={handleProcess}>
            {stage === 'reading'
              ? `Reading receipt… ${Math.round(progress * 100)}%`
              : stage === 'matching'
                ? 'Matching nutrition…'
                : 'Process receipt'}
          </button>
        </div>

        <p aria-live="polite" className="fine-print">
          {file ? `Selected file: ${file.name}` : 'No file selected yet.'}
        </p>
        {error ? (
          <p aria-live="assertive" className="error-text">
            {error}
          </p>
        ) : null}
      </div>

      {batch ? (
        <section className="result-card" aria-live="polite">
          <p className="eyebrow">Batch ready</p>
          <h2>{batch.storeName ?? 'Your grocery batch'}</h2>
          <p className="fine-print">
            {matchedCount} of {items.length} items matched to nutrition data.
          </p>

          {items.length === 0 ? (
            <p className="error-text">
              No items could be read from this receipt. Try a clearer, well-lit photo, or add items with the
              barcode scanner.
            </p>
          ) : (
            <>
              <div className="result-items">
                {items.map((item) => (
                  <article className="result-item" key={item.id}>
                    <strong>{item.productName}</strong>
                    <p>
                      {item.quantity} {item.unit ?? 'item'}
                    </p>
                    {item.matchConfidence != null ? (
                      <p className="fine-print">Match confidence: {Math.round(item.matchConfidence * 100)}%</p>
                    ) : (
                      <p className="fine-print">No nutrition match — edit the name to retry.</p>
                    )}
                  </article>
                ))}
              </div>

              <NutritionSummary items={items} />
            </>
          )}
        </section>
      ) : null}
    </div>
  )
}
