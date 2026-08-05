'use client'

import Link from 'next/link'

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
          <button className="button button-primary" onClick={() => reset()} type="button">
            Retry
          </button>
          <Link className="button button-secondary" href="/">
            Back to home
          </Link>
        </div>
      </section>
    </main>
  )
}
