'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import { AddressSearch } from '@/components/AddressSearch'
import { SiteHeader } from '@/components/ui/SiteHeader'

// ─── FAQ data ────────────────────────────────────────────────────────────────

const FAQ = [
  {
    q: 'Откуда вы знаете, сколько «должно быть»?',
    a: 'Мы собираем данные из загруженных счетов сотен домов Латвии и строим бенчмарки по серии здания, году постройки, площади и кварталу. Чем больше данных — тем точнее норма. Вы видите отклонение именно вашего дома, а не абстрактное среднее.',
  },
  {
    q: 'Зачем загружать PDF? Нельзя ввести данные руками?',
    a: 'GPT-4o читает любой PDF за 10–15 секунд — быстрее, чем заполнить форму вручную. Файл не хранится после анализа и не передаётся третьим лицам.',
  },
  {
    q: 'Мой дом не найден в базе — что делать?',
    a: 'Загрузите счёт всё равно. Мы сравним ваши данные с усреднёнными показателями по кварталу и серии. Карточка дома пополнится позже, когда VZD обновит реестр.',
  },
  {
    q: 'Что будет с моим email?',
    a: 'Отчёт и уведомления по вашему дому. Вы сами выбираете, что получать — при вводе email можно выбрать интересующие темы.',
  },
  {
    q: 'Это платно?',
    a: 'Аудит расходов и базовый отчёт — бесплатно. Персональный расчёт реновации — бесплатно. Платное: сопровождение сделки с подрядчиком (комиссия 1–2% от суммы договора).',
  },
  {
    q: 'Я председатель правления. Что мне это даёт?',
    a: 'Загружайте счета по всем домам в портфеле — получите динамику расходов, аномалии, сравнение с нормой. Инструмент для переговоров с управляющей компанией и аргументация для собственников при голосовании за реновацию.',
  },
]

// ─── Sample result ────────────────────────────────────────────────────────────

const SAMPLE_ROWS = [
  { label: 'Отопление', value: '€1.82/м²', norm: '€1.09/м²', dev: '+67%', variant: 'danger' as const },
  { label: 'Горячая вода', value: '€3.41/м²', norm: '€2.89/м²', dev: '+18%', variant: 'warning' as const },
  { label: 'Уборка', value: '€0.33/м²', norm: '€0.23/м²', dev: '+43%', variant: 'danger' as const },
  { label: 'Управление', value: '€0.19/м²', norm: '€0.20/м²', dev: '−5%', variant: 'success' as const },
]

