'use client'

import Link from 'next/link'
import { Button, buttonClass } from '@/shared/components/Button'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <main className="auth-shell">
      <section className="auth-card">
        <p className="eyebrow">Unexpected error</p>
        <h1>Something went wrong while loading this view.</h1>
        <p className="lede">{error.message || 'Please retry, or return to the homepage.'}</p>
        <div className="cta-row">
          <Button variant="primary"  onClick={() => reset()} type="button">
            Retry
          </Button>
          <Link className={buttonClass()} href="/">
            Back to home
          </Link>
        </div>
      </section>
    </main>
  )
}
