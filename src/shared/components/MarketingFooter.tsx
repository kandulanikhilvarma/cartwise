import Link from 'next/link'

export function MarketingFooter() {
  return (
    <footer className="marketing-footer" aria-label="Site footer">
      <div>
        <strong>Cartwise</strong>
        <p>Receipt-first grocery nutrition for real weekly shopping behavior.</p>
      </div>
      <nav className="marketing-footer-links">
        <Link href="/privacy">Privacy</Link>
        <Link href="/terms">Terms</Link>
        <Link href="/faq">FAQ</Link>
        <Link href="/contact">Contact</Link>
      </nav>
    </footer>
  )
}
