import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { SiteHeader } from '@/components/ui/SiteHeader'

export default async function NotFound() {
  let notFoundText = 'Страница не найдена'
  let notFoundDesc = 'Возможно, ссылка устарела или была изменена.'
  let backToMain = 'На главную'

  try {
    const t = await getTranslations('errors')
    const tCommon = await getTranslations('common')
    notFoundText = t('notFound')
    notFoundDesc = t('notFoundDesc')
    backToMain = tCommon('backToMain')
  } catch {
    // locale context unavailable — use hardcoded fallbacks
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center">
        <p className="text-6xl font-bold text-gray-200 mb-4">404</p>
        <h1 className="text-xl font-bold text-gray-900 mb-2">{notFoundText}</h1>
        <p className="text-gray-500 mb-8 max-w-xs">{notFoundDesc}</p>
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
          <Link href="/" className="btn-primary">{backToMain}</Link>
          <Link href="/blog" className="btn-ghost">Blog</Link>
        </div>
      </main>
    </div>
  )
}
