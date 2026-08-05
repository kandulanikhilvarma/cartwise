import Link from 'next/link'

const links = [
  { href: '/how-it-works', label: 'How it works' },
  { href: '/about', label: 'About' },
  { href: '/faq', label: 'FAQ' },
  { href: '/contact', label: 'Contact' },
]

export function MarketingNav() {
  return (
    <header className="marketing-nav" aria-label="Marketing navigation">
      <Link className="brand" href="/">
        Cartwise
      </Link>
      <nav className="marketing-nav-links">
        {links.map((link) => (
          <Link key={link.href} href={link.href}>
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="marketing-nav-cta">
        <Link className="button button-secondary" href="/login">
          Sign in
        </Link>
        <Link className="button button-primary" href="/scan">
          Scan a receipt
        </Link>
      </div>
    </header>
  )
}
