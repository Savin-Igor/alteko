'use client'

import { useEffect } from 'react'
import Link from 'next/link'

interface Props {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorPage({ error, reset }: Props) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <div className="w-12 h-12 bg-danger-light rounded-full flex items-center justify-center mx-auto mb-4">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M10 6v5M10 14h.01" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="10" cy="10" r="8" stroke="#DC2626" strokeWidth="1.5" />
        </svg>
      </div>
      <h1 className="text-xl font-bold text-gray-900 mb-2">Что-то пошло не так</h1>
      <p className="text-gray-500 mb-8 max-w-xs">
        Произошла ошибка. Попробуйте обновить страницу или вернитесь на главную.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
        <button onClick={reset} className="btn-primary">Попробовать снова</button>
        <Link href="/" className="btn-ghost">На главную</Link>
      </div>
    </div>
  )
}
