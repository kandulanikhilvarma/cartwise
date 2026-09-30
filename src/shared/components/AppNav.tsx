'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/home', label: 'Home' },
  { href: '/scan', label: 'Scan' },
  { href: '/grocery', label: 'Batches' },
  { href: '/barcode', label: 'Barcode' },
  { href: '/settings', label: 'Settings' },
]

/** The app's primary nav. The current section is marked for screen readers and by an underline. */
export function AppNav() {
  const pathname = usePathname()

  return (
    <nav className="app-nav" aria-label="Primary">
      {navItems.map((item) => {
        const current = pathname === item.href || pathname.startsWith(`${item.href}/`)
        return (
          <Link key={item.href} href={item.href} aria-current={current ? 'page' : undefined}>
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
