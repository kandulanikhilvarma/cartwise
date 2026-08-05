import { BarcodeLookup } from '@/features/scanner/components/BarcodeLookup'

export default function BarcodePage() {
  return (
    <main className="surface-page">
      <section className="surface-card">
        <p className="eyebrow">Barcode</p>
        <h1>Add missed items in seconds.</h1>
        <p className="lede">
          Use barcode lookup as a fast correction path when receipt OCR misses a product.
        </p>
      </section>

      <BarcodeLookup />
    </main>
  )
}
