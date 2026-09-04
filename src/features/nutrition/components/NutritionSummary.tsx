'use client'

import { useMemo, useState } from 'react'
import {
  computeBatchSignals,
  computeBatchTotals,
  computeSpend,
  type SignalKind,
} from '@/features/nutrition/lib/batch-insights'
import {
  householdSizeOf,
  shopReference,
  type NutrientProfile,
} from '@/features/nutrition/lib/rda-constants'
import type { GroceryItem } from '@/features/grocery/types'
import { Meter } from '@/shared/components/Meter'

const KIND_LABEL: Record<SignalKind, string> = {
  watch: 'Watch',
  gap: 'Gap',
  win: 'Win',
}

function money(value: number, currency?: string | null): string {
  if (!currency) return value.toFixed(2)
  try {
    return value.toLocaleString(undefined, { style: 'currency', currency })
  } catch {
    return value.toFixed(2)
  }
}

type NutritionSummaryProps = {
  items: GroceryItem[]
  profile?: NutrientProfile | null
  currency?: string | null
}

export function NutritionSummary({ items, profile, currency }: NutritionSummaryProps) {
  const [showDetails, setShowDetails] = useState(false)

  const { signals, totals, coverage, weekly, spend } = useMemo(() => {
    const { totals: computed, coverage: cover } = computeBatchTotals(items)
    return {
      signals: computeBatchSignals(items, profile),
      totals: computed,
      coverage: cover,
      weekly: shopReference(profile),
      spend: computeSpend(items),
    }
  }, [items, profile])

  const unweighed = coverage.matched - coverage.weighed
  const canShowTotals = coverage.weighed > 0

  // A shop is a week's supply, not a meal, so that is what it is measured against.
  const household = householdSizeOf(profile)
  const periodLabel = household === 1 ? 'a week for one person' : `a week for ${household} people`

  return (
    <section className="nutrition-read">
      <div className="read-head">
        <p className="eyebrow">This shop</p>
        <h2>One thing to watch, one gap, one win.</h2>
      </div>

      {signals.length > 0 ? (
        <ul className="signal-list">
          {signals.map((signal) => (
            <li className={`signal-row is-${signal.kind}`} key={`${signal.kind}-${signal.label}`}>
              <div className="signal-row-body">
                <span className="signal-row-label">{signal.label}</span>
                <span className="signal-row-note">{signal.note}</span>
              </div>
              <span className={`signal-tag is-${signal.kind}`}>{KIND_LABEL[signal.kind]}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="fine-print">
          Nothing in this batch matched a nutrition source yet, so there is no read to give.
        </p>
      )}

      <p className="coverage-note num">
        {canShowTotals
          ? `Totals cover ${coverage.weighed} of ${coverage.total} items — ${coverage.totalGrams.toLocaleString()} g of food.`
          : `${coverage.matched} of ${coverage.total} items matched, but none stated a weight, so no totals can be given.`}
        {unweighed > 0 ? (
          <>
            {' '}
            <span className="coverage-gap">
              {unweighed} matched {unweighed === 1 ? 'item has' : 'items have'} no weight on the
              receipt — add one to bring {unweighed === 1 ? 'it' : 'them'} into the totals.
            </span>
          </>
        ) : null}
      </p>

      {canShowTotals ? (
        <>
          <button
            aria-expanded={showDetails}
            className="button button-secondary"
            onClick={() => setShowDetails((current) => !current)}
            type="button"
          >
            {showDetails ? 'Hide the full breakdown' : 'Show the full breakdown'}
          </button>

          {showDetails ? (
            <div className="meter-list" aria-label={`Nutrient totals against ${periodLabel}`}>
              <Meter
                label="Energy"
                value={totals.caloriesKcal}
                reference={weekly.caloriesKcal}
                unit="kcal"
                direction="less-is-better"
                periodLabel={periodLabel}
              />
              <Meter
                label="Protein"
                value={totals.proteinG}
                reference={weekly.proteinG}
                unit="g"
                direction="more-is-better"
                periodLabel={periodLabel}
              />
              <Meter
                label="Fibre"
                value={totals.fiberG}
                reference={weekly.fiberG}
                unit="g"
                direction="more-is-better"
                periodLabel={periodLabel}
              />
              <Meter
                label="Sugar"
                value={totals.sugarG}
                reference={weekly.sugarG}
                unit="g"
                direction="less-is-better"
                periodLabel={periodLabel}
              />
              <Meter
                label="Fat"
                value={totals.fatG}
                reference={weekly.fatG}
                unit="g"
                direction="less-is-better"
                periodLabel={periodLabel}
              />
              <Meter
                label="Sodium"
                value={totals.sodiumMg}
                reference={weekly.sodiumMg}
                unit="mg"
                direction="less-is-better"
                periodLabel={periodLabel}
              />
              <Meter
                label="Vitamin D"
                value={totals.vitaminDMcg}
                reference={weekly.vitaminDMcg}
                unit="µg"
                direction="more-is-better"
                periodLabel={periodLabel}
                decimals={1}
              />
              <Meter
                label="Iron"
                value={totals.ironMg}
                reference={weekly.ironMg}
                unit="mg"
                direction="more-is-better"
                periodLabel={periodLabel}
                decimals={1}
              />
              <Meter
                label="Calcium"
                value={totals.calciumMg}
                reference={weekly.calciumMg}
                unit="mg"
                direction="more-is-better"
                periodLabel={periodLabel}
              />
            </div>
          ) : null}
        </>
      ) : null}

      {spend ? (
        <div className="spend-block">
          <div className="spend-head">
            <span className="spend-label">What it cost</span>
            <span className="spend-total num">{money(spend.total, currency)}</span>
          </div>
          <p className="fine-print num">
            From {spend.itemsPriced} priced {spend.itemsPriced === 1 ? 'line' : 'lines'} on the
            receipt
            {spend.costPerProteinGram !== null
              ? ` · ${money(spend.costPerProteinGram, currency)} per gram of protein`
              : ''}
            .
          </p>
          {spend.byGroup.length > 0 ? (
            <ul className="spend-bars">
              {spend.byGroup.map((group) => (
                <li key={group.group}>
                  <span className="spend-bar-label">{group.label}</span>
                  <span
                    className={`spend-bar viz-${group.group}`}
                    style={{ width: `${Math.round((group.spend / spend.total) * 100)}%` }}
                  />
                  <span className="spend-bar-value num">{money(group.spend, currency)}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      <p className="fine-print">
        Figures are per-100g data from USDA FoodData Central and Open Food Facts, scaled by the
        weights on your receipt. Informational, not dietetic advice.
      </p>
    </section>
  )
}
