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
        {/* Fixed copy: error.message can be an internal string. */}
        <p className="lede">Please retry, or return to the homepage.</p>
        {error.digest ? <p className="fine-print num">Reference {error.digest}</p> : null}
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
