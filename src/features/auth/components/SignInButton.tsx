"use client"

import { signIn } from 'next-auth/react'

type SignInButtonProps = {
  provider?: 'google' | 'github'
  label: string
}

export function SignInButton({ provider = 'google', label }: SignInButtonProps) {
  return (
    <button className="button button-primary" onClick={() => signIn(provider, { callbackUrl: '/scan' })} type="button">
      {label}
    </button>
  )
}
