import Link from 'next/link'

export function SignInButton() {
  return (
    <Link className="button button-primary" href="/login">
      Continue with Google
    </Link>
  )
}
