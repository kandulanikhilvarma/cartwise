'use client'

import { useState } from 'react'

type BarcodeProduct = {
  code: string
  productName: string
  brand?: string
  caloriesKcal: number
  proteinG: number
  carbsG: number
  fatG: number
  sodiumMg: number
}

export function BarcodeLookup() {
  const [code, setCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [product, setProduct] = useState<BarcodeProduct | null>(null)

  async function handleLookup() {
    if (!code.trim()) {
      setError('Enter a barcode.')
      return
    }

    setIsLoading(true)
    setError(null)
    setProduct(null)

    try {
      const response = await fetch(`/api/food-db/barcode/${encodeURIComponent(code.trim())}`, {
        cache: 'no-store',
      })

      if (!response.ok) {
        throw new Error('Barcode not found')
      }

      const data = (await response.json()) as BarcodeProduct
      setProduct(data)
    } catch (lookupError) {
      setError(lookupError instanceof Error ? lookupError.message : 'Lookup failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="surface-card">
      <div className="barcode-form">
        <label className="upload-field">
          <span>Barcode number</span>
          <input
            inputMode="numeric"
            placeholder="0123456789012"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') handleLookup()
            }}
          />
        </label>

        <button className="button button-primary" onClick={handleLookup} type="button" disabled={isLoading}>
          {isLoading ? 'Looking up…' : 'Look up barcode'}
        </button>

        {error ? <p className="error-text">{error}</p> : null}
      </div>

      {product ? (
        <section className="result-card">
          <p className="eyebrow">Product found</p>
          <h2>{product.productName}</h2>
          <p className="fine-print">{product.brand ?? 'No brand listed'}</p>
          <p className="fine-print">Values are per 100 g.</p>
          <div className="nutrition-grid">
            <article className="nutrition-card tone-good">
              <strong>{product.caloriesKcal}</strong>
              <span>Calories (kcal)</span>
            </article>
            <article className="nutrition-card tone-neutral">
              <strong>{product.proteinG}</strong>
              <span>Protein (g)</span>
            </article>
            <article className="nutrition-card tone-neutral">
              <strong>{product.carbsG}</strong>
              <span>Carbs (g)</span>
            </article>
            <article className="nutrition-card tone-neutral">
              <strong>{product.fatG}</strong>
              <span>Fat (g)</span>
            </article>
            <article className="nutrition-card tone-warning">
              <strong>{product.sodiumMg}</strong>
              <span>Sodium (mg)</span>
            </article>
          </div>
        </section>
      ) : null}
    </section>
  )
}