import { BarcodeLookup } from '@/features/scanner/components/BarcodeLookup'

export default function BarcodePage() {
  return (
    <main className="surface-page">
      <div className="scan-intro">
        <h1>Add an item by barcode.</h1>
        <p className="lede">Scan or type a product barcode to pull its nutrition — handy when a receipt missed something.</p>
      </div>

      <BarcodeLookup />
    </main>
  )
}
