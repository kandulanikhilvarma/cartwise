import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { deleteAccount } from '@/infrastructure/state/batch-store'
import { parseJsonBody } from '@/shared/lib/http'

/**
 * Removes the account and every batch under it. The caller must type their own
 * email back, so a stray or forged request cannot wipe an account.
 */
export async function DELETE(request: Request) {
  const session = await auth()
  const ownerEmail = session?.user?.email
  if (!ownerEmail) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const body = await parseJsonBody<{ confirmEmail?: string }>(request)
  if (body?.confirmEmail?.trim().toLowerCase() !== ownerEmail.toLowerCase()) {
    return NextResponse.json(
      { message: 'Type your email address exactly to confirm deletion.' },
      { status: 400 },
    )
  }

  const deleted = await deleteAccount(ownerEmail)
  if (!deleted) {
    return NextResponse.json({ message: 'No account found.' }, { status: 404 })
  }

  return NextResponse.json({ deleted: true })
}
