'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface UnlockPersistProps {
  reportId: string
  isUnlocked: boolean
}

export function UnlockPersist({ reportId, isUnlocked }: UnlockPersistProps) {
  const router = useRouter()
  const key = `alteko_unlocked_${reportId}`

  useEffect(() => {
    if (isUnlocked) {
      localStorage.setItem(key, '1')
    } else if (localStorage.getItem(key) === '1') {
      router.replace(`/audit/report/${reportId}?unlocked=1`)
    }
  }, [reportId, isUnlocked, key, router])

  return null
}
