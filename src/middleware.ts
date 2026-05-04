import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

export default createMiddleware(routing)

export const config = {
  matcher: [
    // Exclude: API routes, Payload admin, Next.js internals, static files
    '/((?!api|admin|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
}
