import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getPriceBenchmark, getPriceBenchmarkBreakdown } from '@/lib/benchmarks/price'

export const runtime = 'nodejs'

const schema = z.object({
  city:          z.string().min(1).max(100).optional(),
  cadastralCode: z.string().min(1).max(20).optional(),
  yearFrom:      z.coerce.number().int().min(1800).max(2030).optional(),
  yearTo:        z.coerce.number().int().min(1800).max(2030).optional(),
  txMonths:      z.coerce.number().int().min(1).max(60).optional(),
  minArea:       z.coerce.number().min(5).max(1000).optional(),
  maxArea:       z.coerce.number().min(5).max(1000).optional(),
  groupBy:       z.enum(['city', 'wallMaterial']).optional(),
}).refine(
  (d) => d.groupBy || d.cadastralCode || d.city,
  { message: 'Provide at least one of: groupBy, cadastralCode, city' },
)

export async function GET(req: NextRequest) {
  const raw = Object.fromEntries(req.nextUrl.searchParams.entries())
  const parsed = schema.safeParse(raw)

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid parameters', details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    )
  }

  const { groupBy, ...rest } = parsed.data

  if (groupBy) {
    const result = await getPriceBenchmarkBreakdown({ ...rest, groupBy })
    if (!result) {
      return NextResponse.json(
        { error: 'Not enough data for the given filters' },
        { status: 404 },
      )
    }
    return NextResponse.json(result)
  }

  const result = await getPriceBenchmark(rest)
  if (!result) {
    return NextResponse.json(
      { error: 'Not enough transaction data (minimum 5 per group required)' },
      { status: 404 },
    )
  }
  return NextResponse.json(result)
}
