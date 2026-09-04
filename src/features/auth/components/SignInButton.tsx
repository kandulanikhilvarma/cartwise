"use client"

import { signIn } from 'next-auth/react'
import { Button } from '@/shared/components/Button'

type SignInButtonProps = {
  provider?: 'google' | 'github'
  label: string
}

export function SignInButton({ provider = 'google', label }: SignInButtonProps) {
  return (
    <Button variant="primary"  onClick={() => signIn(provider, { callbackUrl: '/scan' })} type="button">
      {label}
    </Button>
  )
}
