import Link from 'next/link'
import { Logo } from '@/shared/components/Logo'

export function MarketingFooter() {
  return (
    <footer className="marketing-footer" aria-label="Site footer">
      <div>
        <Logo />
        <p>Receipt-first grocery nutrition for real weekly shopping. Nutrition figures are informational, not medical advice.</p>
      </div>
      <nav className="marketing-footer-links">
        <Link href="/how-it-works">How it works</Link>
        <Link href="/privacy">Privacy</Link>
        <Link href="/terms">Terms</Link>
        <Link href="/faq">FAQ</Link>
        <Link href="/contact">Contact</Link>
        <a href="mailto:kandulanikhilvarma@gmail.com">Support</a>
      </nav>
      <p className="fine-print">© {new Date().getFullYear()} Cartwise · <a href="mailto:kandulanikhilvarma@gmail.com">kandulanikhilvarma@gmail.com</a></p>
    </footer>
  )
}
