"use client"

import { useMemo, useState } from 'react'
import { computeBatchInsights } from '@/features/nutrition/lib/batch-insights'
import type { GroceryItem } from '@/features/grocery/types'

export function NutritionSummary({ items }: { items: GroceryItem[] }) {
  const insights = computeBatchInsights(items)
  const [showDetails, setShowDetails] = useState(false)

  const totals = useMemo(() => {
    return items.reduce(
      (acc, item) => ({
        caloriesKcal: acc.caloriesKcal + (item.caloriesKcal ?? 0),
        proteinG: acc.proteinG + (item.proteinG ?? 0),
        carbsG: acc.carbsG + (item.carbsG ?? 0),
        fatG: acc.fatG + (item.fatG ?? 0),
        sodiumMg: acc.sodiumMg + (item.sodiumMg ?? 0),
        vitaminDMcg: acc.vitaminDMcg + (item.vitaminDMcg ?? 0),
        ironMg: acc.ironMg + (item.ironMg ?? 0),
        calciumMg: acc.calciumMg + (item.calciumMg ?? 0),
      }),
      {
        caloriesKcal: 0,
        proteinG: 0,
        carbsG: 0,
        fatG: 0,
        sodiumMg: 0,
        vitaminDMcg: 0,
        ironMg: 0,
        calciumMg: 0,
      },
    )
  }, [items])

  return (
    <section className="nutrition-summary">
      <div className="section-header">
        <p className="eyebrow">Nutrition summary</p>
        <h2>Three quick signals, not a wall of numbers.</h2>
        <button
          aria-expanded={showDetails}
          className="button button-secondary"
          onClick={() => setShowDetails((current) => !current)}
          type="button"
        >
          {showDetails ? 'Hide detailed breakdown' : 'Show detailed breakdown'}
        </button>
      </div>
      <div className="nutrition-grid">
        {insights.map((insight) => (
          <article className={`nutrition-card tone-${insight.tone}`} key={insight.label}>
            <strong>{insight.label}</strong>
            <p>{insight.value}</p>
          </article>
        ))}
      </div>

      {showDetails ? (
        <div className="nutrition-detail-grid" aria-label="Detailed nutrient totals">
          <article className="nutrition-card tone-neutral">
            <strong>Protein</strong>
            <p>{Math.round(totals.proteinG)} g</p>
          </article>
          <article className="nutrition-card tone-neutral">
            <strong>Carbs</strong>
            <p>{Math.round(totals.carbsG)} g</p>
          </article>
          <article className="nutrition-card tone-neutral">
            <strong>Fat</strong>
            <p>{Math.round(totals.fatG)} g</p>
          </article>
          <article className="nutrition-card tone-neutral">
            <strong>Sodium</strong>
            <p>{Math.round(totals.sodiumMg)} mg</p>
          </article>
          <article className="nutrition-card tone-neutral">
            <strong>Vitamin D</strong>
            <p>{Math.round(totals.vitaminDMcg)} mcg</p>
          </article>
          <article className="nutrition-card tone-neutral">
            <strong>Iron</strong>
            <p>{Math.round(totals.ironMg)} mg</p>
          </article>
          <article className="nutrition-card tone-neutral">
            <strong>Calcium</strong>
            <p>{Math.round(totals.calciumMg)} mg</p>
          </article>
        </div>
      ) : null}
    </section>
  )
}
