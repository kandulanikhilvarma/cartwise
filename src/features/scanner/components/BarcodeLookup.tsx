'use client'

import { useState } from 'react'
import { Button } from '@/shared/components/Button'

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

const FIGURES = [
  { key: 'caloriesKcal', label: 'Calories', unit: 'kcal' },
  { key: 'proteinG', label: 'Protein', unit: 'g' },
  { key: 'carbsG', label: 'Carbs', unit: 'g' },
  { key: 'fatG', label: 'Fat', unit: 'g' },
  { key: 'sodiumMg', label: 'Sodium', unit: 'mg' },
] as const satisfies ReadonlyArray<{
  key: keyof BarcodeProduct
  label: string
  unit: string
}>

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

        <Button variant="primary"  onClick={handleLookup} type="button" disabled={isLoading}>
          {isLoading ? 'Looking up…' : 'Look up barcode'}
        </Button>

        {error ? <p className="error-text">{error}</p> : null}
      </div>

      {product ? (
        <section className="result-card">
          <p className="eyebrow">Product found</p>
          <h2>{product.productName}</h2>
          <p className="fine-print">{product.brand ?? 'No brand listed'}</p>
          <p className="fine-print">Values are per 100 g.</p>
          <dl className="figure-grid">
            {FIGURES.map((figure) => (
              <div className="figure" key={figure.key}>
                <dt>{figure.label}</dt>
                <dd>
                  {product[figure.key]}
                  <span className="figure-unit">{figure.unit}</span>
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}
    </section>
  )
}