import Link from 'next/link'
import { Logo } from '@/shared/components/Logo'
import { NavAuthCta } from '@/shared/components/NavAuthCta'

const links = [
  { href: '/how-it-works', label: 'How it works' },
  { href: '/demo', label: 'See it work' },
  { href: '/about', label: 'About' },
  { href: '/faq', label: 'FAQ' },
  { href: '/contact', label: 'Contact' },
]

// No auth() here: reading the session on the server made every marketing page
// dynamic. NavAuthCta swaps in the signed-in buttons on the client.
export function MarketingNav() {
  return (
    <header className="marketing-nav" aria-label="Marketing navigation">
      {/* Every marketing page puts its content in <main id="main">. */}
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Link href="/" aria-label="Cartwise home">
        <Logo />
      </Link>
      <nav className="marketing-nav-links">
        {links.map((link) => (
          <Link key={link.href} href={link.href}>
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="marketing-nav-cta">
        <NavAuthCta />
      </div>
    </header>
  )
}
