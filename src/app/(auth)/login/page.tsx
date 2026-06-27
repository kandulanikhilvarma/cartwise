import Link from 'next/link'

export default function LoginPage() {
  return (
    <main className="auth-shell">
      <section className="auth-card">
        <p className="eyebrow">Save your results</p>
        <h1>Sign in only when you want to keep a batch.</h1>
        <p className="lede">
          NutriLens shows the value first. Google sign-in is introduced after the user understands
          what the product does.
        </p>
        <div className="cta-row">
          <Link className="button button-primary" href="/scan">
            Continue to scan
          </Link>
          <a className="button button-secondary" href="/">
            Back to overview
          </a>
        </div>
      </section>
    </main>
  )
}
