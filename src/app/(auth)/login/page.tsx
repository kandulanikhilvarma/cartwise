import Link from 'next/link'
import { SignInButton } from '@/features/auth/components/SignInButton'
import { Logo } from '@/shared/components/Logo'
import { Icon } from '@/shared/components/Icon'

export default function LoginPage() {
  const hasGithub = Boolean(process.env.GITHUB_ID && process.env.GITHUB_SECRET)

  return (
    <div className="auth-shell">
      <header className="auth-topbar">
        <Link href="/" aria-label="Cartwise home">
          <Logo />
        </Link>
      </header>

      <main className="auth-card">
        <h1>Save your grocery reads.</h1>
        <p className="lede">
          One tap with Google — no password, no sign-up form. You go straight to scanning your first receipt.
        </p>
        <div className="auth-provider-grid">
          <SignInButton label="Continue with Google" provider="google" />
          {hasGithub ? <SignInButton label="Continue with GitHub" provider="github" /> : null}
        </div>
        <Link className="auth-back" href="/">
          <Icon name="arrow-left" />
          Back to home
        </Link>
        <p className="fine-print">
          We only use your Google name and email to save your batches. Questions?{' '}
          <a href="mailto:kandulanikhilvarma@gmail.com">Email us</a>.
        </p>
      </main>
    </div>
  )
}
