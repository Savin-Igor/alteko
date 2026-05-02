import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getPriceBenchmark } from '@/lib/benchmarks/price'

export const runtime = 'nodejs'

const schema = z.object({
  cadastralCode: z.string().min(1).max(20).optional(),
  city:          z.string().min(1).max(100).optional(),
  yearFrom:      z.coerce.number().int().min(1800).max(2030).optional(),
  yearTo:        z.coerce.number().int().min(1800).max(2030).optional(),
  txYears:       z.coerce.number().int().min(1).max(20).optional(),
  minArea:       z.coerce.number().min(5).max(1000).optional(),
  maxArea:       z.coerce.number().min(5).max(1000).optional(),
}).refine(
  (d) => d.cadastralCode || d.city,
  { message: 'At least one of cadastralCode or city is required' },
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

  const result = await getPriceBenchmark(parsed.data)

  if (!result) {
    return NextResponse.json(
      { error: 'Not enough transaction data for the given filters (minimum 5 transactions required)' },
      { status: 404 },
    )
  }

  return NextResponse.json(result)
}
