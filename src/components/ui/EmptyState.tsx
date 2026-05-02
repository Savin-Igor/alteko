import Link from 'next/link'

interface EmptyStateProps {
  title: string
  description: string
  action?: { label: string; href: string }
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="card text-center py-10 space-y-3">
      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M4 4h12v12H4z" stroke="#9CA3AF" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M8 9h4M8 12h2" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <p className="font-medium text-gray-900">{title}</p>
      <p className="text-sm text-gray-500 max-w-xs mx-auto">{description}</p>
      {action && (
        <Link href={action.href} className="btn-primary mt-2 inline-block w-auto px-8">
          {action.label}
        </Link>
      )}
    </div>
  )
}
