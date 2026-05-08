/**
 * GPT-4o narrative generation for the Readiness Report PDF.
 *
 * Produces a 3-4 sentence personalized summary of the building's readiness
 * in the requested language (LV or RU). This text appears at the top of
 * section 2 (Mājas gatavības novērtējums) in the PDF.
 */

import OpenAI from 'openai'
import type { EnergyClass } from '@prisma/client'
import type { ScoreComponents } from '@/lib/readiness/score'
import { env } from '@/env'

let _client: OpenAI | null = null
function getClient(): OpenAI {
  if (!_client) {
    _client = new OpenAI({ apiKey: env.OPENAI_API_KEY })
  }
  return _client
}

export async function generateNarrative(
  building: {
    address: string
    series: string | null
    constructionYear: number | null
    energyClass: EnergyClass | null
  },
  score: ScoreComponents,
  lang: 'LV' | 'RU'
): Promise<string> {
  const langInstructions =
    lang === 'LV'
      ? 'Write in Latvian (latviešu valodā). Use formal but plain language.'
      : 'Write in Russian (на русском языке). Use formal but plain language.'

  const prompt = `You are writing a brief professional assessment of an apartment building's renovation readiness for a paid report.

Building: ${building.address}
Series: ${building.series ?? 'unknown'}
Construction year: ${building.constructionYear ?? 'unknown'}
Energy class: ${building.energyClass ?? 'unknown'}

Readiness score components (0-100, null = no data):
- Energy efficiency score: ${score.energyScore ?? 'no data'}
- Funding eligibility score: ${score.fundingEligibilityScore ?? 'no data'}
- Document readiness: ${score.documentReadinessScore ?? 'no data'}%
- Owner decision readiness: ${score.ownerDecisionReadinessScore ?? 'no data'}%
- Financial feasibility: ${score.financialFeasibilityScore ?? 'no data'}
- Data confidence: ${score.dataConfidenceStatus}
- Next best action: ${score.supplierSelectionStatus}

Write 3-4 sentences. Include: current energy situation, biggest gap in readiness, recommended next step. Be specific and honest — mention if data is limited. Do NOT promise subsidies or guarantees. Do NOT mention ALTUM 2021-2027 as available (it is closed).

${langInstructions}`

  const client = getClient()
  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 300,
    temperature: 0.3,
  })

  return response.choices[0]?.message?.content?.trim() ?? ''
}
