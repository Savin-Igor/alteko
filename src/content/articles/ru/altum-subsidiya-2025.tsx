import Link from 'next/link'

export const altumSubsidiyaMeta = {
  slug: 'subsidiya-altum-renovaciya-2025',
  title: 'Субсидия Altum на реновацию многоквартирного дома: полное руководство 2025',
  description:
    'Как получить до 50% субсидии от государства на реновацию советского дома в Латвии. Условия, документы, сроки и типичные ошибки.',
  publishedAt: '2025-04-15',
  readMinutes: 8,
  tags: ['реновация', 'субсидии'],
}

export function AltumSubsidiyaContent() {
  return (
    <div className="space-y-5 text-gray-700 leading-relaxed">
      <p className="text-lg text-gray-600">
        Государство готово покрыть почти половину стоимости реновации вашего дома — и большинство
        жильцов об этом не знают. Разбираем программу Altum по шагам.
      </p>

      {/* Key facts */}
      <div className="bg-primary-light border border-blue-200 rounded-xl p-5 space-y-2">
        <p className="text-sm font-semibold text-primary">Ключевые факты</p>
        <ul className="space-y-1 text-sm text-blue-900">
          <li>• Субсидия: <strong>стандартно 40%, до 50% стоимости</strong> для отдельных условий (безвозвратно) — источник: altum.lv</li>
          <li>• Программа действует с 2009 года</li>
          <li>• Завершили реновацию: 624 дома из ~23 500 нуждающихся (2,7%)</li>
          <li>• Требуется: ≥50% голосов собственников квартир</li>
        </ul>
      </div>

      <h2 className="text-xl font-bold text-gray-900 mt-6">Что такое Altum и причём здесь субсидия</h2>
      <p>
        <strong>Altum</strong> — государственный банк развития Латвии. Среди его задач —
        финансирование энергоэффективности жилых домов. Программа <em>«Daudzdzīvokļu māju renovācija»</em>
        работает с 2009 года: государство напрямую субсидирует до 50% затрат на реновацию
        (стандартно 40%, до 50% для отдельных условий — altum.lv).
        Это не кредит — деньги не нужно возвращать.
      </p>
      <p>
        Оставшиеся ~51% жильцы финансируют сами — либо из накоплений, либо через кредит от Altum
        под льготную ставку. В итоге срок окупаемости для жильцов — 8–12 лет, а экономия на
        отоплении начинается с первого месяца после завершения работ.
      </p>

      <h2 className="text-xl font-bold text-gray-900 mt-6">Кто может получить субсидию</h2>
      <p>Требования к дому:</p>
      <ul className="space-y-1 text-sm pl-4 list-disc">
        <li>Построен до 1993 года (преимущественно советский период)</li>
        <li>Не менее 3 квартир</li>
        <li>Зарегистрированная <em>biedrība</em> собственников или правление</li>
        <li>Готовность провести аудит и разработать техническое задание</li>
      </ul>
      <p className="mt-3">
        Фактически под эти условия подпадает подавляющее большинство советских панельных домов
        в Риге, Даугавпилсе, Резекне, Елгаве и других городах.
      </p>

      <h2 className="text-xl font-bold text-gray-900 mt-6">Почему только 2,7% домов прошли реновацию</h2>
      <p>
        За 15+ лет программы реновировано 624 дома из примерно 23 500 нуждающихся. Это 2,7%.
        При таком темпе программа займёт ещё 500 лет.
      </p>
      <p>Причины провала не финансовые — субсидия щедрая. Причины организационные:</p>
      <ul className="space-y-1 text-sm pl-4 list-disc">
        <li>Трудно собрать 50%+ голосов в письменном виде</li>
        <li>Сложно понять, какие документы нужны и в каком порядке</li>
        <li>Нет единой площадки для выбора подрядчика</li>
        <li>Управляющие компании не заинтересованы в помощи (они теряют доход от ремонтного фонда)</li>
      </ul>
      <p className="mt-3">
        ALTEKO создан именно для того, чтобы устранить эти барьеры — от первого счёта до
        подписанного договора с подрядчиком.
      </p>

      {/* Inline CTA */}
      <div className="bg-gray-50 rounded-xl p-5 my-6 text-center space-y-3">
        <p className="font-medium text-gray-900">Первый шаг — понять, на сколько переплачивает ваш дом</p>
        <p className="text-sm text-gray-500">Загрузите счёт — покажем отклонение от нормы за 30 секунд.</p>
        <Link href="/" className="btn-primary inline-block w-auto px-8">
          Проверить расходы →
        </Link>
      </div>

      <h2 className="text-xl font-bold text-gray-900 mt-6">Процесс шаг за шагом</h2>
      <div className="space-y-3">
        {[
          { n: 1, title: 'Аудит расходов', text: 'Понять отправную точку: сколько дом тратит сейчас и насколько это отличается от нормы.' },
          { n: 2, title: 'Техническое обследование', text: 'Профессиональный энергоаудит здания: теплопотери, состояние фасада, окон, крыши, инженерных систем.' },
          { n: 3, title: 'Разработка технического задания', text: 'Список работ, смета, сроки. Это основа для подачи заявки в Altum.' },
          { n: 4, title: 'Голосование собственников', text: 'Нужно ≥50% «за» от всех собственников (не от присутствующих). Smart-ID позволяет голосовать электронно — законно с 2022 г.' },
          { n: 5, title: 'Подача в Altum', text: 'Заявление о намерении + пакет документов. Altum рассматривает в течение 30 рабочих дней.' },
          { n: 6, title: 'Тендер и выбор подрядчика', text: 'Требуется опросить не менее 5 подрядчиков и получить не менее 2 независимых ценовых предложений. Altum проверяет соответствие смете. Источник: altum.lv, pakalpojumu-sniedzeju-atlase.' },
          { n: 7, title: 'Строительство и субсидия', text: 'Altum выплачивает субсидию после завершения работ и инспекции.' },
        ].map((step) => (
          <div key={step.n} className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
              {step.n}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{step.title}</p>
              <p className="text-sm text-gray-600">{step.text}</p>
            </div>
          </div>
        ))}
      </div>

      <h2 className="text-xl font-bold text-gray-900 mt-6">Сколько придётся заплатить жильцам</h2>
      <p>
        Типичная стоимость реновации 9-этажного дома серии 119 в Риге (5 400 м²) — €500 000–700 000.
        Altum покрывает ~€250 000–350 000. Остаток делится между квартирами пропорционально площади.
      </p>
      <div className="card space-y-2 my-4">
        <p className="text-sm font-semibold text-gray-700">Пример для квартиры 50 м²</p>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Полная стоимость реновации:</span>
          <span>€600 000</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Субсидия Altum (пример: 49%, стандартно 40%):</span>
          <span className="text-success">€294 000</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Доля жильцов:</span>
          <span>€306 000</span>
        </div>
        <div className="flex justify-between text-sm border-t pt-2">
          <span className="text-gray-500">На квартиру 50 м² (из 100 кв.):</span>
          <span className="font-semibold">~€1 530</span>
        </div>
      </div>
      <p className="text-sm text-gray-500">
        * Примерный расчёт. Реальные суммы зависят от состояния дома, объёма работ и итогов тендера.
        ALTEKO рассчитывает персональную цифру для каждого дома.
      </p>

      <h2 className="text-xl font-bold text-gray-900 mt-6">Источники</h2>
      <ul className="space-y-1 text-sm">
        <li>
          <a href="https://www.altum.lv/privatpersonam/majokla-energoefektivitate/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            altum.lv — программа реновации многоквартирных домов
          </a>
        </li>
        <li>
          <a href="https://www.fi-compass.eu/publication/case-studies/altum-multi-family-building-renovation-programme-latvia" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            fi-compass.eu — Altum case study (декабрь 2024)
          </a>
        </li>
        <li>
          <a href="https://likumi.lv/ta/id/60980" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            likumi.lv — Dzīvokļa īpašuma likums (закон о квартирной собственности)
          </a>
        </li>
      </ul>
    </div>
  )
}
