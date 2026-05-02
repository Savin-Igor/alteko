import Link from 'next/link'
import type { Metadata } from 'next'
import { SiteHeader } from '@/components/ui/SiteHeader'

export const metadata: Metadata = {
  title: 'Реновация многоквартирного дома — ALTEKO',
  description: 'Субсидия Altum до 49%, ИИ-расчёт экономии, электронное голосование жителей и маркетплейс подрядчиков.',
}

const STEPS = [
  {
    n: '01',
    title: 'Аудит расходов',
    desc: 'Загрузите счёт — покажем, где и на сколько ваш дом переплачивает. Это точка отсчёта.',
    href: '/',
    cta: 'Начать аудит',
  },
  {
    n: '02',
    title: 'Расчёт реновации',
    desc: 'ИИ рассчитает экономию на отоплении и долю субсидии Altum для вашего конкретного дома.',
    href: null,
    cta: null,
  },
  {
    n: '03',
    title: 'Голосование жителей',
    desc: 'Электронное голосование через Smart-ID — законно с 2022 г. Собрать ≥50% без очного собрания.',
    href: null,
    cta: null,
  },
  {
    n: '04',
    title: 'Маркетплейс подрядчиков',
    desc: 'Тендер среди верифицированных компаний. Вы выбираете — мы сопровождаем сделку.',
    href: null,
    cta: null,
  },
]

export default function RenovationMarketingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      {/* Hero */}
      <section className="px-4 py-16 bg-white">
        <div className="max-w-2xl mx-auto text-center space-y-4">
          <h1 className="text-3xl font-bold text-gray-900 leading-snug">
            Реновация с субсидией Altum.<br />
            <span className="text-primary">Мы ведём весь процесс.</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-lg mx-auto">
            От первого счёта до подписанного договора с подрядчиком.
            Государство покрывает до 49% стоимости.
          </p>
          <Link href="/" className="btn-primary inline-block w-auto px-8 mt-4">
            Начать с аудита расходов →
          </Link>
          <p className="text-xs text-gray-400">
            Реновация доступна только после аудита — нужно понять отправную точку
          </p>
        </div>
      </section>

      {/* Numbers */}
      <section className="px-4 py-12 bg-gray-50 border-y border-gray-100">
        <div className="max-w-2xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {[
            { value: 'до 49%', label: 'субсидирует Altum' },
            { value: '€140/мес.', label: 'средняя экономия (серия 119)' },
            { value: '+10–11%', label: 'рост стоимости квартиры' },
            { value: '8–12 лет', label: 'средний срок окупаемости' },
          ].map((stat) => (
            <div key={stat.label} className="card py-4">
              <p className="text-xl font-bold text-primary">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-1 leading-snug">{stat.label}</p>
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-gray-400 mt-4">
          Источники: Altum, Latvijas Banka DP 3/2025, fi-compass 2024
        </p>
      </section>

      {/* Process steps */}
      <section className="px-4 py-12 bg-white">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-xl font-bold text-gray-900 mb-8 text-center">
            Как это работает
          </h2>
          <div className="space-y-4">
            {STEPS.map((step) => (
              <div key={step.n} className="card flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary-light text-primary flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {step.n}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{step.title}</h3>
                  <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">{step.desc}</p>
                  {step.href && step.cta && (
                    <Link href={step.href} className="mt-2 inline-block text-sm text-primary font-medium hover:underline">
                      {step.cta} →
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Altum explanation */}
      <section className="px-4 py-12 bg-gray-50 border-t border-gray-100">
        <div className="max-w-2xl mx-auto space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Что такое субсидия Altum</h2>
          <p className="text-gray-600 leading-relaxed">
            Altum — государственный банк развития Латвии. С 2009 года реализует программу субсидирования
            реновации многоквартирных домов. Государство покрывает до 49–50% стоимости работ —
            это не кредит, это безвозвратная субсидия.
          </p>
          <p className="text-gray-600 leading-relaxed">
            За 20 лет программу прошли только 624 дома из ~23 500 нуждающихся (2,7%).
            Главная причина низкого охвата — сложность процесса: голосование жителей,
            документы, выбор подрядчика. ALTEKO автоматизирует каждый шаг.
          </p>
          <Link
            href="/blog/subsidiya-altum-renovaciya-2025"
            className="text-sm text-primary font-medium hover:underline"
          >
            Полный гайд по субсидии Altum →
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-16 bg-white border-t border-gray-100">
        <div className="max-w-md mx-auto text-center space-y-4">
          <h2 className="text-xl font-bold text-gray-900">
            Начните с аудита расходов
          </h2>
          <p className="text-gray-500">
            Прежде чем считать реновацию, нужно понять, где сейчас теряется деньги.
          </p>
          <Link href="/" className="btn-primary block">
            Найти свой дом и загрузить счёт →
          </Link>
          <p className="text-xs text-gray-400">Бесплатно · 30 секунд</p>
        </div>
      </section>

      <footer className="px-4 py-6 border-t border-gray-100 text-center text-xs text-gray-400">
        <Link href="/" className="hover:text-gray-600">ALTEKO</Link>
        {' · '}
        <Link href="/blog" className="hover:text-gray-600">Блог</Link>
        {' · '}
        <Link href="/contractors/register" className="hover:text-gray-600">Для подрядчиков</Link>
      </footer>
    </div>
  )
}
