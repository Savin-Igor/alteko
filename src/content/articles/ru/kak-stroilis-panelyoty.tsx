import Link from 'next/link'

export const kakStroislisPanelyotyMeta = {
  title: 'Как строились советские панельки за 12 дней: технология, которая изменила города',
  description:
    'Разбираемся, как советские строители возводили 9-этажные дома за считанные недели, почему применялась сборная технология и что это значит для сегодняшних жителей.',
}

export function KakStroislisPanelyotyContent() {
  return (
    <div className="space-y-5 text-gray-700 leading-relaxed">
      <p className="text-lg text-gray-600">
        В 1960-х советский панельный дом можно было построить за 12 рабочих дней при трёхсменной
        работе (по архивным данным того периода). Это не легенда — это была реальная технологическая
        система. Понимать её полезно не только из любопытства: конструктивные решения 60-летней
        давности напрямую влияют на ваши счета за отопление сегодня.
      </p>

      <h2 className="text-xl font-bold text-gray-900 mt-6">Жилищный кризис СССР: зачем нужна была скорость</h2>
      <p>
        После Второй мировой войны советские города столкнулись с острой нехваткой жилья. Люди
        ютились в бараках, подвалах и коммунальных квартирах — по несколько семей в одной комнате.
        В 1954 году Хрущёв публично осудил «архитектурные излишества» сталинской эпохи: «Строить
        много дороже, чем строить быстро». Задача была сформулирована предельно ясно: каждой советской
        семье — отдельная квартира.
      </p>
      <p>
        В Латвии массовое строительство развернулось с 1955 по 1990 год. Сегодня около 70% зданий в
        стране построены именно в этот период. 51% многоквартирных домов — советские панельные серии.
      </p>

      <h2 className="text-xl font-bold text-gray-900 mt-6">Технология «бетонный пазл»: завод — кран — квартира</h2>
      <p>
        Сборная панельная технология решала проблему скорости радикально: дом не строился на месте,
        он <em>собирался</em> из готовых элементов.
      </p>
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-3 my-4">
        <p className="text-sm font-semibold text-gray-700">Как это работало</p>
        <ol className="space-y-2 text-sm pl-4 list-decimal">
          <li>
            <strong>Завод.</strong> Рядом со стройплощадкой или на постоянной основе работал
            завод по производству крупных железобетонных панелей — стен, перекрытий, лестничных
            маршей. Всё делалось по одним формам.
          </li>
          <li>
            <strong>Кран.</strong> На площадке башенный кран последовательно устанавливал панели
            на подготовленный фундамент. Швы заливались раствором.
          </li>
          <li>
            <strong>Отделка.</strong> Параллельно с монтажом верхних этажей на нижних уже шла
            отделка — это позволяло вести несколько работ одновременно.
          </li>
        </ol>
      </div>
      <p>
        Ключевой принцип: все размеры стандартизированы. Одни и те же формы, одни и те же узлы,
        один и тот же монтажный порядок — в Риге, Москве или Алматы. Именно поэтому советские
        дома так похожи по всему бывшему СССР.
      </p>

      <h2 className="text-xl font-bold text-gray-900 mt-6">Что строили в Латвии</h2>
      <p>
        В Латвии наиболее массово строились серии 103, 119 и 602. Серия 119 стала самой
        распространённой в Риге — она строилась с 1965 по 1985 год и занимает целые кварталы
        Пурвциемса, Имантас, Плявниеки и Зиепниеккалнс.
      </p>
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 my-4">
        <p className="text-sm font-semibold text-gray-700 mb-3">Основные серии в Латвии</p>
        <div className="space-y-2 text-sm">
          {[
            { series: 'Серия 103', years: '1960–1970', floors: '5', material: 'Крупноблочный' },
            { series: 'Серия 119', years: '1965–1985', floors: '5 и 9', material: 'Панельный бетон' },
            { series: 'Серия 602', years: '1975–1985', floors: '9', material: 'Керамзитобетон' },
          ].map((row) => (
            <div key={row.series} className="flex justify-between items-center py-1.5 border-b border-gray-100 last:border-0">
              <span className="font-medium text-gray-900">{row.series}</span>
              <span className="text-gray-500">{row.years} · {row.floors} эт. · {row.material}</span>
            </div>
          ))}
        </div>
      </div>

      <h2 className="text-xl font-bold text-gray-900 mt-6">Почему это важно сегодня</h2>
      <p>
        Технологические решения 1960-х годов были оптимизированы под скорость и стоимость
        строительства, а не под энергоэффективность. Стыки панелей — главное слабое место:
        за 50–60 лет эксплуатации они теряют герметичность, и через них уходит значительная
        часть тепла.
      </p>
      <p>
        Торцевые стены тоньше фасадных. Чердачное перекрытие не имеет современного утепления.
        Система отопления не предполагала индивидуального регулирования. Всё это заложено
        в конструктив — и не исправляется заменой окон в отдельной квартире.
      </p>

      <div className="bg-gray-50 rounded-xl p-5 my-6 text-center space-y-3">
        <p className="font-medium text-gray-900">Как обстоит дело с вашим домом?</p>
        <p className="text-sm text-gray-500">
          Введите адрес — покажем серию, энергокласс и типичные теплопотери.
        </p>
        <Link href="/" className="btn-primary inline-block w-auto px-8">
          Проверить дом →
        </Link>
      </div>

      <h2 className="text-xl font-bold text-gray-900 mt-6">Источники</h2>
      <ul className="space-y-1 text-sm">
        <li>
          <a href="https://csp.gov.lv" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            Centrālā statistikas pārvalde — жилищный фонд Латвии
          </a>
        </li>
        <li>
          <a href="https://www.em.gov.lv/lv/pieejams-majoklis" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            Министерство экономики Латвии — «Pieejams mājoklis 2023–2027»
          </a>
        </li>
        <li>
          <a href="https://www.altum.lv" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            altum.lv — портфель реновированных домов 2014–2020
          </a>
        </li>
      </ul>
    </div>
  )
}
