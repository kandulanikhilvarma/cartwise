import Link from 'next/link'

export function MarketingFooter() {
  return (
    <footer className="marketing-footer" aria-label="Site footer">
      <div>
        <span className="brand">Cartwise</span>
        <p>Receipt-first grocery nutrition for real weekly shopping. Nutrition figures are informational, not medical advice.</p>
      </div>
      <nav className="marketing-footer-links">
        <Link href="/how-it-works">How it works</Link>
        <Link href="/privacy">Privacy</Link>
        <Link href="/terms">Terms</Link>
        <Link href="/faq">FAQ</Link>
        <Link href="/contact">Contact</Link>
      </nav>
      <p className="fine-print">Photography via Unsplash. © {new Date().getFullYear()} Cartwise.</p>
    </footer>
  )
}
