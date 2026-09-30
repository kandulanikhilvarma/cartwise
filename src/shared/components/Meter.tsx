type MeterProps = {
  label: string
  /** Absolute amount in the batch. */
  value: number
  /** Reference intake for the same nutrient over the whole period. */
  reference: number
  unit: string
  /** Whether more of this nutrient is a good thing or a thing to watch. */
  direction: 'more-is-better' | 'less-is-better'
  decimals?: number
  /** What the reference covers, e.g. "a week for one person". */
  periodLabel: string
}

function format(value: number, decimals: number): string {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

/**
 * One nutrient against its daily reference. The bar is capped at 100% of its
 * track but the number is not, so a shop carrying three days of sodium reads
 * as "310%" rather than a full bar that looks the same as 100%.
 */
export function Meter({
  label,
  value,
  reference,
  unit,
  direction,
  decimals = 0,
  periodLabel,
}: MeterProps) {
  const share = reference > 0 ? (value / reference) * 100 : 0
  const width = Math.min(100, Math.max(share, value > 0 ? 1.5 : 0))

  const tone =
    direction === 'less-is-better'
      ? share >= 100
        ? 'watch'
        : 'neutral'
      : share >= 100
        ? 'win'
        : share < 33
          ? 'gap'
          : 'neutral'

  return (
    <div className="meter">
      <div className="meter-head">
        <span className="meter-label">{label}</span>
        <span className="meter-value num">
          {format(value, decimals)} {unit}
        </span>
      </div>
      <div
        className={`meter-track tone-${tone}`}
        role="meter"
        // A value above max is invalid ARIA; the real share (which can pass
        // 100%) is in the label and the visible text.
        aria-valuenow={Math.min(100, Math.round(share))}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${label}: ${format(value, decimals)} ${unit}, ${Math.round(share)} percent of ${periodLabel}`}
      >
        <span className="meter-fill" style={{ width: `${width}%` }} />
      </div>
      <p className="meter-foot num">
        {Math.round(share)}% of {periodLabel}
      </p>
    </div>
  )
}
