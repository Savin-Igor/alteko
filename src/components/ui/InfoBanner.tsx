import { ReactNode } from 'react'

interface InfoBannerProps {
  variant?: 'info' | 'warning' | 'success' | 'error'
  children: ReactNode
}

const STYLES: Record<string, string> = {
  info: 'bg-primary-light border-blue-200 text-blue-800',
  warning: 'bg-warning-light border-orange-200 text-orange-800',
  success: 'bg-success-light border-green-200 text-green-800',
  error: 'bg-danger-light border-red-200 text-red-800',
}

export function InfoBanner({ variant = 'info', children }: InfoBannerProps) {
  return (
    <div className={`border rounded-lg px-4 py-3 text-sm ${STYLES[variant]}`}>
      {children}
    </div>
  )
}
