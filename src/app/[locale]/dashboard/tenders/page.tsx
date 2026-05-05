import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { PageHeader, Badge, EmptyState } from '@/components/ui'

const STATUS_BADGE: Record<string, 'pending' | 'active' | 'done' | 'cancelled'> = {
  INITIATED: 'pending',
  VOTING: 'active',
  CONTRACTED: 'active',
  IN_PROGRESS: 'active',
  COMPLETED: 'done',
}

type ProjectStatus = 'INITIATED' | 'VOTING' | 'CONTRACTED' | 'IN_PROGRESS' | 'COMPLETED'

export default async function TendersPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/auth/signin')

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })
  if (user?.role !== 'ASSOCIATION_ADMIN' && user?.role !== 'PLATFORM_ADMIN') {
    redirect('/')
  }

  const t = await getTranslations('dashboard.tenders')
  const tTabs = await getTranslations('dashboard.tabs')
  const tStatus = await getTranslations('dashboard.tenders.status')

  const projects = await prisma.renovationProject.findMany({
    where: {
      building: { reports: { some: { uploadedBy: session.user.id } } },
    },
    include: {
      building: { select: { address: true, cadastralCode: true } },
      contractor: { select: { companyName: true, rating: true, luroftVerified: true } },
      campaign: { select: { title: true, currentYesShare: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  function statusLabel(status: string): string {
    try {
      return tStatus(status as ProjectStatus)
    } catch {
      return status
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <PageHeader variant="admin" />

      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 flex gap-1">
          <Link href="/dashboard" className="px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-800 border-b-2 border-transparent hover:border-gray-300 -mb-px transition-colors">
            {tTabs('myBuildings')}
          </Link>
          <Link href="/dashboard/tenders" className="px-4 py-3 text-sm font-medium text-primary border-b-2 border-primary -mb-px">
            {tTabs('projects')}
          </Link>
          <Link href="/dashboard/voting" className="px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-800 border-b-2 border-transparent hover:border-gray-300 -mb-px transition-colors">
            {tTabs('voting')}
          </Link>
        </div>
      </nav>

      <main className="flex-1 px-4 py-6 max-w-2xl mx-auto w-full space-y-5">
        <h1 className="text-xl font-semibold text-gray-900">{t('heading')}</h1>

        {projects.length === 0 ? (
          <EmptyState
            title={t('emptyTitle')}
            description={t('emptyDescription')}
            action={{ label: t('emptyAction'), href: '/dashboard/voting' }}
          />
        ) : (
          <div className="space-y-4">
            {projects.map((project) => (
              <div key={project.id} className="card space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="font-medium text-gray-900 truncate">{project.building.address}</h2>
                    {project.campaign && (
                      <p className="text-xs text-gray-400 mt-0.5 truncate">{project.campaign.title}</p>
                    )}
                  </div>
                  <Badge
                    status={STATUS_BADGE[project.status] ?? 'pending'}
                    label={statusLabel(project.status)}
                  />
                </div>

                {project.contractor ? (
                  <div className="bg-gray-50 rounded-lg px-4 py-3 space-y-1">
                    <p className="text-sm font-medium text-gray-900">{project.contractor.companyName}</p>
                    <div className="flex gap-3 text-xs text-gray-500">
                      {project.contractor.luroftVerified && (
                        <span className="flex items-center gap-1 text-success">
                          <span className="status-dot-success" />
                          {t('lursoftVerified')}
                        </span>
                      )}
                      {project.contractor.rating && (
                        <span>★ {Number(project.contractor.rating).toFixed(1)}</span>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">{t('noContractor')}</p>
                )}

                {project.contractValue && (
                  <div className="space-y-1.5 text-sm border-t border-gray-100 pt-3">
                    <div className="flex justify-between">
                      <span className="text-gray-500">{t('contractValue')}</span>
                      <span className="font-medium text-gray-900">
                        €{Number(project.contractValue).toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}

                {project.campaign && (
                  <div className="text-xs text-gray-400">
                    {t('campaignYesShare', { percent: Math.round(Number(project.campaign.currentYesShare) * 100) })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
