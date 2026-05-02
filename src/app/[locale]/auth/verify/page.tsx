import Link from 'next/link'
import { PageHeader } from '@/components/ui'

export default function VerifyRequestPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <PageHeader variant="minimal" />

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm text-center space-y-5">
          <div className="w-14 h-14 bg-primary-light rounded-full flex items-center justify-center mx-auto">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 4h16v16H4z" stroke="#2563EB" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M4 4l8 8 8-8" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <h1 className="text-xl font-bold text-gray-900">Проверьте почту</h1>
          <p className="text-gray-500 leading-relaxed">
            Ссылка для входа отправлена. Перейдите по ней — и вы окажетесь в дашборде.
          </p>
          <p className="text-sm text-gray-400">
            Ссылка действует 24 часа. Не нашли? Проверьте папку «Спам».
          </p>

          <Link href="/auth/signin" className="text-sm text-primary hover:underline block">
            Запросить новую ссылку
          </Link>

          <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 block">
            ← На главную
          </Link>
        </div>
      </main>
    </div>
  )
}
