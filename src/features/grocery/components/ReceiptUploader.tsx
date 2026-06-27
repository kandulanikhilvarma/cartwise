'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import type { GroceryBatch } from '@/features/grocery/types'
import { NutritionSummary } from '@/features/nutrition/components/NutritionSummary'

export function ReceiptUploader() {
  const [fileName, setFileName] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [batch, setBatch] = useState<GroceryBatch | null>(null)

  const previewItems = useMemo(() => batch?.items ?? [], [batch])

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
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Upload failed')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="receipt-uploader">
      <form
        className="upload-card"
        action={async (formData) => {
          await handleSubmit(formData)
        }}
      >
        <div className="upload-visual">
          <p className="eyebrow">Receipt first</p>
          <h2>Upload a grocery receipt to start.</h2>
          <p>
            The first implementation slice keeps the capture entry simple. Camera capture will be
            added next; this version already exercises the upload and result flow.
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
            {isUploading ? 'Processing...' : 'Upload receipt'}
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
          <p className="fine-print">OCR status: {batch.ocrStatus}</p>

          <div className="result-items">
            {previewItems.map((item) => (
              <article className="result-item" key={item.id}>
                <strong>{item.productName}</strong>
                <p>
                  {item.quantity} {item.unit ?? 'item'}
                </p>
              </article>
            ))}
          </div>

          <NutritionSummary items={previewItems} />
        </section>
      ) : null}
    </div>
  )
}
