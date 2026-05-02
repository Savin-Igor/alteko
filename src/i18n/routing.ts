import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['lv', 'ru'],
  defaultLocale: 'lv',
  // LV has no prefix (/blog/...), RU gets /ru/blog/...
  localePrefix: 'as-needed',
})

export type Locale = (typeof routing.locales)[number]
