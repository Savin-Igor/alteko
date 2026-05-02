import { NextRequest, NextResponse } from 'next/server'
import { pollSmartIdSession } from '@/lib/auth/smartid'
import { prisma } from '@/lib/prisma'
import { encrypt } from '@/lib/auth/encrypt'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const { sessionId } = await req.json() as { sessionId: string }
  if (!sessionId) {
    return NextResponse.json({ error: 'sessionId required' }, { status: 400 })
  }

  const result = await pollSmartIdSession(sessionId)
  if (!result) {
    return NextResponse.json({ status: 'PENDING' })
  }

  // Upsert user — never log personal code, always encrypt before storage
  const encryptedCode = encrypt(result.personalCode)
  const user = await prisma.user.upsert({
    where: { email: `smartid:${result.personalCode}@alteko.internal` },
    create: {
      email: `smartid:${result.personalCode}@alteko.internal`,
      fullName: `${result.givenName} ${result.surname}`,
      smartIdCode: encryptedCode,
    },
    update: { smartIdCode: encryptedCode },
    select: { id: true },
  })

  return NextResponse.json({
    status: 'COMPLETE',
    userId: user.id,
    signature: result.signature,
    signedAt: result.signedAt.toISOString(),
  })
}
