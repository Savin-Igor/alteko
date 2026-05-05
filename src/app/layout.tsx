import type { ReactNode } from 'react'

// Root layout — required by Next.js. html/body/lang live in [locale]/layout.tsx.
// globals.css is imported only in [locale]/layout.tsx to avoid leaking Tailwind
// base reset into Payload admin routes.
export default function RootLayout({ children }: { children: ReactNode }) {
  return children as React.JSX.Element
}
