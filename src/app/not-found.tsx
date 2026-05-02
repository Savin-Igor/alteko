import Link from 'next/link'
import { SiteHeader } from '@/components/ui/SiteHeader'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center">
        <p className="text-6xl font-bold text-gray-200 mb-4">404</p>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Страница не найдена</h1>
        <p className="text-gray-500 mb-8 max-w-xs">
          Возможно, ссылка устарела или была изменена.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
          <Link href="/" className="btn-primary">На главную</Link>
          <Link href="/blog" className="btn-ghost">Блог</Link>
        </div>
      </main>
    </div>
  )
}
