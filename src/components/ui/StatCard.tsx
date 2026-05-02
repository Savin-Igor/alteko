interface StatCardProps {
  label: string
  value: string | number
  unit?: string
  variant?: 'neutral' | 'danger' | 'warning' | 'success'
  size?: 'sm' | 'md' | 'lg'
  description?: string
}

const VARIANT_VALUE_CLASS: Record<string, string> = {
  neutral: 'text-gray-900',
  danger: 'text-danger',
  warning: 'text-warning',
  success: 'text-success',
}

const SIZE_VALUE_CLASS: Record<string, string> = {
  sm: 'text-metric',
  md: 'text-metric-lg',
  lg: 'text-metric-xl',
}

export function StatCard({
  label,
  value,
  unit,
  variant = 'neutral',
  size = 'md',
  description,
}: StatCardProps) {
  return (
    <div className="card space-y-1">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
      <p className={`font-bold ${SIZE_VALUE_CLASS[size]} ${VARIANT_VALUE_CLASS[variant]}`}>
        {value}
        {unit && <span className="text-base font-normal text-gray-500 ml-1">{unit}</span>}
      </p>
      {description && <p className="text-sm text-gray-500">{description}</p>}
    </div>
  )
}
