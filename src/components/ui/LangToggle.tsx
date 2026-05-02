'use client'

import { useLocale } from 'next-intl'
import { useRouter, usePathname } from '@/i18n/navigation'
import { useTransition } from 'react'

export function LangToggle() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  function switchLocale(next: 'lv' | 'ru') {
    if (next === locale) return
    startTransition(() => {
      router.replace(pathname, { locale: next })
    })
  }

  return (
    <div className={`flex gap-1 ${isPending ? 'opacity-60' : ''}`}>
      {(['lv', 'ru'] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => switchLocale(l)}
          className={`px-4 py-3 min-h-[48px] rounded-lg text-sm font-medium transition-colors ${
            locale === l
              ? 'text-primary bg-primary-light'
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