const DOT: Record<string, string> = {
  danger: 'status-dot-danger',
  warning: 'status-dot-warning',
  success: 'status-dot-success',
}
const TEXT_COLOR: Record<string, string> = {
  danger: 'text-danger',
  warning: 'text-warning',
  success: 'text-success',
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function HomePage() {
  const router = useRouter()
  const [resolving, setResolving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  async function handleAddressSelect(suggestion: {
    id: string; address: string; lat: number; lon: number
  }) {
    setResolving(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        lat: String(suggestion.lat),
        lon: String(suggestion.lon),
        address: suggestion.address,
      })
      const res = await fetch(`/api/address/resolve?${params}`)
      const building = await res.json()

      if (building.found && building.cadastralCode) {
        router.push(`/building/${building.cadastralCode}`)
      } else if (building.cadastralCode) {
        router.push(`/building/${building.cadastralCode}?address=${encodeURIComponent(suggestion.address)}`)
      } else {
        setError('Дом не найден в базе. Попробуйте другой адрес.')
      }
    } catch {
      setError('Ошибка соединения. Проверьте интернет и попробуйте снова.')
    } finally {
      setResolving(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      {/* ── 1. HERO ──────────────────────────────────────────────────────────── */}
      <section
        id="hero"
        className="px-4 pt-14 pb-16 bg-white flex flex-col items-center"
      >
        <div className="w-full max-w-lg text-center">
          <h1 className="text-3xl font-bold text-gray-900 leading-tight mb-3">
            Счёт за отопление кажется большим?<br />
            <span className="text-primary">Сравним с нормой за 30 секунд.</span>
          </h1>
          <p className="text-gray-500 mb-8 leading-relaxed">
            Загрузите PDF-счёт — ИИ сравнит расходы вашего дома
            с нормой по серии, площади и кварталу.
            Бесплатно.
          </p>

          <div className="space-y-3 text-left">
            <AddressSearch onSelect={handleAddressSelect} />

            {error && (
              <p className="text-sm text-danger bg-danger-light border border-red-200 rounded-lg px-4 py-3">
                {error}
              </p>
            )}

            <button
              disabled={resolving}
              className="btn-primary"
              onClick={() =>
                document.querySelector<HTMLInputElement>('input[aria-label="Адрес дома"]')?.focus()
              }
            >
              {resolving ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Ищем дом...
                </span>
              ) : (
                'Найти свой дом'
              )}
            </button>
          </div>

          <div className="flex items-center justify-center gap-4 mt-5 text-xs text-gray-400">
            <span>Бесплатно</span>
            <span>·</span>
            <span>624 дома уже проверили</span>
          </div>
        </div>
      </section>

      {/* ── 2. PROBLEM ───────────────────────────────────────────────────────── */}
      <section className="px-4 py-14 bg-gray-50 border-y border-gray-100">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
            7 из 10 советских домов переплачивают
          </h2>
          <p className="text-gray-500 text-center mb-8 leading-relaxed">
            Управляющие компании выставляют счета по своим нормативам —
            жильцы не сравнивают. Мы сравниваем.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { value: '+23%', label: 'средняя переплата за отопление', color: 'text-danger' },
              { value: '+15%', label: 'средняя переплата за горячую воду', color: 'text-warning' },
              { value: '+47%', label: 'максимальная переплата за уборку', color: 'text-warning' },
              { value: '~€840', label: 'переплата в год с одного дома', color: 'text-danger' },
            ].map((stat) => (
              <div key={stat.label} className="card text-center py-4 space-y-1">
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-gray-500 leading-snug">{stat.label}</p>
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-400 text-center mt-4">
            По данным ALTEKO · советские панельные дома Латвии · 2024–2025
          </p>
        </div>
      </section>

      {/* ── 3. HOW IT WORKS ──────────────────────────────────────────────────── */}
      <section className="px-4 py-14 bg-white">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-xl font-bold text-gray-900 mb-8 text-center">
            Как это работает
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                n: '1',
                title: 'Найдите свой дом',
                desc: 'Введите адрес — покажем карточку здания из реестра VZD: серия, год, энергокласс.',
              },
              {
                n: '2',
                title: 'Загрузите счёт',
                desc: 'PDF от вашей управляющей компании. GPT-4o прочитает любой формат — Namsaimnieks, RNP, Latio.',
              },
              {
                n: '3',
                title: 'Получите отчёт',
                desc: 'Покажем, по каким статьям и на сколько процентов ваш дом выше нормы — в деньгах за год.',
              },
            ].map((step) => (
              <div key={step.n} className="card space-y-3">
                <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                  {step.n}
                </div>
                <h3 className="font-semibold text-gray-900">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <button
              className="btn-primary w-auto px-10 inline-flex items-center justify-center"
              onClick={() => document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Начать проверку
            </button>
            <p className="text-xs text-gray-400 mt-2">Результат — за 30 секунд</p>
          </div>
        </div>
      </section>

      {/* ── 4. SAMPLE RESULT ─────────────────────────────────────────────────── */}
      <section className="px-4 py-14 bg-gray-50 border-y border-gray-100">
        <div className="max-w-md mx-auto">
          <h2 className="text-xl font-bold text-gray-900 mb-1 text-center">
            Пример отчёта
          </h2>
          <p className="text-xs text-gray-400 text-center mb-6">
            Реальный анонимный пример · Серия 119 · Пурвциемс · 5 400 м²
          </p>

          <div className="card p-0 overflow-hidden">
            <div className="divide-y divide-gray-100">
              {SAMPLE_ROWS.map((row) => (
                <div key={row.label} className="px-5 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className={DOT[row.variant]} aria-hidden="true" />
                    <span className="text-sm text-gray-800">{row.label}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-gray-900">{row.value}</span>
                    <span className="text-xs text-gray-400 ml-1.5">норма {row.norm}</span>
                    <span className={`text-xs font-semibold ml-2 ${TEXT_COLOR[row.variant]}`}>
                      {row.dev}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-5 py-4 bg-danger-light border-t border-red-100 flex items-center justify-between">
              <span className="text-sm font-medium text-danger">Переплата в год</span>
              <span className="text-metric font-bold text-danger">~€3 900</span>
            </div>
          </div>

          <p className="text-xs text-gray-400 text-center mt-3">
            Это ~€78 с каждой квартиры в год
          </p>
        </div>
      </section>

      {/* ── 5. RENOVATION ────────────────────────────────────────────────────── */}
      <section id="renovation" className="px-4 py-14 bg-white">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              После аудита — реновация. Государство платит до 49%.
            </h2>
            <p className="text-gray-500 leading-relaxed">
              Узнайте, сколько субсидирует Altum и что вернёт реновация именно вашему дому.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {[
              { v: 'до 49%', l: 'субсидия Altum', color: 'text-primary' },
              { v: '€140/мес.', l: 'средняя экономия', color: 'text-success' },
              { v: '+10–11%', l: 'рост стоимости квартиры', color: 'text-success' },
              { v: '8–12 лет', l: 'срок окупаемости', color: 'text-gray-700' },
            ].map((s) => (
              <div key={s.l} className="card text-center py-4">
                <p className={`text-xl font-bold ${s.color}`}>{s.v}</p>
                <p className="text-xs text-gray-500 mt-1 leading-snug">{s.l}</p>
              </div>
            ))}
          </div>

          <div className="text-center space-y-2">
            <p className="text-sm text-gray-500">
              Расчёт реновации доступен после аудита расходов — нужна отправная точка.
            </p>
            <Link href="/renovation" className="btn-secondary w-auto inline-block px-8">
              Узнать о реновации подробнее →
            </Link>
          </div>

          <p className="text-xs text-gray-400 text-center mt-3">
            Источники: Altum, fi-compass 2024, Latvijas Banka DP 3/2025
          </p>
        </div>
      </section>

      {/* ── 6. FOR BOARDS ────────────────────────────────────────────────────── */}
      <section className="px-4 py-14 bg-primary-light border-y border-blue-100">
        <div className="max-w-2xl mx-auto md:flex items-center gap-8">
          <div className="flex-1 mb-6 md:mb-0">
            <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">
              Для правлений biedrības
            </p>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              Управляйте несколькими домами в одном дашборде
            </h2>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="status-dot-success mt-1.5" />
                Динамика расходов по всем домам портфеля
              </li>
              <li className="flex items-start gap-2">
                <span className="status-dot-success mt-1.5" />
                Аномалии и сравнение с рынком — аргументы для переговоров
              </li>
              <li className="flex items-start gap-2">
                <span className="status-dot-success mt-1.5" />
                Электронное голосование через Smart-ID — собрать ≥50% без очного собрания
              </li>
              <li className="flex items-start gap-2">
                <span className="status-dot-success mt-1.5" />
                Тендер среди верифицированных подрядчиков
              </li>
            </ul>
          </div>
          <div className="flex-shrink-0">
            <Link href="/dashboard" className="btn-primary w-auto inline-block px-8">
              Открыть дашборд →
            </Link>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Требуется регистрация
            </p>
          </div>
        </div>
      </section>

      {/* ── 7. TRUST ─────────────────────────────────────────────────────────── */}
      <section className="px-4 py-14 bg-white">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">Откуда данные</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              {
                name: 'VZD (Valsts zemes dienests)',
                desc: 'Кадастровый реестр: тип здания, площадь, год постройки.',
                href: 'https://www.vzd.gov.lv',
              },
              {
                name: 'BVKB (Būvniecības valsts kontroles birojs)',
                desc: 'Энергосертификаты: класс и потребление тепла. Данные обновляются ежедневно.',
                href: 'https://data.gov.lv',
              },
              {
                name: 'SPRK',
                desc: 'Тарифы и нормативы коммунальных услуг Латвии.',
                href: 'https://www.sprk.gov.lv',
              },
              {
                name: 'Altum',
                desc: 'Официальные условия субсидий на реновацию.',
                href: 'https://www.altum.lv',
              },
            ].map((src) => (
              <div key={src.name} className="card flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <div>
                  <a
                    href={src.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-gray-900 hover:text-primary transition-colors"
                  >
                    {src.name}
                  </a>
                  <p className="text-sm text-gray-500 mt-0.5">{src.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 card bg-gray-50">
            <p className="text-sm text-gray-600">
              <strong>Конфиденциальность:</strong> PDF удаляется после анализа. Данные о домах публикуются только в агрегированном виде —
              без привязки к конкретным жильцам.
            </p>
          </div>
        </div>
      </section>

      {/* ── 8. FAQ ───────────────────────────────────────────────────────────── */}
      <section className="px-4 py-14 bg-gray-50 border-t border-gray-100">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Частые вопросы
          </h2>
          <div className="card divide-y divide-gray-100 p-0 overflow-hidden">
            {FAQ.map((item, i) => (
              <div key={i}>
                <button
                  type="button"
                  className="w-full text-left px-5 py-4 flex items-start justify-between gap-4 min-h-[56px] hover:bg-gray-50 transition-colors"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  aria-expanded={openFaq === i}
                >
                  <span className="text-sm font-medium text-gray-900 leading-snug">
                    {item.q}
                  </span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    className={`flex-shrink-0 mt-0.5 text-gray-400 transition-transform ${openFaq === i ? 'rotate-180' : ''}`}
                    aria-hidden="true"
                  >
                    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 9. BLOG PREVIEW ──────────────────────────────────────────────────── */}
      <section className="px-4 py-14 bg-white border-t border-gray-100">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Из блога</h2>
            <Link href="/blog" className="text-sm text-primary font-medium hover:underline">
              Все статьи →
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                href: '/blog/subsidiya-altum-renovaciya-2025',
                title: 'Субсидия Altum: полное руководство 2025',
                tag: 'реновация',
                mins: 8,
              },
              {
                href: '/blog/norma-rashoda-tepla-latviya',
                title: 'Норма расхода тепла: сколько должно быть',
                tag: 'отопление',
                mins: 6,
              },
              {
                href: '/blog/seriya-119-latviya',
                title: 'Дома серии 119: почему переплачивают',
                tag: 'отопление',
                mins: 7,
              },
            ].map((post) => (
              <Link
                key={post.href}
                href={post.href}
                className="card hover:border-gray-300 transition-colors group space-y-2"
              >
                <span className="text-xs px-2.5 py-1 bg-primary-light text-primary rounded-full font-medium inline-block">
                  {post.tag}
                </span>
                <p className="text-sm font-medium text-gray-900 group-hover:text-primary transition-colors leading-snug">
                  {post.title}
                </p>
                <p className="text-xs text-gray-400">{post.mins} мин.</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────────── */}
      <footer className="px-4 py-8 border-t border-gray-100 bg-white">
        <div className="max-w-2xl mx-auto space-y-4 text-sm text-gray-500">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-gray-900">ALTEKO</span>
            <nav className="flex gap-4">
              <Link href="/" className="hover:text-gray-800">Аудит</Link>
              <Link href="/renovation" className="hover:text-gray-800">Реновация</Link>
              <Link href="/blog" className="hover:text-gray-800">Блог</Link>
            </nav>
          </div>
          <div className="flex gap-4 flex-wrap text-xs">
            <Link href="/contractors/register" className="hover:text-gray-700">Для подрядчиков</Link>
            <a href="#" className="hover:text-gray-700">Политика конфиденциальности</a>
            <a href="#" className="hover:text-gray-700">Условия использования</a>
            <a href="mailto:info@alteko.lv" className="hover:text-gray-700">info@alteko.lv</a>
          </div>
          <p className="text-xs text-gray-400">© 2025 ALTEKO</p>
        </div>
      </footer>
    </div>
  )
}
