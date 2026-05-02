import OpenAI from 'openai'
import { env } from '@/env'

let _client: OpenAI | null = null

function getClient(): OpenAI {
  if (!_client) _client = new OpenAI({ apiKey: env.OPENAI_API_KEY })
  return _client
}

export interface ParsedExpenseItem {
  category: string
  rawLabel: string
  amountTotal: number
  amountPerM2: number
  amountPerApt: number
  unit: string | null
}

export interface ParsedExpenseReport {
  periodYear: number
  periodMonth: number
  buildingAddress: string | null
  totalAreaM2: number | null
  apartmentCount: number | null
  items: ParsedExpenseItem[]
  parseConfidence: 'HIGH' | 'MEDIUM' | 'LOW'
  notes: string | null
}

export async function parsePdfExpense(
  pdfBase64: string,
  buildingAddress: string,
): Promise<ParsedExpenseReport> {
  const client = getClient()

  const systemPrompt = `You are an expert at extracting structured data from Latvian utility bill PDFs (apsaimniekošanas rēķini).
Extract all expense line items and return a JSON object matching the schema exactly.
Categories must be one of: HEATING, COLD_WATER, HOT_WATER, WASTEWATER, WASTE, CLEANING, REPAIR_FUND, ADMINISTRATION, ELEVATOR, OTHER.
All amounts in EUR. amountPerM2 = amountTotal / totalAreaM2. amountPerApt = amountTotal / apartmentCount.
If totalAreaM2 or apartmentCount is unknown, estimate from context or set to null.
Return parseConfidence: HIGH if all data clear, MEDIUM if some fields estimated, LOW if significant data missing.`

  const userPrompt = `Extract expense data from this Latvian utility bill PDF for building: ${buildingAddress}.
Return JSON matching this schema:
{
  "periodYear": number,
  "periodMonth": number (1-12),
  "buildingAddress": string | null,
  "totalAreaM2": number | null,
  "apartmentCount": number | null,
  "items": [
    {
      "category": "HEATING|COLD_WATER|HOT_WATER|WASTEWATER|WASTE|CLEANING|REPAIR_FUND|ADMINISTRATION|ELEVATOR|OTHER",
      "rawLabel": "original text from PDF",
      "amountTotal": number,
      "amountPerM2": number,
      "amountPerApt": number,
      "unit": string | null
    }
  ],
  "parseConfidence": "HIGH|MEDIUM|LOW",
  "notes": string | null
}`

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: [
          { type: 'text', text: userPrompt },
          {
            type: 'image_url',
            image_url: {
              url: `data:application/pdf;base64,${pdfBase64}`,
              detail: 'high',
            },
          },
        ],
      },
    ],
    response_format: { type: 'json_object' },
    max_tokens: 2000,
  })

  const content = response.choices[0]?.message?.content
  if (!content) throw new Error('Empty LLM response')

  return JSON.parse(content) as ParsedExpenseReport
}
