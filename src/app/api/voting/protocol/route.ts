import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { uploadFile, getPresignedDownloadUrl, buildProtocolKey } from '@/lib/s3'

export const runtime = 'nodejs'

function generateProtocolText(data: {
  buildingAddress: string
  campaignTitle: string
  totalVotes: number
  yesVotes: number
  noVotes: number
  abstainVotes: number
  yesSharePct: number
  requiredThresholdPct: number
  approved: boolean
  date: string
  lang: 'ru' | 'lv'
}): string {
  if (data.lang === 'lv') {
    return `APTAUJAS PROTOKOLS

Adrese: ${data.buildingAddress}
Jautājums: ${data.campaignTitle}
Datums: ${data.date}

BALSOŠANAS REZULTĀTI:
Kopā nobalsojuši: ${data.totalVotes} īpašnieki
Par: ${data.yesVotes} (${data.yesSharePct.toFixed(1)}% no kopējās platības)
Pret: ${data.noVotes}
Atturējušies: ${data.abstainVotes}

Nepieciešamais kvorums: ${data.requiredThresholdPct}%
Rezultāts: ${data.approved ? 'LĒMUMS PIEŅEMTS ✓' : 'LĒMUMS NAV PIEŅEMTS ✗'}

Protokols sagatavots atbilstoši Dzīvokļa īpašuma likuma 20. panta 7.–8. punktam.
Elektroniskās balsošanas sistēma: ALTEKO
Katra balss ir apstiprināta ar Smart-ID vai eParaksts elektronisko parakstu.

Valdes priekšsēdētājs: _______________________
_______________________________________________`
  }

  return `ПРОТОКОЛ ОПРОСА СОБСТВЕННИКОВ

Адрес: ${data.buildingAddress}
Вопрос: ${data.campaignTitle}
Дата: ${data.date}

РЕЗУЛЬТАТЫ ГОЛОСОВАНИЯ:
Всего проголосовали: ${data.totalVotes} собственников
За: ${data.yesVotes} (${data.yesSharePct.toFixed(1)}% от общей площади)
Против: ${data.noVotes}
Воздержались: ${data.abstainVotes}

Необходимый кворум: ${data.requiredThresholdPct}%
Результат: ${data.approved ? 'РЕШЕНИЕ ПРИНЯТО ✓' : 'РЕШЕНИЕ НЕ ПРИНЯТО ✗'}

Протокол составлен в соответствии со ст. 20(7–8) Закона о собственности квартир (Dzīvokļa īpašuma likums).
Система электронного голосования: ALTEKO
Каждый голос подтверждён цифровой подписью Smart-ID или eParaksts.

Председатель правления: _______________________
_______________________________________________`
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { campaignId } = await req.json() as { campaignId: string }
  if (!campaignId) {
    return NextResponse.json({ error: 'campaignId required' }, { status: 400 })
  }

  const campaign = await prisma.votingCampaign.findUnique({
    where: { id: campaignId },
    include: {
      building: { select: { address: true } },
      votes: { select: { decision: true, ownershipShare: true } },
    },
  })

  if (!campaign) return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })

  const yesVotes = campaign.votes.filter((v) => v.decision === 'YES').length
  const noVotes = campaign.votes.filter((v) => v.decision === 'NO').length
  const abstainVotes = campaign.votes.filter((v) => v.decision === 'ABSTAIN').length
  const yesSharePct = Number(campaign.currentYesShare) * 100
  const approved = campaign.status === 'COMPLETED'

  const protocolData = {
    buildingAddress: campaign.building.address,
    campaignTitle: campaign.title,
    totalVotes: campaign.votes.length,
    yesVotes,
    noVotes,
    abstainVotes,
    yesSharePct,
    requiredThresholdPct: Number(campaign.requiredThreshold) * 100,
    approved,
    date: new Date().toLocaleDateString('ru-RU'),
  }

  const textRu = generateProtocolText({ ...protocolData, lang: 'ru' })
  const textLv = generateProtocolText({ ...protocolData, lang: 'lv' })

  const pdfRu = Buffer.from(textRu, 'utf-8')
  const pdfLv = Buffer.from(textLv, 'utf-8')

  const key = buildProtocolKey(campaignId)
  const keyLv = key.replace('protocol.pdf', 'protocol-lv.pdf')

  await Promise.all([
    uploadFile(key, pdfRu, 'text/plain'),
    uploadFile(keyLv, pdfLv, 'text/plain'),
    prisma.votingCampaign.update({ where: { id: campaignId }, data: { protocolKey: key } }),
  ])

  const [urlRu, urlLv] = await Promise.all([
    getPresignedDownloadUrl(key),
    getPresignedDownloadUrl(keyLv),
  ])

  return NextResponse.json({ protocolRu: urlRu, protocolLv: urlLv, approved })
}
