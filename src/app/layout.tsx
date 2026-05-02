import './globals.css'
import type { ReactNode } from 'react'

// Root layout — required by Next.js. html/body/lang live in [locale]/layout.tsx.
export default function RootLayout({ children }: { children: ReactNode }) {
  return children as React.JSX.Element
}
