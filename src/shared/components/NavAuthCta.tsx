'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { SignOutButton } from '@/features/auth/components/SignOutButton'
import { buttonClass } from '@/shared/components/Button'

type SessionUser = { name?: string | null; email?: string | null }

/**
 * The only per-visitor part of the marketing nav. It used to be read on the
 * server with auth(), which reads cookies and made every marketing page render
 * per request. The page now ships as static HTML with the signed-out buttons,
 * and a signed-in visitor gets theirs after one session read.
 */
export function NavAuthCta() {
  const [user, setUser] = useState<SessionUser | null>(null)

  useEffect(() => {
    let cancelled = false
    readSessionUser().then((found) => {
      if (!cancelled) setUser(found)
    })
    return () => {
      cancelled = true
    }
  }, [])

  if (!user) {
    return (
      <>
        <Link className={buttonClass()} href="/login">
          Sign in
        </Link>
        <Link className={buttonClass('primary')} href="/scan">
          Scan a receipt
        </Link>
      </>
    )
  }

  const firstName = user.name?.split(' ')[0] ?? user.email ?? null
  return (
    <>
      {firstName ? <span className="nav-user">Hi, {firstName}</span> : null}
      <Link className={buttonClass('primary')} href="/home">
        Open Cartwise
      </Link>
      <SignOutButton />
    </>
  )
}

// Auth.js session endpoint, served by app/api/auth/[...nextauth].
async function readSessionUser(): Promise<SessionUser | null> {
  try {
    const response = await fetch('/api/auth/session', { cache: 'no-store' })
    if (!response.ok) return null
    const session = (await response.json()) as { user?: SessionUser } | null
    return session?.user ?? null
  } catch {
    // Signed-out buttons are the safe default when the session cannot be read.
    return null
  }
}
