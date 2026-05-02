import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

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

  const projects = await prisma.renovationProject.findMany({
    where: {
      building: {
        reports: { some: { uploadedBy: session.user.id } },
      },
    },
    include: {
      building: { select: { address: true } },
      contractor: { select: { companyName: true, rating: true, luroftVerified: true } },
      campaign: { select: { title: true, currentYesShare: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const STATUS_LABELS: Record<string, string> = {
    INITIATED: 'Создан',
    VOTING: 'Голосование',
    CONTRACTED: 'Контракт подписан',
    IN_PROGRESS: 'В работе',
    COMPLETED: 'Завершён',
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white flex items-center justify-between px-4 py-4 border-b border-gray-100">
        <Link href="/dashboard" className="text-xl font-bold text-gray-900">ALTEKO</Link>
        <Link href="/dashboard" className="text-sm text-gray-500">← Дашборд</Link>
      </header>

      <main className="flex-1 px-4 py-6 max-w-2xl mx-auto w-full space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Проекты реновации</h1>
        </div>

        {projects.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center space-y-3">
            <p className="text-gray-500 text-sm">
              Проекты появятся после того, как голосование наберёт ≥50%.
            </p>
            <Link href="/dashboard" className="text-primary text-sm underline">
              К дашборду →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {projects.map((project) => (
              <div key={project.id} className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="font-medium text-gray-900">{project.building.address}</h2>
                    {project.campaign && (
                      <p className="text-xs text-gray-400 mt-0.5">{project.campaign.title}</p>
                    )}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    project.status === 'CONTRACTED' ? 'bg-green-100 text-success' :
                    project.status === 'COMPLETED' ? 'bg-gray-100 text-gray-500' :
                    'bg-blue-50 text-primary'
                  }`}>
                    {STATUS_LABELS[project.status] ?? project.status}
                  </span>
                </div>

                {project.contractor ? (
                  <div className="bg-gray-50 rounded-lg p-3 space-y-1">
                    <p className="text-sm font-medium">{project.contractor.companyName}</p>
                    <div className="flex gap-3 text-xs text-gray-500">
                      {project.contractor.luroftVerified && (
                        <span className="text-success">✓ Lursoft</span>
                      )}
                      {project.contractor.rating && (
                        <span>★ {Number(project.contractor.rating).toFixed(1)}</span>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">Подрядчик ещё не выбран</p>
                )}

                {project.contractValue && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Сумма контракта:</span>
                    <span className="font-medium">€{Number(project.contractValue).toLocaleString()}</span>
                  </div>
                )}
                {project.commissionAmount && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Комиссия ALTEKO:</span>
                    <span className="text-gray-600">€{Number(project.commissionAmount).toLocaleString()}</span>
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
