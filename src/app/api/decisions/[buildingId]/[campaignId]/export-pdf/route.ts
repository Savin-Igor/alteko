import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { buildDecisionCampaignPdf } from '@/lib/pdf/decision-campaign'
import { getTemplate } from '@/lib/decisions/templates'
import type { CampaignLang } from '@/lib/pdf/decision-campaign'

export const runtime = 'nodejs'

const ALLOWED_ROLES = ['BOARD_MEMBER', 'ASSOCIATION_ADMIN', 'PLATFORM_ADMIN']

interface RouteParams {
  params: Promise<{ buildingId: string; campaignId: string }>
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })
  if (!user || !ALLOWED_ROLES.includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { campaignId } = await params

  const campaign = await prisma.decisionCampaign.findUnique({
    where: { id: campaignId },
    include: {
      building: {
        select: { address: true, cadastralCode: true, apartmentCount: true },
      },
    },
  })

  if (!campaign) {
    return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
  }

  const langParam = req.nextUrl.searchParams.get('lang')?.toUpperCase()
  const lang: CampaignLang = langParam === 'RU' ? 'RU' : 'LV'

  const questionText = lang === 'RU'
    ? (campaign.questionTextRu ?? campaign.questionTextLv)
    : campaign.questionTextLv

  const explanationText = lang === 'RU'
    ? (campaign.explanationTextRu ?? campaign.explanationTextLv)
    : campaign.explanationTextLv

  const template = getTemplate(campaign.decisionType)

  const pdfBuffer = await buildDecisionCampaignPdf({
    buildingAddress: campaign.building.address,
    cadastralCode: campaign.building.cadastralCode,
    campaignTitle: campaign.title,
    questionText,
    explanationText,
    legalBasis: template.legalBasis,
    lang,
    exportedAt: new Date(),
    apartmentCount: campaign.building.apartmentCount ?? 20,
  })

  const safeTitle = campaign.title.replace(/[^a-z0-9]/gi, '-').toLowerCase().slice(0, 40)
  const filename = `decision-${safeTitle}-${lang.toLowerCase()}.pdf`

  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': String(pdfBuffer.length),
    },
  })
}
