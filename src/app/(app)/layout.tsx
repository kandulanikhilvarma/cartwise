import Link from 'next/link'
import type { ReactNode } from 'react'

const navItems = [
  { href: '/scan', label: 'Scan' },
  { href: '/grocery', label: 'Batches' },
  { href: '/barcode', label: 'Barcode' },
]

export default function AppLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <div className="app-shell">
      <header className="app-header">
        <Link className="brand" href="/">
          NutriLens
        </Link>
        <nav className="app-nav" aria-label="Primary">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <div className="app-content">{children}</div>
    </div>
  )
}
