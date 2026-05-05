import type { JSX } from 'react'

interface BlogCoverIconProps {
  tags: string[]
  className?: string
}

const TAG_CONFIG: Record<string, { bg: string; icon: JSX.Element }> = {
  'отопление': {
    bg: 'bg-warning-light',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 2C8.5 5.5 7 8 7 11a5 5 0 0010 0c0-3-1.5-5.5-5-9z" fill="#EA580C" opacity="0.8" />
        <path d="M12 8c-1.5 2-2 3.5-2 5a2 2 0 004 0c0-1.5-.5-3-2-5z" fill="#FFF7ED" />
      </svg>
    ),
  },
  'реновация': {
    bg: 'bg-primary-light',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3" y="10" width="18" height="11" rx="1" fill="#2563EB" opacity="0.15" stroke="#2563EB" strokeWidth="1.5" />
        <path d="M2 10l10-7 10 7" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="9" y="14" width="6" height="7" rx="0.5" fill="#2563EB" opacity="0.4" />
      </svg>
    ),
  },
  'субсидии': {
    bg: 'bg-success-light',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="4" y="4" width="16" height="16" rx="2" fill="#16A34A" opacity="0.15" stroke="#16A34A" strokeWidth="1.5" />
        <path d="M12 8v8M9 11h6" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  'расходы': {
    bg: 'bg-gray-100',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="4" y="14" width="3" height="6" rx="0.5" fill="#6B7280" opacity="0.6" />
        <rect x="10" y="10" width="3" height="10" rx="0.5" fill="#6B7280" opacity="0.8" />
        <rect x="16" y="7" width="3" height="13" rx="0.5" fill="#6B7280" />
        <path d="M4 6l4 3 4-4 5 4" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  'apkure': {
    bg: 'bg-warning-light',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 2C8.5 5.5 7 8 7 11a5 5 0 0010 0c0-3-1.5-5.5-5-9z" fill="#EA580C" opacity="0.8" />
        <path d="M12 8c-1.5 2-2 3.5-2 5a2 2 0 004 0c0-1.5-.5-3-2-5z" fill="#FFF7ED" />
      </svg>
    ),
  },
  'renovācija': {
    bg: 'bg-primary-light',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3" y="10" width="18" height="11" rx="1" fill="#2563EB" opacity="0.15" stroke="#2563EB" strokeWidth="1.5" />
        <path d="M2 10l10-7 10 7" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="9" y="14" width="6" height="7" rx="0.5" fill="#2563EB" opacity="0.4" />
      </svg>
    ),
  },
  'subsīdijas': {
    bg: 'bg-success-light',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="4" y="4" width="16" height="16" rx="2" fill="#16A34A" opacity="0.15" stroke="#16A34A" strokeWidth="1.5" />
        <path d="M12 8v8M9 11h6" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  'izdevumi': {
    bg: 'bg-gray-100',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="4" y="14" width="3" height="6" rx="0.5" fill="#6B7280" opacity="0.6" />
        <rect x="10" y="10" width="3" height="10" rx="0.5" fill="#6B7280" opacity="0.8" />
        <rect x="16" y="7" width="3" height="13" rx="0.5" fill="#6B7280" />
        <path d="M4 6l4 3 4-4 5 4" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
}

const DEFAULT_CONFIG = {
  bg: 'bg-gray-100',
  icon: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" fill="#9CA3AF" opacity="0.3" stroke="#9CA3AF" strokeWidth="1.5" />
      <path d="M8 12h8M8 8h8M8 16h5" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
}

export function BlogCoverIcon({ tags, className }: BlogCoverIconProps) {
  const primaryTag = tags[0] ?? ''
  const config = TAG_CONFIG[primaryTag] ?? DEFAULT_CONFIG

  return (
    <div
      className={`flex-shrink-0 w-14 h-14 rounded-lg flex items-center justify-center ${config.bg} ${className ?? ''}`}
    >
      {config.icon}
    </div>
  )
}
