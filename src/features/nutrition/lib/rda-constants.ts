export type NutrientProfile = {
  ageYears?: number | null
  sex?: string | null
  activityFactor?: number | null
  /** How many people the shop feeds. Without it a family shop reads as excess. */
  householdSize?: number | null
}

export type Rda = {
  caloriesKcal: number
  proteinG: number
  carbsG: number
  fatG: number
  sugarG: number
  fiberG: number
  sodiumMg: number
  vitaminDMcg: number
  ironMg: number
  calciumMg: number
}

/** Reference intakes for an average adult, used when no profile is set. */
export const RDA: Rda = {
  caloriesKcal: 2000,
  proteinG: 50,
  carbsG: 275,
  fatG: 78,
  sugarG: 30,
  fiberG: 28,
  sodiumMg: 2300,
  vitaminDMcg: 15,
  ironMg: 18,
  calciumMg: 1000,
}

export type NutrientKey = keyof Rda

/**
 * Daily reference intakes for one person. Public reference values (UK/EU RI and
 * US DRI), not a clinical calculation — the app states figures are informational.
 * An unset profile returns the average-adult defaults unchanged.
 */
export function rdaForProfile(profile?: NutrientProfile | null): Rda {
  if (!profile) return RDA

  const sex = profile.sex === 'female' || profile.sex === 'male' ? profile.sex : null
  const age = typeof profile.ageYears === 'number' && profile.ageYears > 0 ? profile.ageYears : null
  const activity =
    typeof profile.activityFactor === 'number' && profile.activityFactor > 0
      ? profile.activityFactor
      : 1.4

  const baseCalories = sex === 'male' ? 2500 : sex === 'female' ? 2000 : 2250
  const calories = Math.round((baseCalories * (activity / 1.4)) / 10) * 10

  return {
    caloriesKcal: calories,
    proteinG: sex === 'male' ? 55 : 45,
    // Carbohydrate and fat references scale with energy, not with sex directly.
    carbsG: Math.round((calories * 0.5) / 4),
    fatG: Math.round((calories * 0.35) / 9),
    sugarG: 30,
    fiberG: sex === 'male' ? 30 : 25,
    sodiumMg: 2300,
    vitaminDMcg: age !== null && age >= 70 ? 20 : 15,
    ironMg: sex === 'female' && (age === null || age < 50) ? 18 : 8,
    calciumMg:
      (age !== null && age >= 70) || (sex === 'female' && age !== null && age >= 50) ? 1200 : 1000,
  }
}

export const DAYS_IN_SHOP = 7

export function householdSizeOf(profile?: NutrientProfile | null): number {
  const size = profile?.householdSize
  return typeof size === 'number' && Number.isFinite(size) && size >= 1 ? Math.round(size) : 1
}

/**
 * What a week of eating looks like for this household. A shop is a supply, not
 * a meal: comparing a full trolley against a single day's reference makes every
 * shop look like an excess, which is the wrong reading and the wrong advice.
 */
export function shopReference(profile?: NutrientProfile | null): Rda {
  const daily = rdaForProfile(profile)
  const multiplier = DAYS_IN_SHOP * householdSizeOf(profile)

  return Object.fromEntries(
    Object.entries(daily).map(([key, value]) => [key, value * multiplier]),
  ) as Rda
}

/** How many person-days of a nutrient the shop actually carries. */
export function daysOfSupply(
  amount: number,
  dailyReference: number,
  profile?: NutrientProfile | null,
): number {
  const perDay = dailyReference * householdSizeOf(profile)
  return perDay > 0 ? amount / perDay : 0
}
