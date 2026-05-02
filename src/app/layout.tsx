import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ALTEKO — Аудит расходов вашего дома',
  description: 'Узнайте, переплачивает ли ваш дом за коммунальные услуги. Бесплатно, за 30 секунд.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="lv">
      <body className="min-h-screen bg-white">{children}</body>
    </html>
  )
}
