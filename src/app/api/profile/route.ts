import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getProfile, saveProfile, type UserProfile } from '@/infrastructure/state/batch-store'
import { parseJsonBody } from '@/shared/lib/http'

const SEXES = ['female', 'male', 'unspecified']
const UNITS = ['metric', 'imperial']
const THEMES = ['system', 'light', 'dark']

export async function GET() {
  const session = await auth()
  const ownerEmail = session?.user?.email
  if (!ownerEmail) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }
  return NextResponse.json(await getProfile(ownerEmail))
}

export async function PATCH(request: Request) {
  const session = await auth()
  const ownerEmail = session?.user?.email
  if (!ownerEmail) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const body = await parseJsonBody<Partial<UserProfile>>(request)
  if (!body) {
    return NextResponse.json({ message: 'Invalid request body' }, { status: 400 })
  }

  const patch: Partial<UserProfile> = {}

  if (body.ageYears !== undefined) {
    if (body.ageYears === null) {
      patch.ageYears = null
    } else {
      const age = Number(body.ageYears)
      if (!Number.isFinite(age) || age < 13 || age > 120) {
        return NextResponse.json({ message: 'Age must be between 13 and 120.' }, { status: 400 })
      }
      patch.ageYears = Math.round(age)
    }
  }

  if (body.sex !== undefined) {
    if (body.sex !== null && !SEXES.includes(String(body.sex))) {
      return NextResponse.json({ message: 'Unrecognised value for sex.' }, { status: 400 })
    }
    patch.sex = body.sex === null || body.sex === 'unspecified' ? null : String(body.sex)
  }

  if (body.activityFactor !== undefined) {
    const factor = Number(body.activityFactor)
    if (!Number.isFinite(factor) || factor < 1.0 || factor > 2.2) {
      return NextResponse.json({ message: 'Activity must be between 1.0 and 2.2.' }, { status: 400 })
    }
    patch.activityFactor = factor
  }

  if (body.units !== undefined) {
    if (!UNITS.includes(String(body.units))) {
      return NextResponse.json({ message: 'Units must be metric or imperial.' }, { status: 400 })
    }
    patch.units = String(body.units)
  }

  if (body.theme !== undefined) {
    if (!THEMES.includes(String(body.theme))) {
      return NextResponse.json({ message: 'Unrecognised theme.' }, { status: 400 })
    }
    patch.theme = String(body.theme)
  }

  return NextResponse.json(await saveProfile(ownerEmail, patch))
}
