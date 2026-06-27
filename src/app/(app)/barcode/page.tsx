import { BarcodeLookup } from '@/features/scanner/components/BarcodeLookup'

export default function BarcodePage() {
  return (
    <main className="surface-page">
      <section className="surface-card">
        <p className="eyebrow">Barcode</p>
        <h1>Fallback add-by-code route.</h1>
        <p className="lede">
          Barcode scanning will be a secondary entry path when a receipt misses a product or the
          user wants to add a single item directly.
        </p>
      </section>

      <BarcodeLookup />
    </main>
  )
}
