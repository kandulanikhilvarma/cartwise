'use client'

import { signOut } from 'next-auth/react'
import { Button } from '@/shared/components/Button'

export function SignOutButton() {
  return (
    <Button  onClick={() => signOut({ callbackUrl: '/' })} type="button">
      Sign out
    </Button>
  )
}