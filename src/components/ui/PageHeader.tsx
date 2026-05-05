import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'

interface PageHeaderProps {
  variant?: 'minimal' | 'breadcrumb' | 'admin'
  backHref?: string
  backLabel?: string
}

export function PageHeader({ variant = 'minimal', backHref, backLabel }: PageHeaderProps) {
  const t = useTranslations('components.pageHeader')

  if (variant === 'breadcrumb' && backHref) {
    return (
      <header className="flex items-center px-4 py-3 border-b border-gray-100 bg-white gap-3">
        <Link
          href={backHref}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 min-h-[48px] transition-colors flex-1 min-w-0"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="truncate">{backLabel ?? t('back')}</span>
        </Link>
        <Link href="/" className="text-lg font-bold text-gray-900 flex-shrink-0">
          ALTEKO
        </Link>
        <div className="flex-1" />
      </header>
    )
  }

  if (variant === 'admin') {
    return (
      <header className="bg-white flex items-center justify-between px-4 py-4 border-b border-gray-100">
        <Link href="/" className="text-xl font-bold text-gray-900">ALTEKO</Link>
        <span className="text-sm text-gray-500">{t('boardPanel')}</span>
      </header>
    )
  }

  return (
    <header className="flex items-center justify-between px-4 py-4 border-b border-gray-100 bg-white">
      <Link href="/" className="text-xl font-bold text-gray-900">ALTEKO</Link>
    </header>
  )
}
