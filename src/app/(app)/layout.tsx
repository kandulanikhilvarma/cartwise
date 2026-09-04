import Link from 'next/link'
import type { ReactNode } from 'react'
import { auth } from '@/auth'
import { SignOutButton } from '@/features/auth/components/SignOutButton'
import { Logo } from '@/shared/components/Logo'
import { ThemeToggle } from '@/shared/components/ThemeToggle'

const navItems = [
  { href: '/home', label: 'Home' },
  { href: '/scan', label: 'Scan' },
  { href: '/grocery', label: 'Batches' },
  { href: '/barcode', label: 'Barcode' },
  { href: '/settings', label: 'Settings' },
]

export default async function AppLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  const session = await auth()

  return (
    <div className="app-shell">
      <a className="skip-link" href="#app-main">
        Skip to content
      </a>
      <header className="app-header">
        <Link href="/" aria-label="Cartwise home">
          <Logo />
        </Link>
        <div className="auth-chip">
          <ThemeToggle />
          <span>{session?.user?.email ?? 'Guest'}</span>
          {session ? <SignOutButton /> : null}
        </div>
      </header>
      <nav className="app-nav" aria-label="Primary">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="app-content" id="app-main">
        {children}
      </div>
    </div>
  )
}
