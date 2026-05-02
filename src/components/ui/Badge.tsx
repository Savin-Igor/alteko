interface BadgeProps {
  status: 'active' | 'done' | 'cancelled' | 'pending'
  label: string
}

const STYLES: Record<string, string> = {
  active: 'bg-primary-light text-primary',
  done: 'bg-success-light text-success',
  cancelled: 'bg-gray-100 text-gray-500',
  pending: 'bg-warning-light text-warning',
}

export function Badge({ status, label }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STYLES[status]}`}>
      {label}
    </span>
  )
}
