import { NextRequest, NextResponse } from 'next/server'
import { exchangeCodeForClaims } from '@/lib/auth/eparaksts'
import { prisma } from '@/lib/prisma'
import { encrypt } from '@/lib/auth/encrypt'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')
  const state = req.nextUrl.searchParams.get('state')

  if (!code) {
    return NextResponse.redirect(new URL('/auth/error?reason=eparaksts_no_code', req.url))
  }

  try {
    const claims = await exchangeCodeForClaims(code)
    const encryptedCode = encrypt(claims.personalCode)

    const user = await prisma.user.upsert({
      where: { email: `eparaksts:${claims.personalCode}@alteko.internal` },
      create: {
        email: `eparaksts:${claims.personalCode}@alteko.internal`,
        fullName: `${claims.givenName} ${claims.surname}`,
        smartIdCode: encryptedCode,
      },
      update: { smartIdCode: encryptedCode },
      select: { id: true },
    })

    // Redirect back to voting with user context
    const redirectUrl = new URL('/auth/eparaksts/complete', req.url)
    redirectUrl.searchParams.set('userId', user.id)
    redirectUrl.searchParams.set('signature', claims.signature)
    if (state) redirectUrl.searchParams.set('state', state)
    return NextResponse.redirect(redirectUrl)
  } catch (err) {
    console.error('eParaksts callback error:', err)
    return NextResponse.redirect(new URL('/auth/error?reason=eparaksts_failed', req.url))
  }
}
