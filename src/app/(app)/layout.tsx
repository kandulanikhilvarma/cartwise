import Link from 'next/link'
import type { ReactNode } from 'react'
import { auth } from '@/auth'
import { SignOutButton } from '@/features/auth/components/SignOutButton'

const navItems = [
  { href: '/scan', label: 'Scan' },
  { href: '/grocery', label: 'Batches' },
  { href: '/barcode', label: 'Barcode' },
]

export default async function AppLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  const session = await auth()

  return (
    <div className="app-shell">
      <header className="app-header">
        <Link className="brand" href="/">
          NutriLens
        </Link>
        <div className="auth-chip">
          {session?.user?.email ?? 'Guest'}
          {session ? <SignOutButton /> : null}
        </div>
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
