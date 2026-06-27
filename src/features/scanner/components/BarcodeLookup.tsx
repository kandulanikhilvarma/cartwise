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
      <div className="section-header">
        <p className="eyebrow">Barcode lookup</p>
        <h2>Fallback when a receipt misses a product.</h2>
      </div>

      <div className="upload-card" style={{ padding: 0, background: 'transparent', boxShadow: 'none', border: 'none' }}>
        <label className="upload-field">
          <span>Barcode number</span>
          <input
            inputMode="numeric"
            placeholder="0123456789012"
            value={code}
            onChange={(event) => setCode(event.target.value)}
          />
        </label>

        <button className="button button-primary" onClick={handleLookup} type="button">
          {isLoading ? 'Looking up...' : 'Lookup barcode'}
        </button>

        {error ? <p className="error-text">{error}</p> : null}
      </div>

      {product ? (
        <section className="result-card">
          <p className="eyebrow">Product found</p>
          <h2>{product.productName}</h2>
          <p className="fine-print">{product.brand ?? 'No brand listed'}</p>
          <div className="nutrition-grid">
            <article className="nutrition-card tone-good">
              <strong>Calories</strong>
              <p>{product.caloriesKcal} kcal</p>
            </article>
            <article className="nutrition-card tone-neutral">
              <strong>Protein</strong>
              <p>{product.proteinG} g</p>
            </article>
            <article className="nutrition-card tone-neutral">
              <strong>Carbs</strong>
              <p>{product.carbsG} g</p>
            </article>
            <article className="nutrition-card tone-neutral">
              <strong>Fat</strong>
              <p>{product.fatG} g</p>
            </article>
            <article className="nutrition-card tone-warning">
              <strong>Sodium</strong>
              <p>{product.sodiumMg} mg</p>
            </article>
            <article className="nutrition-card tone-neutral">
              <strong>Code</strong>
              <p>{product.code}</p>
            </article>
          </div>
        </section>
      ) : null}
    </section>
  )
}