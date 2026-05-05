interface BuildingIconProps {
  variant?: 'danger' | 'success' | 'neutral'
  size?: number
  className?: string
}

const COLORS = {
  danger: { body: '#FEF2F2', border: '#FECACA', window: '#FCA5A5', accent: '#DC2626' },
  success: { body: '#F0FDF4', border: '#BBF7D0', window: '#86EFAC', accent: '#16A34A' },
  neutral: { body: '#F8FAFC', border: '#E2E8F0', window: '#BFDBFE', accent: '#2563EB' },
}

export function BuildingIcon({ variant = 'neutral', size = 40, className }: BuildingIconProps) {
  const c = COLORS[variant]
  return (
    <svg
      width={size}
      height={Math.round(size * 1.35)}
      viewBox="0 0 40 54"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Ground */}
      <rect x="0" y="50" width="40" height="4" rx="1" fill={c.border} />
      {/* Building body */}
      <rect x="4" y="8" width="32" height="42" rx="1" fill={c.body} stroke={c.border} strokeWidth="1" />
      {/* Roof line */}
      <rect x="2" y="5" width="36" height="5" rx="1" fill={c.border} />
      {/* Windows — 3 columns × 5 rows */}
      {[14, 22, 30, 38].map((y) =>
        [8, 18, 28].map((x) => (
          <rect key={`${x}-${y}`} x={x} y={y} width="6" height="5" rx="0.5" fill={c.window} />
        ))
      )}
      {/* Door */}
      <rect x="17" y="41" width="6" height="9" rx="0.5" fill={c.accent} opacity="0.6" />
    </svg>
  )
}
