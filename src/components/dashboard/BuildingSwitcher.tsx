'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useLocale } from 'next-intl'
import type { DashboardBuildingSummary } from '@/lib/dashboard/getActiveBuilding'

interface Props {
  buildings: DashboardBuildingSummary[]
  active: DashboardBuildingSummary
}

export function BuildingSwitcher({ buildings, active }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const locale = useLocale()

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const cadastral = e.target.value
    const params = new URLSearchParams(searchParams.toString())
    params.set('building', cadastral)
    // pathname already includes the locale prefix, so don't double-add it.
    const next = `${pathname}?${params.toString()}`
    router.push(next)
  }

  if (buildings.length <= 1) {
    return (
      <div className="text-sm text-gray-500" data-locale={locale}>
        {active.address}
      </div>
    )
  }

  return (
    <label className="block">
      <span className="sr-only">Building</span>
      <select
        value={active.cadastralCode}
        onChange={onChange}
        className="w-full md:w-auto border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
      >
        {buildings.map((b) => (
          <option key={b.cadastralCode} value={b.cadastralCode}>
            {b.address}
          </option>
        ))}
      </select>
    </label>
  )
}
