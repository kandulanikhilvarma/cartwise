import type { Metadata } from 'next'
import { auth } from '@/auth'
import { getProfile } from '@/infrastructure/state/batch-store'
import { SettingsForm } from '@/features/settings/components/SettingsForm'

export const metadata: Metadata = { title: 'Settings' }

export default async function SettingsPage() {
  const session = await auth()
  const ownerEmail = session?.user?.email
  if (!ownerEmail) return null

  const profile = await getProfile(ownerEmail)

  return (
    <main className="surface-page">
      <div className="scan-intro">
        <h1>Settings</h1>
        <p className="lede">
          Who the daily references are for, and what happens to your data.
        </p>
      </div>

      <SettingsForm initial={profile} email={ownerEmail} />
    </main>
  )
}
