import type { GroceryItem } from '@/features/grocery/types'

export type Insight = {
  label: string
  value: string
  tone: 'good' | 'warning' | 'neutral'
}

export function computeBatchInsights(items: GroceryItem[]): Insight[] {
  const totalCalories = items.reduce((sum, item) => sum + (item.caloriesKcal ?? 0), 0)
  const sodiumTotal = items.reduce((sum, item) => sum + (item.sodiumMg ?? 0), 0)
  const vitaminDCount = items.filter((item) => (item.vitaminDMcg ?? 0) > 0).length

  return [
    {
      label: 'Calories',
      value: `${Math.round(totalCalories)} kcal`,
      tone: totalCalories > 2200 ? 'warning' : 'good',
    },
    {
      label: 'Sodium',
      value: `${Math.round(sodiumTotal)} mg`,
      tone: sodiumTotal > 2300 ? 'warning' : 'neutral',
    },
    {
      label: 'Vitamin D sources',
      value: `${vitaminDCount} items`,
      tone: vitaminDCount === 0 ? 'warning' : 'good',
    },
  ]
}
