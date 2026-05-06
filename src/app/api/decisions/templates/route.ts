import { NextRequest, NextResponse } from 'next/server'
import { DecisionType } from '@prisma/client'
import { getTemplate, DECISION_TEMPLATES } from '@/lib/decisions/templates'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get('type')

  if (type) {
    if (!Object.values(DecisionType).includes(type as DecisionType)) {
      return NextResponse.json({ error: 'Unknown decision type' }, { status: 400 })
    }
    return NextResponse.json(getTemplate(type as DecisionType))
  }

  return NextResponse.json(DECISION_TEMPLATES)
}
