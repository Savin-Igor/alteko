import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['ru', 'lv'],
  defaultLocale: 'ru',
  // RU has no prefix (/blog/...), LV gets /lv/blog/...
  localePrefix: 'as-needed',
})

export type Locale = (typeof routing.locales)[number]
