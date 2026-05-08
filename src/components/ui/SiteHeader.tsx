'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/navigation'
import { LangToggle } from './LangToggle'

const NAV: Array<{ href: string; key: 'audit' | 'renovation' | 'blog' }> = [
  { href: '/audit',      key: 'audit' },
  { href: '/renovation', key: 'renovation' },
  { href: '/blog',       key: 'blog' },
]

export function SiteHeader() {
  const tNav = useTranslations('nav')
  const tHeader = useTranslations('components.siteHeader')

  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  function isActive(href: string) {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  const ctaLabel = tNav('findHome')

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center gap-6">
        <Link href="/" className="text-xl font-bold text-gray-900 flex-shrink-0">
          ALTEKO
        </Link>

        <nav className="hidden md:flex items-center gap-1 flex-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive(item.href)
                  ? 'text-primary bg-primary-light'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {tNav(item.key)}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3 flex-shrink-0">
          <LangToggle />
          <Link
            href="/#hero"
            className="inline-flex items-center justify-center bg-primary text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors hover:bg-primary-dark"
          >
            {ctaLabel}
          </Link>
        </div>

        <div className="ml-auto md:hidden flex items-center gap-2">
          <LangToggle />
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="p-2 min-h-[48px] min-w-[48px] flex items-center justify-center text-gray-600"
            aria-label={open ? tHeader('closeMenu') : tHeader('openMenu')}
          >
            {open ? (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <nav className="px-4 py-3 space-y-1">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`block px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                  isActive(item.href)
                    ? 'text-primary bg-primary-light'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {tNav(item.key)}
              </Link>
            ))}
          </nav>
          <div className="px-4 pb-4">
            <Link
              href="/#hero"
              onClick={() => setOpen(false)}
              className="btn-primary text-center block"
            >
              {ctaLabel}
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
