interface ProgressBarProps {
  value: number
  variant?: 'primary' | 'success' | 'danger' | 'warning'
  label?: string
}

const TRACK_CLASS: Record<string, string> = {
  primary: 'bg-primary',
  success: 'bg-success',
  danger: 'bg-danger',
  warning: 'bg-warning',
}

export function ProgressBar({ value, variant = 'primary', label }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, Math.round(value * 100)))
  return (
    <div className="space-y-1">
      {label && <p className="text-xs text-gray-500">{label}</p>}
      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${TRACK_CLASS[variant]}`}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  )
}
