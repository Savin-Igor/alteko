import Link from 'next/link'

export const zhiznDoPosleRenovaciiMeta = {
  title: 'Жизнь до и после реновации: реальные цифры по латвийским домам',
  description:
    'Сколько реально экономят жители после реновации многоквартирного дома в Латвии: данные по 624 домам, рост стоимости квартир и что говорит реальная практика.',
}

export function ZhiznDoPosleRenovaciiContent() {
  return (
    <div className="space-y-5 text-gray-700 leading-relaxed">
      <p className="text-lg text-gray-600">
        «После реновации будет дешевле» — это слышали все. Но насколько дешевле? Стоит ли
        10–15 лет выплат? Вырастет ли цена квартиры? Ответы есть — латвийская программа
        реновации работает с 2014 года, и накоплено достаточно данных.
      </p>

      <h2 className="text-xl font-bold text-gray-900 mt-6">Что меняется после реновации</h2>
      <p>
        Реновация многоквартирного дома — это комплексная модернизация: утепление фасада
        и кровли, замена окон в подъездах, установка индивидуального теплового пункта (ИТП),
        обновление инженерных систем. Результат работает на четырёх уровнях:
      </p>
      <div className="grid grid-cols-2 gap-3 my-4">
        {[
          { label: 'Экономия на отоплении', value: '−50–60%' },
          { label: 'Экономия в месяц на квартиру', value: '€100–150' },
          { label: 'Рост стоимости квартиры', value: '+10–11%' },
          { label: 'Снижение выброса CO₂', value: '−24 000 т/год*' },
        ].map((item) => (
          <div key={item.label} className="card text-center">
            <p className="text-lg font-bold text-primary">{item.value}</p>
            <p className="text-xs text-gray-500 mt-0.5 leading-snug">{item.label}</p>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-400">
        * Совокупно по 624 домам программы ERDF 2014–2020. Источник: fi-compass.eu, ALTUM, декабрь 2024.
      </p>

      <h2 className="text-xl font-bold text-gray-900 mt-6">Данные по 624 домам: −60% на отоплении</h2>
      <p>
        За период европейского финансирования 2014–2020 в Латвии было реновировано 624 многоквартирных
        дома при поддержке ALTUM и ERDF. Средний результат по портфелю:
      </p>
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-2 my-4">
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div>
            <p className="text-gray-500 text-xs">До реновации</p>
            <p className="font-bold text-xl text-danger">128</p>
            <p className="text-xs text-gray-500">kWh/м²/год</p>
          </div>
          <div className="flex items-center justify-center text-2xl text-gray-300">→</div>
          <div>
            <p className="text-gray-500 text-xs">После реновации</p>
            <p className="font-bold text-xl text-success">54</p>
            <p className="text-xs text-gray-500">kWh/м²/год</p>
          </div>
        </div>
        <p className="text-sm text-center text-gray-500 pt-2 border-t border-gray-100">
          Среднее снижение теплопотребления: <strong className="text-gray-900">−58%</strong>
        </p>
      </div>
      <p className="text-sm text-gray-500">
        Источник: fi-compass.eu, интервью с ALTUM, декабрь 2024. Значения усредненные по портфелю;
        реальный результат зависит от конкретного дома и объёма работ.
      </p>

      <h2 className="text-xl font-bold text-gray-900 mt-6">Что это значит в деньгах</h2>
      <p>
        Типичный дом серии 119 в Риге до реновации тратит на отопление €1,40–2,20/м²/мес.
        в отопительный сезон. При площади квартиры 50 м² это €70–110 в месяц только за тепло.
      </p>
      <div className="card overflow-hidden p-0 my-4">
        <div className="grid grid-cols-3 bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-600">
          <span>Квартира</span>
          <span>До реновации</span>
          <span>После реновации</span>
        </div>
        {[
          { size: '40 м²', before: '€56–88/мес.', after: '€26–40/мес.' },
          { size: '50 м²', before: '€70–110/мес.', after: '€33–50/мес.' },
          { size: '65 м²', before: '€91–143/мес.', after: '€43–65/мес.' },
        ].map((row) => (
          <div
            key={row.size}
            className="grid grid-cols-3 px-4 py-2.5 text-sm border-t border-gray-100"
          >
            <span className="font-medium text-gray-900">{row.size}</span>
            <span className="text-danger">{row.before}</span>
            <span className="text-success">{row.after}</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-400">
        Расчёт ориентировочный на основе средних данных по портфелю. Тариф на тепло варьируется
        по поставщику и году.
      </p>

      <h2 className="text-xl font-bold text-gray-900 mt-6">Рост стоимости квартиры: +10–11%</h2>
      <p>
        Исследование Latvijas Banka (Дискуссионный материал DP 3/2025) показало: квартиры
        в реновированных домах стоят в среднем на 10–11% дороже аналогичных в домах без реновации.
      </p>
      <p>
        Для квартиры стоимостью €80 000 это прирост €8 000–8 800 к рыночной цене. При сроке
        выплат по реновации 15–20 лет это существенный аргумент в пользу участия.
      </p>
      <p className="text-sm text-gray-500">
        Источник: Latvijas Banka DP 3/2025 — «Влияние реновации на стоимость жилья в Латвии».
      </p>

      <h2 className="text-xl font-bold text-gray-900 mt-6">Что неудобно: до года стройки без переезда</h2>
      <p>
        Реальный минус, о котором говорят жители: реновация длится от нескольких месяцев до года.
        Строительные леса, шум, пыль, ограниченный доступ к балконам и окнам. Переехать на это
        время практически невозможно — компенсаций нет, альтернативного жилья не предоставляется.
      </p>
      <p>
        Это реальная сложность, которую нужно учитывать при принятии решения. Однако большинство
        жителей реновированных домов в опросах оценивают решение положительно именно через 1–2 года
        после окончания работ.
      </p>

      <h2 className="text-xl font-bold text-gray-900 mt-6">Как ALTEKO помогает подготовиться</h2>
      <p>
        Главный барьер к реновации — не финансирование, а организация. Нужно собрать 51%+
        собственников, получить отчёт о техническом состоянии, выбрать подрядчика, оформить
        документы для ALTUM. Каждый шаг занимает месяцы.
      </p>
      <p>
        ALTEKO помогает подготовиться заранее: собирает публичные данные по дому, рассчитывает
        индекс готовности, показывает следующий шаг — чтобы когда откроется финансирование,
        ваш дом был готов первым.
      </p>

      <div className="bg-gray-50 rounded-xl p-5 my-6 text-center space-y-3">
        <p className="font-medium text-gray-900">Проверьте готовность вашего дома</p>
        <p className="text-sm text-gray-500">
          Введите адрес — покажем текущее состояние и что нужно сделать для реновации.
        </p>
        <Link href="/" className="btn-primary inline-block w-auto px-8">
          Проверить дом →
        </Link>
      </div>

      <h2 className="text-xl font-bold text-gray-900 mt-6">Источники</h2>
      <ul className="space-y-1 text-sm">
        <li>
          <a href="https://www.fi-compass.eu/publication/case-studies/latvia-altum-energy-efficiency-apartment-buildings" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            fi-compass.eu — ALTUM: Energy Efficiency for Apartment Buildings (декабрь 2024)
          </a>
        </li>
        <li>
          <a href="https://www.bank.lv/publikacijas-un-prese/publikacijas/diskusijas-materiali/raksts/7083" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            Latvijas Banka DP 3/2025 — влияние реновации на стоимость жилья
          </a>
        </li>
        <li>
          <a href="https://www.altum.lv" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            altum.lv — результаты программы реновации 2014–2020
          </a>
        </li>
      </ul>
    </div>
  )
}
