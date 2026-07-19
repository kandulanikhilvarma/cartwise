import Link from 'next/link'
import { SignInButton } from '@/features/auth/components/SignInButton'

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
          <SignInButton />
          <Link className="button button-secondary" href="/">
            Back to overview
          </Link>
        </div>
      </section>
    </main>
  )
}
