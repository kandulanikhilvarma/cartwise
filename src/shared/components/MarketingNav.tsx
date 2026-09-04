import Link from 'next/link'
import { auth } from '@/auth'
import { Logo } from '@/shared/components/Logo'
import { SignOutButton } from '@/features/auth/components/SignOutButton'
import { buttonClass } from '@/shared/components/Button'

const links = [
  { href: '/how-it-works', label: 'How it works' },
  { href: '/demo', label: 'See it work' },
  { href: '/about', label: 'About' },
  { href: '/faq', label: 'FAQ' },
  { href: '/contact', label: 'Contact' },
]

export async function MarketingNav() {
  const session = await auth()
  const user = session?.user
  const firstName = user?.name?.split(' ')[0] ?? user?.email ?? null

  return (
    <header className="marketing-nav" aria-label="Marketing navigation">
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
        {user ? (
          <>
            {firstName ? <span className="nav-user">Hi, {firstName}</span> : null}
            <Link className={buttonClass('primary')} href="/home">
              Open Cartwise
            </Link>
            <SignOutButton />
          </>
        ) : (
          <>
            <Link className={buttonClass()} href="/login">
              Sign in
            </Link>
            <Link className={buttonClass('primary')} href="/scan">
              Scan a receipt
            </Link>
          </>
        )}
      </div>
    </header>
  )
}
