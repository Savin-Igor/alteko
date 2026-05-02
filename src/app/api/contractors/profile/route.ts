import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const contractorId = req.nextUrl.searchParams.get('id')
  if (!contractorId) {
    return NextResponse.json({ error: 'id required' }, { status: 400 })
  }

  const contractor = await prisma.contractor.findUnique({
    where: { id: contractorId, active: true },
    select: {
      id: true,
      companyName: true,
      registrationNumber: true,
      luroftVerified: true,
      specializations: true,
      geographicCoverage: true,
      rating: true,
      ratingCount: true,
    },
  })

  if (!contractor) {
    return NextResponse.json({ error: 'Contractor not found' }, { status: 404 })
  }

  return NextResponse.json(contractor)
}
