'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { GroceryBatch } from '@/features/grocery/types'
import { NutritionSummary } from '@/features/nutrition/components/NutritionSummary'

export function ReceiptUploader() {
  const router = useRouter()
  const [fileName, setFileName] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [batch, setBatch] = useState<GroceryBatch | null>(null)
  const [pendingBatchId, setPendingBatchId] = useState<string | null>(null)

  const previewItems = useMemo(() => batch?.items ?? [], [batch])

  useEffect(() => {
    if (!pendingBatchId) return

    const intervalId = window.setInterval(async () => {
      const response = await fetch(`/api/grocery/receipt/${pendingBatchId}`, {
        cache: 'no-store',
      })

      if (!response.ok) {
        return
      }

      const data = (await response.json()) as GroceryBatch
      setBatch(data)

      if (data.ocrStatus === 'done' || data.ocrStatus === 'failed') {
        setPendingBatchId(null)
        window.clearInterval(intervalId)
        router.refresh()
      }
    }, 1200)

    return () => window.clearInterval(intervalId)
  }, [pendingBatchId, router])

  async function handleSubmit(formData: FormData) {
    setIsUploading(true)
    setError(null)

    try {
      const response = await fetch('/api/grocery/receipt', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Receipt upload failed')
      }

      const data = (await response.json()) as GroceryBatch
      setBatch(data)
      setPendingBatchId(data.id)
      router.refresh()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Upload failed')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="receipt-uploader">
      <form className="upload-card" action={handleSubmit}>
        <div className="upload-visual">
          <p className="eyebrow">Receipt first</p>
          <h2>Start with your latest grocery receipt.</h2>
          <p>
            Processing runs automatically after upload. You only edit entries if something was
            matched incorrectly.
          </p>
        </div>

        <label className="upload-field">
          <span>Receipt image</span>
          <input
            accept="image/*"
            capture="environment"
            name="receipt"
            type="file"
            onChange={(event) => setFileName(event.target.files?.[0]?.name ?? null)}
          />
        </label>

        <div className="cta-row">
          <button className="button button-primary" disabled={isUploading} type="submit">
            {isUploading ? 'Processing receipt...' : 'Process receipt'}
          </button>
          <Link className="button button-secondary" href="/login">
            Save later
          </Link>
        </div>

        {fileName ? <p className="fine-print">Selected file: {fileName}</p> : null}
        {error ? <p className="error-text">{error}</p> : null}
      </form>

      {batch ? (
        <section className="result-card">
          <p className="eyebrow">Batch ready</p>
          <h2>{batch.storeName ?? 'Your grocery batch'}</h2>
          <p className="fine-print">
            OCR status: {batch.ocrStatus}
            {pendingBatchId ? ' - processing in background' : ''}
          </p>
          {batch.ocrStatus === 'failed' ? (
            <p className="error-text">
              Receipt processing failed. Try a clearer image or use barcode fallback for manual recovery.
            </p>
          ) : null}

          <div className="result-items">
            {previewItems.map((item) => (
              <article className="result-item" key={item.id}>
                <strong>{item.productName}</strong>
                <p>
                  {item.quantity} {item.unit ?? 'item'}
                </p>
                {typeof item.matchConfidence === 'number' ? (
                  <p className="fine-print">
                    OCR confidence: {Math.round(item.matchConfidence * 100)}%
                  </p>
                ) : null}
              </article>
            ))}
          </div>

          <NutritionSummary items={previewItems} />
        </section>
      ) : null}
    </div>
  )
}
