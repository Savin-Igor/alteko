import Link from 'next/link'

// Root-level not-found — no i18n provider available here. Strings are hardcoded.
export default function NotFound() {
  return (
    <html lang="lv">
      <body className="min-h-screen bg-white">
        <main className="min-h-screen flex flex-col items-center justify-center px-4 py-16 text-center">
          <p className="text-6xl font-bold text-gray-200 mb-4">404</p>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Lapa nav atrasta / Страница не найдена</h1>
          <p className="text-gray-500 mb-8 max-w-xs">
            Iespējams, saite ir novecojusi vai mainīta.
          </p>
          <Link href="/" className="btn-primary">ALTEKO →</Link>
        </main>
      </body>
    </html>
  )
}
