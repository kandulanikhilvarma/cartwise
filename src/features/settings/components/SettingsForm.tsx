'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { rdaForProfile } from '@/features/nutrition/lib/rda-constants'
import { Button, buttonClass } from '@/shared/components/Button'

export type ProfileValues = {
  ageYears: number | null
  sex: string | null
  activityFactor: number
  householdSize: number
  units: string
  theme: string
}

const ACTIVITY_LEVELS = [
  { value: 1.2, label: 'Mostly sitting' },
  { value: 1.4, label: 'Lightly active' },
  { value: 1.6, label: 'Active most days' },
  { value: 1.9, label: 'Very active' },
]

export function SettingsForm({
  initial,
  email,
}: {
  initial: ProfileValues
  email: string
}) {
  const router = useRouter()
  const [values, setValues] = useState(initial)
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [confirmEmail, setConfirmEmail] = useState('')
  const [deleting, setDeleting] = useState(false)
  // Its own error, shown beside the delete button; the shared one sat in the
  // card above, out of sight of the person deleting.
  const [deleteError, setDeleteError] = useState<string | null>(null)
  // The age as typed. Number('abc') used to become null and quietly clear it.
  const [ageText, setAgeText] = useState(initial.ageYears?.toString() ?? '')

  const rda = rdaForProfile(values)

  async function save() {
    const age = ageText.trim() === '' ? null : Number(ageText.trim())
    if (age !== null && !(Number.isInteger(age) && age >= 13 && age <= 120)) {
      setError('Age must be a whole number from 13 to 120, or left blank.')
      return
    }

    setSaving(true)
    setError(null)
    setStatus(null)
    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...values, ageYears: age }),
      })
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { message?: string } | null
        throw new Error(payload?.message ?? 'Could not save your settings.')
      }
      setStatus('Saved. Your nutrition references now use these values.')
      router.refresh()
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save your settings.')
    } finally {
      setSaving(false)
    }
  }

  async function removeAccount() {
    setDeleting(true)
    setDeleteError(null)
    try {
      const response = await fetch('/api/account', {
        method: 'DELETE',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ confirmEmail }),
      })
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { message?: string } | null
        throw new Error(payload?.message ?? 'Could not delete the account.')
      }
      await signOut({ callbackUrl: '/' })
    } catch (failure) {
      setDeleteError(failure instanceof Error ? failure.message : 'Could not delete the account.')
      setDeleting(false)
    }
  }

  return (
    <>
      <section className="surface-card">
        <div className="section-header">
          <p className="eyebrow">Your references</p>
          <h2>Who the daily figures are for</h2>
          <p className="fine-print">
            Cartwise compares your shop against daily reference intakes. Left blank, it uses an
            average adult. These are public reference values, not medical advice.
          </p>
        </div>

        <div className="field-row" style={{ marginTop: 'var(--s-3)' }}>
          <label className="field">
            Age
            <input
              inputMode="numeric"
              value={ageText}
              placeholder="Not set"
              onChange={(event) => {
                setAgeText(event.target.value)
                // Only a real age (or blank) moves the preview below.
                const next = event.target.value.trim()
                const age = Number(next)
                if (next === '') setValues((current) => ({ ...current, ageYears: null }))
                else if (Number.isInteger(age) && age >= 13 && age <= 120) {
                  setValues((current) => ({ ...current, ageYears: age }))
                }
              }}
            />
            <span className="field-hint">Changes the vitamin D and calcium references.</span>
          </label>

          <label className="field">
            Sex
            <select
              value={values.sex ?? 'unspecified'}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  sex: event.target.value === 'unspecified' ? null : event.target.value,
                }))
              }
            >
              <option value="unspecified">Prefer not to say</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
            </select>
            <span className="field-hint">Changes the iron, protein and energy references.</span>
          </label>

          <label className="field">
            Activity
            <select
              value={values.activityFactor}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  activityFactor: Number(event.target.value),
                }))
              }
            >
              {ACTIVITY_LEVELS.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
            <span className="field-hint">Scales the energy reference.</span>
          </label>

          <label className="field">
            People this shop feeds
            <select
              value={values.householdSize}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  householdSize: Number(event.target.value),
                }))
              }
            >
              {[1, 2, 3, 4, 5, 6].map((size) => (
                <option key={size} value={size}>
                  {size === 1 ? 'Just me' : `${size} people`}
                </option>
              ))}
            </select>
            <span className="field-hint">
              A shop is measured against a week for the whole household.
            </span>
          </label>
          {/* ponytail: units picker hidden until something outputs imperial (A-2); the saved value is kept. */}
        </div>

        <p className="coverage-note num" style={{ marginTop: 'var(--s-3)' }}>
          A day reads as {rda.caloriesKcal} kcal, {rda.proteinG} g protein, {rda.fiberG} g fibre,{' '}
          {rda.ironMg} mg iron, {rda.calciumMg} mg calcium — so a week for{' '}
          {values.householdSize === 1 ? 'one person' : `${values.householdSize} people`} is{' '}
          {(rda.caloriesKcal * 7 * values.householdSize).toLocaleString()} kcal.
        </p>

        <div className="cta-row" style={{ marginTop: 'var(--s-3)' }}>
          <Button variant="primary"  disabled={saving} onClick={save} type="button">
            {saving ? 'Saving…' : 'Save settings'}
          </Button>
        </div>

        <p aria-live="polite" className="sr-status">
          {status ?? ''}
        </p>
        <p className="error-text" role="alert">
          {error ?? ''}
        </p>
      </section>

      <section className="surface-card">
        <div className="section-header">
          <p className="eyebrow">Your data</p>
          <h2>Take it with you, or remove it</h2>
          <p className="fine-print">
            Receipt photos are never stored — only the text they contain. Each batch exports as CSV
            from its own page, or take everything at once as JSON.
          </p>
        </div>

        <div className="cta-row" style={{ marginTop: 'var(--s-3)' }}>
          <a className={buttonClass()} href="/api/account/export" download>
            Download all my data
          </a>
        </div>

        <label className="field" style={{ marginTop: 'var(--s-3)', maxWidth: '26rem' }}>
          Delete this account and every batch in it
          <input
            value={confirmEmail}
            placeholder={email}
            onChange={(event) => setConfirmEmail(event.target.value)}
            aria-describedby="delete-hint"
          />
          <span className="field-hint" id="delete-hint">
            Type <strong>{email}</strong> to confirm. This cannot be undone.
          </span>
        </label>

        <div className="cta-row" style={{ marginTop: 'var(--s-3)' }}>
          <Button
            variant="danger"
            disabled={deleting || confirmEmail.trim().toLowerCase() !== email.toLowerCase()}
            onClick={removeAccount}
          >
            {deleting ? 'Deleting…' : 'Delete my account'}
          </Button>
        </div>
        <p className="error-text" role="alert">
          {deleteError ?? ''}
        </p>
      </section>
    </>
  )
}
