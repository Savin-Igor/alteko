'use client'

import { useEffect } from 'react'
import Link from 'next/link'

interface Props {
  error: Error & { digest?: string }
  reset: () => void
}

// Root-level error boundary — outside the [locale] segment, so no i18n provider.
// Strings are bilingual inline.
export default function RootErrorPage({ error, reset }: Props) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="lv">
      <body className="min-h-screen bg-white">
        <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Kaut kas nogāja greizi / Что-то пошло не так
          </h1>
          <p className="text-gray-500 mb-8 max-w-xs">
            Mēģiniet atsvaidzināt lapu / Попробуйте обновить страницу.
          </p>
          <div className="flex gap-3">
            <button onClick={reset} className="btn-primary">Mēģināt vēlreiz / Попробовать снова</button>
            <Link href="/" className="btn-ghost">Uz sākumu / На главную</Link>
          </div>
        </div>
      </body>
    </html>
  )
}
