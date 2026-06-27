export const RDA = {
  caloriesKcal: 2000,
  proteinG: 50,
  carbsG: 275,
  fatG: 78,
  sodiumMg: 2300,
  vitaminDMcg: 15,
  ironMg: 18,
  calciumMg: 1000,
} as const

export type NutrientKey = keyof typeof RDA
