import Link from 'next/link'

export const normaTeplaМeta = {
  slug: 'norma-rashoda-tepla-latviya',
  title: 'Норма расхода тепла в многоквартирном доме Латвии: сколько должно быть',
  description:
    'Как понять, нормально ли ваш дом тратит на отопление. Бенчмарки по серии, кварталу и площади — и что делать, если дом переплачивает.',
  publishedAt: '2025-04-22',
  readMinutes: 6,
  tags: ['отопление', 'расходы'],
}

export function NormaTeplaContent() {
  return (
    <div className="space-y-5 text-gray-700 leading-relaxed">
      <p className="text-lg text-gray-600">
        Счёт за отопление пришёл — и непонятно, это много или нормально? Разбираемся, как
        оценить расходы вашего дома и что считается переплатой.
      </p>

      <div className="bg-warning-light border border-orange-200 rounded-xl p-5 space-y-2">
        <p className="text-sm font-semibold text-warning">Типичная картина в Латвии</p>
        <ul className="space-y-1 text-sm text-orange-900">
          <li>• Средняя переплата за отопление в советских домах: <strong>+23% к норме</strong> (по данным платформы ALTEKO)</li>
          <li>• Дома класса D–E платят за тепло в 1,5–2 раза больше, чем реновированные</li>
          <li>• За горячую воду переплата: <strong>+15% в среднем</strong> (по данным платформы ALTEKO)</li>
          <li>• За уборку — до <strong>+47%</strong> выше медианы (по данным платформы ALTEKO)</li>
        </ul>
      </div>

      <h2 className="text-xl font-bold text-gray-900 mt-6">Как считается «норма»</h2>
      <p>
        Единой официальной нормы потребления тепла на м² в Латвии нет — SPRK регулирует тарифы
        поставщиков, но не контролирует эффективность зданий. Это пространство без надзора:
        управляющая компания может выставлять любую сумму, и жильцы не знают, нормально ли это.
      </p>
      <p>
        Реальный бенчмарк формируется из сравнения: сколько тратит ваш дом против похожих домов
        той же серии, в том же квартале, схожей площади. Именно это делает ALTEKO —
        строит медиану по сотням загруженных счетов и показывает ваше отклонение.
      </p>

      <h2 className="text-xl font-bold text-gray-900 mt-6">Типичные расходы по классу энергоэффективности</h2>
      <div className="card overflow-hidden p-0 my-4">
        <div className="grid grid-cols-3 bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-600">
          <span>Класс</span>
          <span>Тип здания</span>
          <span>Отопление, €/м²/мес.</span>
        </div>
        {[
          { cls: 'A–B', type: 'После реновации', val: '0.60–0.90', highlight: true },
          { cls: 'C', type: 'Частично утеплённый', val: '0.90–1.20', highlight: false },
          { cls: 'D', type: 'Советский, типовой', val: '1.20–1.80', highlight: false },
          { cls: 'E–G', type: 'Ветхий, без утепления', val: '1.80–2.50+', highlight: false },
        ].map((row) => (
          <div
            key={row.cls}
            className={`grid grid-cols-3 px-4 py-3 text-sm border-t border-gray-100 ${row.highlight ? 'bg-success-light' : ''}`}
          >
            <span className={`font-medium ${row.highlight ? 'text-success' : 'text-gray-900'}`}>{row.cls}</span>
            <span className="text-gray-600">{row.type}</span>
            <span className={`font-medium ${row.highlight ? 'text-success' : 'text-gray-900'}`}>{row.val}</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-500">
        * Внутренние бенчмарки по данным платформы ALTEKO. Зависят от района, года постройки и системы теплоснабжения.
      </p>

      <h2 className="text-xl font-bold text-gray-900 mt-6">Почему одинаковые дома платят по-разному</h2>
      <p>Два дома серии 119, построенных в одном году, могут отличаться по расходам в 1,5 раза. Причины:</p>
      <ul className="space-y-1 text-sm pl-4 list-disc">
        <li>
          <strong>Система отопления.</strong> ИТП (индивидуальный тепловой пункт) экономит 15–25%
          по сравнению с централизованным регулированием (отраслевая оценка).
        </li>
        <li>
          <strong>Состояние фасада.</strong> Трещины, отсутствие утепления на торцах, щели
          у балконов — дополнительные теплопотери.
        </li>
        <li>
          <strong>Управляющая компания.</strong> Одна вовремя регулирует подачу тепла при потеплении,
          другая — нет. Разница до 20%.
        </li>
        <li>
          <strong>Горизонт сравнения.</strong> Управляющие компании сравнивают ваш дом с «планом» —
          который сами и составили. Реального рыночного бенчмарка у них нет.
        </li>
      </ul>

      {/* Inline CTA */}
      <div className="bg-gray-50 rounded-xl p-5 my-6 text-center space-y-3">
        <p className="font-medium text-gray-900">Проверьте ваш дом прямо сейчас</p>
        <p className="text-sm text-gray-500">
          Загрузите счёт — сравним с нормой по серии и кварталу.
        </p>
        <Link href="/" className="btn-primary inline-block w-auto px-8">
          Найти свой дом →
        </Link>
      </div>

      <h2 className="text-xl font-bold text-gray-900 mt-6">Признаки того, что вы переплачиваете</h2>
      <p>Проверьте по своему счёту:</p>
      <ul className="space-y-2 text-sm pl-4 list-disc">
        <li>
          Плата за отопление выше €1.50/м² в месяц в январе — это уже выше медианы для класса D.
        </li>
        <li>
          Разница между общедомовым счётчиком воды и суммой квартирных счётчиков превышает 15% —
          возможна утечка или ошибка в расчётах.
        </li>
        <li>
          Строка «администрирование» больше €0.25/м²/мес. — это заметно выше медианы по рынку.
        </li>
        <li>
          Строка «уборка» больше €0.35/м²/мес. — стоит запросить детализацию у управляющей компании.
        </li>
      </ul>

      <h2 className="text-xl font-bold text-gray-900 mt-6">Что делать, если дом переплачивает</h2>
      <p>Три уровня реакции — в зависимости от масштаба проблемы:</p>
      <div className="space-y-3 my-4">
        {[
          {
            level: 'Быстрый',
            action: 'Запросить детализацию у управляющей компании',
            detail: 'По любой строке имеете право получить расшифровку. Иногда ошибки исправляются без судов.',
          },
          {
            level: 'Средний',
            action: 'Потребовать установку ИТП или балансировки системы',
            detail: 'Правление дома может вынести на голосование модернизацию системы отопления без полной реновации.',
          },
          {
            level: 'Полный',
            action: 'Запустить реновацию с субсидией Altum',
            detail: 'Устраняет проблему на 30+ лет. Государство покрывает до 50% затрат (стандартно 40%, до 50% для отдельных условий — altum.lv).',
          },
        ].map((item) => (
          <div key={item.level} className="card flex items-start gap-3">
            <span className="text-xs font-bold text-primary bg-primary-light px-2 py-1 rounded-full flex-shrink-0">
              {item.level}
            </span>
            <div>
              <p className="text-sm font-semibold text-gray-900">{item.action}</p>
              <p className="text-sm text-gray-500 mt-0.5">{item.detail}</p>
            </div>
          </div>
        ))}
      </div>

      <h2 className="text-xl font-bold text-gray-900 mt-6">Источники</h2>
      <ul className="space-y-1 text-sm">
        <li>
          <a href="https://www.sprk.gov.lv" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            sprk.gov.lv — Sabiedrisko pakalpojumu regulēšanas komisija (тарифы ЖКХ)
          </a>
        </li>
        <li>
          <a href="https://www.altum.lv" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            altum.lv — программа энергоэффективности
          </a>
        </li>
        <li>
          <a href="https://data.gov.lv" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            data.gov.lv — открытые данные BVKB (энергосертификаты зданий)
          </a>
        </li>
      </ul>
    </div>
  )
}
