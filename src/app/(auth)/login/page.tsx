import Link from 'next/link'
import { SignInButton } from '@/features/auth/components/SignInButton'

export default function LoginPage() {
  const hasGithub = Boolean(process.env.GITHUB_ID && process.env.GITHUB_SECRET)

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <p className="eyebrow">Save your results</p>
        <h1>Sign in to save and revisit your grocery batches.</h1>
        <p className="lede">
          Cartwise keeps account entry low-friction. Start with OAuth, then continue directly into
          receipt scan.
        </p>
        <div className="auth-provider-grid">
          <SignInButton label="Continue with Google" provider="google" />
          {hasGithub ? <SignInButton label="Continue with GitHub" provider="github" /> : null}
        </div>
        <div className="cta-row">
          <Link className="button button-secondary" href="/">
            Back to overview
          </Link>
        </div>
        <p className="fine-print">No password is required in this MVP authentication flow.</p>
      </section>
    </main>
  )
}
