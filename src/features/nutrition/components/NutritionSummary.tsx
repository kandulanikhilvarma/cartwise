import { computeBatchInsights } from '@/features/nutrition/lib/batch-insights'
import type { GroceryItem } from '@/features/grocery/types'

export function NutritionSummary({ items }: { items: GroceryItem[] }) {
  const insights = computeBatchInsights(items)

  return (
    <section className="nutrition-summary">
      <div className="section-header">
        <p className="eyebrow">Nutrition summary</p>
        <h2>Three quick signals, not a wall of numbers.</h2>
      </div>
      <div className="nutrition-grid">
        {insights.map((insight) => (
          <article className={`nutrition-card tone-${insight.tone}`} key={insight.label}>
            <strong>{insight.label}</strong>
            <p>{insight.value}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
