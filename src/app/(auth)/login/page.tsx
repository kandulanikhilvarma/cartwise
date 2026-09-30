import Link from 'next/link'
import type { Metadata } from 'next'
import { SignInButton } from '@/features/auth/components/SignInButton'
import { Logo } from '@/shared/components/Logo'
import { Icon } from '@/shared/components/Icon'

export const metadata: Metadata = {
  title: 'Sign in',
  description: 'Sign in to Cartwise with Google to save the nutrition read of each grocery receipt.',
  // A sign-in form has nothing for a search result.
  robots: { index: false, follow: true },
}

// Auth.js sends a failed sign-in back here with ?error=<code>. It used to be
// ignored, so a refused sign-in looked like nothing had happened.
const SIGN_IN_ERRORS: Record<string, string> = {
  AccessDenied:
    'That account could not be used. Cartwise needs a Google account with a verified email address.',
  Configuration: 'Sign-in is not working on our side right now. Try again in a few minutes.',
  OAuthAccountNotLinked: 'That email is already used with a different sign-in method.',
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string | string[] }>
}) {
  const hasGithub = Boolean(process.env.GITHUB_ID && process.env.GITHUB_SECRET)
  const code = (await searchParams).error
  const signInError = code
    ? (SIGN_IN_ERRORS[String(code)] ?? 'Sign-in did not finish. Try again.')
    : null

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
        {signInError ? (
          <p className="error-text" role="alert">
            {signInError}
          </p>
        ) : null}
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
