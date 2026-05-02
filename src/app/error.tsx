'use client'

import { useEffect } from 'react'
import Link from 'next/link'

interface Props {
  error: Error & { digest?: string }
  reset: () => void
}

// Root-level error boundary — no i18n provider. Strings are hardcoded.
export default function RootErrorPage({ error, reset }: Props) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="lv">
      <body className="min-h-screen bg-white">
        <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
          <h1 className="text-xl font-bold text-gray-900 mb-2">Что-то пошло не так</h1>
          <p className="text-gray-500 mb-8 max-w-xs">Попробуйте обновить страницу.</p>
          <div className="flex gap-3">
            <button onClick={reset} className="btn-primary">Попробовать снова</button>
            <Link href="/" className="btn-ghost">На главную</Link>
          </div>
        </div>
      </body>
    </html>
  )
}
