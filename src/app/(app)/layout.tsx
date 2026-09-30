import Link from 'next/link'
import type { ReactNode } from 'react'
import { auth } from '@/auth'
import { SignOutButton } from '@/features/auth/components/SignOutButton'
import { Logo } from '@/shared/components/Logo'
import { ThemeToggle } from '@/shared/components/ThemeToggle'
import { AppNav } from '@/shared/components/AppNav'

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
      <AppNav />
      <div className="app-content" id="app-main">
        {children}
      </div>
    </div>
  )
}
