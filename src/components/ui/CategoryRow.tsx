interface CategoryRowProps {
  label: string
  valuePerM2: number
  deviationPct: number
  hasData: boolean
}

export function CategoryRow({ label, valuePerM2, deviationPct, hasData }: CategoryRowProps) {
  const dotClass =
    deviationPct > 20
      ? 'status-dot-danger'
      : deviationPct > 5
      ? 'status-dot-warning'
      : 'status-dot-success'

  const devClass =
    deviationPct > 20
      ? 'text-danger'
      : deviationPct > 5
      ? 'text-warning'
      : 'text-success'

  return (
    <div className="px-5 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2 min-w-0">
        <span className={dotClass} aria-hidden="true" />
        <span className="text-sm text-gray-800 truncate">{label}</span>
      </div>
      <div className="text-right flex-shrink-0 ml-3">
        <span className="text-sm font-medium text-gray-900">
          €{valuePerM2.toFixed(2)}/м²
        </span>
        {hasData && (
          <span className={`text-xs ml-2 ${devClass}`}>
            {deviationPct > 0 ? '+' : ''}
            {deviationPct}%
          </span>
        )}
      </div>
    </div>
  )
}
