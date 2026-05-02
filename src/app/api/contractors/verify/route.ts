import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { z } from 'zod'

export const runtime = 'nodejs'

const schema = z.object({
  companyName: z.string().min(2),
  registrationNumber: z.string().min(5),
  specializations: z.array(z.string()).min(1),
  geographicCoverage: z.array(z.string()).min(1),
})

// Lursoft company verification stub
// Production: requires paid Lursoft API access (lursoft.lv)
async function verifyWithLursoft(registrationNumber: string): Promise<{
  active: boolean
  name: string | null
  bankruptcyRisk: boolean
}> {
  const apiKey = process.env.LURSOFT_API_KEY
  if (!apiKey) {
    // Dev mock — accept any registration number
    return { active: true, name: null, bankruptcyRisk: false }
  }

  try {
    const res = await fetch(
      `https://api.lursoft.lv/company/${registrationNumber}`,
      { headers: { Authorization: `Bearer ${apiKey}` }, signal: AbortSignal.timeout(10000) },
    )
    if (!res.ok) return { active: false, name: null, bankruptcyRisk: false }
    const data = await res.json()
    return {
      active: data.status === 'ACTIVE',
      name: data.name ?? null,
      bankruptcyRisk: data.insolvency === true,
    }
  } catch {
    return { active: false, name: null, bankruptcyRisk: false }
  }
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
  }

  const { companyName, registrationNumber, specializations, geographicCoverage } = parsed.data

  // Check not already registered
  const existing = await prisma.contractor.findUnique({ where: { registrationNumber } })
  if (existing) {
    return NextResponse.json({ error: 'Contractor already registered' }, { status: 409 })
  }

  // Verify with Lursoft
  const lursoft = await verifyWithLursoft(registrationNumber)
  if (lursoft.bankruptcyRisk) {
    return NextResponse.json(
      { error: 'Компания находится в процессе неплатёжеспособности' },
      { status: 422 },
    )
  }

  const contractor = await prisma.contractor.create({
    data: {
      userId: session.user.id,
      companyName: lursoft.name ?? companyName,
      registrationNumber,
      luroftVerified: lursoft.active,
      specializations,
      geographicCoverage,
      active: false, // requires admin approval
    },
  })

  return NextResponse.json({
    contractorId: contractor.id,
    luroftVerified: contractor.luroftVerified,
    status: 'pending_approval',
  }, { status: 201 })
}
