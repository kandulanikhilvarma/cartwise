import type { GroceryItem } from '@/features/grocery/types'
import { RDA } from './rda-constants'

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
      tone: totalCalories > RDA.caloriesKcal ? 'warning' : 'good',
    },
    {
      label: 'Sodium',
      value: `${Math.round(sodiumTotal)} mg`,
      tone: sodiumTotal > RDA.sodiumMg ? 'warning' : 'neutral',
    },
    {
      label: 'Vitamin D sources',
      value: `${vitaminDCount} items`,
      tone: vitaminDCount === 0 ? 'warning' : 'good',
    },
  ]
}
