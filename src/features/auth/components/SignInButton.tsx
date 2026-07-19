"use client"

import { signIn } from 'next-auth/react'

export function SignInButton() {
  return (
    <button className="button button-primary" onClick={() => signIn('google', { callbackUrl: '/scan' })} type="button">
      Continue with Google
    </button>
  )
}
