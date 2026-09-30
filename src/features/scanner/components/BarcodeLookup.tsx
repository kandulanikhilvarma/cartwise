'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Button, buttonClass } from '@/shared/components/Button'

type BarcodeProduct = {
  code: string
  productName: string
  brand?: string
  caloriesKcal: number
  proteinG: number
  carbsG: number
  fatG: number
  sodiumMg: number
  packGrams: number | null
}

type Shop = { id: string; label: string }

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

// The Shape Detection API is not in TypeScript's DOM types yet.
type DetectedBarcode = { rawValue: string }
type BarcodeDetectorLike = { detect(source: HTMLVideoElement): Promise<DetectedBarcode[]> }
type BarcodeDetectorClass = new (options: { formats: string[] }) => BarcodeDetectorLike

function barcodeDetector(): BarcodeDetectorClass | null {
  if (typeof window === 'undefined') return null
  return (window as unknown as { BarcodeDetector?: BarcodeDetectorClass }).BarcodeDetector ?? null
}

export function BarcodeLookup({ shops }: { shops: Shop[] }) {
  const [code, setCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState('')
  const [product, setProduct] = useState<BarcodeProduct | null>(null)
  const [shopId, setShopId] = useState(shops[0]?.id ?? '')
  const [adding, setAdding] = useState(false)
  const [addedTo, setAddedTo] = useState<Shop | null>(null)
  const [canScan, setCanScan] = useState(false)
  const [scanning, setScanning] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Camera scanning is offered only where the browser can decode barcodes
  // itself (Chrome on Android, for one). Typing the number works everywhere.
  useEffect(() => setCanScan(barcodeDetector() !== null), [])
  useEffect(() => () => stopCamera(), [])

  function stopCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    setScanning(false)
  }

  async function startCamera() {
    const Detector = barcodeDetector()
    const video = videoRef.current
    if (!Detector || !video) return
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      })
      streamRef.current = stream
      setScanning(true)
      video.srcObject = stream
      await video.play()

      const detector = new Detector({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e'] })
      setStatus('Point the camera at the barcode.')
      while (streamRef.current === stream) {
        const [found] = await detector.detect(video).catch(() => [])
        if (found?.rawValue) {
          stopCamera()
          setCode(found.rawValue)
          await lookup(found.rawValue)
          return
        }
        await new Promise((resolve) => setTimeout(resolve, 250))
      }
    } catch {
      stopCamera()
      setError('The camera could not be opened. Type the number under the barcode instead.')
    }
  }

  async function lookup(value = code) {
    const digits = value.replace(/\D/g, '')
    if (digits.length < 8 || digits.length > 14) {
      setError('A barcode is the 8 to 14 digit number under the bars.')
      return
    }

    setIsLoading(true)
    setError(null)
    setProduct(null)
    setAddedTo(null)
    setStatus('Looking up the barcode.')

    try {
      const response = await fetch(`/api/food-db/barcode/${digits}`, { cache: 'no-store' })
      const payload = (await response.json().catch(() => null)) as
        | (BarcodeProduct & { message?: string })
        | null
      // The server says what went wrong: unknown code, rate limit, or a source
      // that is down. Every failure used to read "Barcode not found".
      if (!response.ok || !payload) {
        throw new Error(payload?.message ?? 'The lookup failed. Try again.')
      }
      setProduct(payload)
      setStatus(`Found ${payload.productName}.`)
    } catch (lookupError) {
      setStatus('')
      setError(lookupError instanceof Error ? lookupError.message : 'The lookup failed. Try again.')
    } finally {
      setIsLoading(false)
    }
  }

  async function addToShop() {
    const shop = shops.find((entry) => entry.id === shopId)
    if (!product || !shop) return

    setAdding(true)
    setError(null)
    try {
      const response = await fetch(`/api/grocery/${shop.id}/items`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          productName: product.brand ? `${product.brand} ${product.productName}` : product.productName,
          quantity: 1,
          barcode: product.code,
        }),
      })
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { message?: string } | null
        throw new Error(payload?.message ?? 'Could not add it to that shop.')
      }
      setAddedTo(shop)
      setStatus(`Added ${product.productName} to ${shop.label}.`)
    } catch (addError) {
      setError(addError instanceof Error ? addError.message : 'Could not add it to that shop.')
    } finally {
      setAdding(false)
    }
  }

  return (
    <section className="surface-card">
      <div className="barcode-form">
        <label className="upload-field">
          <span>Barcode number</span>
          <input
            inputMode="numeric"
            autoComplete="off"
            placeholder="5000112548167"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !isLoading) void lookup()
            }}
          />
        </label>

        <div className="cta-row">
          <Button variant="primary" onClick={() => void lookup()} disabled={isLoading}>
            {isLoading ? 'Looking up…' : 'Look up barcode'}
          </Button>
          {canScan ? (
            scanning ? (
              <Button onClick={stopCamera}>Stop camera</Button>
            ) : (
              <Button onClick={() => void startCamera()} disabled={isLoading}>
                Scan with camera
              </Button>
            )
          ) : null}
        </div>

        {/* Mounted before the stream starts, so there is somewhere to attach it. */}
        <video
          ref={videoRef}
          className="barcode-video"
          hidden={!scanning}
          muted
          playsInline
          aria-label="Camera view"
        />

        <p className="sr-status" role="status">
          {status}
        </p>
        <p className="error-text" role="alert">
          {error ?? ''}
        </p>
      </div>

      {product ? (
        <section className="result-card">
          <p className="eyebrow">Product found</p>
          <h2>{product.productName}</h2>
          <p className="fine-print">
            {product.brand ?? 'No brand listed'}
            {product.packGrams ? ` · ${product.packGrams} g pack` : ''}
          </p>
          <p className="fine-print">Values are per 100 g, from Open Food Facts.</p>
          <dl className="figure-grid">
            {FIGURES.map((figure) => (
              <div className="figure" key={figure.key}>
                <dt>{figure.label}</dt>
                <dd>
                  {Math.round(product[figure.key] * 10) / 10}
                  <span className="figure-unit">{figure.unit}</span>
                </dd>
              </div>
            ))}
          </dl>

          {shops.length > 0 ? (
            <div className="field-row">
              <label className="field">
                Add it to
                <select value={shopId} onChange={(event) => setShopId(event.target.value)}>
                  {shops.map((shop) => (
                    <option key={shop.id} value={shop.id}>
                      {shop.label}
                    </option>
                  ))}
                </select>
              </label>
              <Button variant="primary" onClick={() => void addToShop()} disabled={adding}>
                {adding ? 'Adding…' : 'Add to shop'}
              </Button>
            </div>
          ) : (
            <p className="fine-print">
              Scan a receipt first; a product is added to one of your shops.{' '}
              <Link href="/scan">Scan a receipt</Link>
            </p>
          )}

          {addedTo ? (
            <p className="fine-print">
              Added.{' '}
              <Link className={buttonClass('secondary', 'small')} href={`/grocery/${addedTo.id}`}>
                Open {addedTo.label}
              </Link>
            </p>
          ) : null}
        </section>
      ) : null}
    </section>
  )
}
