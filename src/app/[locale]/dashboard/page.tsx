import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { PageHeader, EmptyState } from '@/components/ui'
import { BuildingSwitcher } from '@/components/dashboard/BuildingSwitcher'
import { NextBestActionBanner } from '@/components/dashboard/NextBestActionBanner'
import { ReadinessOverview } from '@/components/dashboard/ReadinessOverview'
import { FinancingMini } from '@/components/dashboard/FinancingMini'
import { OwnerListStatus } from '@/components/dashboard/OwnerListStatus'
import {
  getActiveBuilding,
  listUserBuildings,
} from '@/lib/dashboard/getActiveBuilding'

const BOARD_ROLES = new Set(['BOARD_MEMBER', 'ASSOCIATION_ADMIN', 'PLATFORM_ADMIN'])

interface Props {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ building?: string }>
}

export default async function DashboardPage({ params, searchParams }: Props) {
  const { locale } = await params
  const session = await auth()
  if (!session?.user?.id) redirect('/auth/signin')

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })
  if (!user || !BOARD_ROLES.has(user.role)) {
    redirect('/')
  }

  const t = await getTranslations('dashboard')
  const tValdes = await getTranslations('dashboard.valdes')
  const tTabs = await getTranslations('dashboard.tabs')

  const { building: requestedCadastralCode } = await searchParams

  const buildings = await listUserBuildings(session.user.id)
  const active = await getActiveBuilding(session.user.id, requestedCadastralCode)

  const buildingDetails = active
    ? await prisma.building.findUnique({
        where: { id: active.id },
        select: {
          id: true,
          ownerListUpdatedAt: true,
          ownerListCount: true,
          readinessScore: {
            select: {
              energyScore: true,
              fundingEligibilityScore: true,
              documentReadinessScore: true,
              ownerDecisionReadinessScore: true,
              financialFeasibilityScore: true,
              procurementTransparencyScore: true,
              legalConfidenceStatus: true,
              dataConfidenceStatus: true,
              nextBestAction: true,
              nextBestActionRu: true,
              computedAt: true,
            },
          },
          scenarios: {
            select: {
              scenarioType: true,
              windowStatus: true,
              estimatedSubsidyPercent: true,
              monthlyPaymentPerApartment: true,
            },
            orderBy: { scenarioType: 'asc' },
          },
        },
      })
    : null

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <PageHeader variant="admin" />

      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 flex gap-1">
          <Link
            href="/dashboard"
            className="px-4 py-3 text-sm font-medium text-primary border-b-2 border-primary -mb-px"
          >
            {tTabs('myBuildings')}
          </Link>
          <Link
            href="/dashboard/tenders"
            className="px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-800 border-b-2 border-transparent hover:border-gray-300 -mb-px transition-colors"
          >
            {tTabs('projects')}
          </Link>
          <Link
            href="/dashboard/voting"
            className="px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-800 border-b-2 border-transparent hover:border-gray-300 -mb-px transition-colors"
          >
            {tTabs('voting')}
          </Link>
        </div>
      </nav>

      <main className="flex-1 px-4 py-6 max-w-3xl mx-auto w-full space-y-6">
        {!active ? (
          <EmptyState
            title={t('main.emptyTitle')}
            description={t('main.emptyDescription')}
            action={{ label: t('main.emptyAction'), href: '/' }}
          />
        ) : (
          <>
            <header className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{tValdes('title')}</h1>
                <p className="text-sm text-gray-500 mt-1">
                  {[
                    active.series ? t('main.seriesPrefix', { series: active.series }) : null,
                    active.energyClass ? t('main.classLabel', { class: active.energyClass }) : null,
                  ]
                    .filter(Boolean)
                    .join(' · ') || active.address}
                </p>
              </div>
              <BuildingSwitcher buildings={buildings} active={active} />
            </header>

            <NextBestActionBanner
              cadastralCode={active.cadastralCode}
              locale={locale}
              nextBestAction={
                buildingDetails?.readinessScore?.nextBestAction ?? null
              }
              nextBestActionRu={
                buildingDetails?.readinessScore?.nextBestActionRu ?? null
              }
            />

            <ReadinessOverview
              cadastralCode={active.cadastralCode}
              locale={locale}
              data={
                buildingDetails?.readinessScore
                  ? {
                      energyScore:
                        buildingDetails.readinessScore.energyScore,
                      fundingEligibilityScore:
                        buildingDetails.readinessScore.fundingEligibilityScore,
                      documentReadinessScore:
                        buildingDetails.readinessScore.documentReadinessScore,
                      ownerDecisionReadinessScore:
                        buildingDetails.readinessScore
                          .ownerDecisionReadinessScore,
                      financialFeasibilityScore:
                        buildingDetails.readinessScore
                          .financialFeasibilityScore,
                      procurementTransparencyScore:
                        buildingDetails.readinessScore
                          .procurementTransparencyScore,
                      legalConfidenceStatus:
                        buildingDetails.readinessScore.legalConfidenceStatus,
                      dataConfidenceStatus:
                        buildingDetails.readinessScore.dataConfidenceStatus,
                      computedAt: buildingDetails.readinessScore.computedAt,
                    }
                  : null
              }
            />

            <DashboardSectionPlaceholder title={tValdes('sections.documents')} />
            <DashboardSectionPlaceholder title={tValdes('sections.campaigns')} />

            <FinancingMini
              locale={locale}
              scenarios={
                buildingDetails?.scenarios.map((s) => ({
                  scenarioType: s.scenarioType,
                  windowStatus: s.windowStatus as 'OPEN' | 'EXPECTED' | 'CLOSED' | 'UNKNOWN',
                  estimatedSubsidyPercent:
                    s.estimatedSubsidyPercent !== null
                      ? Number(s.estimatedSubsidyPercent)
                      : null,
                  monthlyPaymentPerApartment:
                    s.monthlyPaymentPerApartment !== null
                      ? Number(s.monthlyPaymentPerApartment)
                      : null,
                })) ?? []
              }
            />

            <OwnerListStatus
              buildingId={active.id}
              locale={locale}
              ownerListUpdatedAt={
                buildingDetails?.ownerListUpdatedAt ?? null
              }
              ownerListCount={buildingDetails?.ownerListCount ?? null}
            />
          </>
        )}
      </main>
    </div>
  )
}

function DashboardSectionPlaceholder({ title }: { title: string }) {
  return (
    <section className="card">
      <h2 className="font-medium text-gray-900">{title}</h2>
      <p className="text-sm text-gray-400 mt-2">…</p>
    </section>
  )
}
