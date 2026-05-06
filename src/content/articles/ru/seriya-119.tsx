import Link from 'next/link'

export const seriya119Meta = {
  slug: 'seriya-119-latviya',
  title: 'Дома серии 119 в Латвии: почему жители переплачивают и что с этим делать',
  description:
    'Серия 119 — самый распространённый советский проект в Риге. Разбираемся, почему эти дома тратят так много на отопление и как это исправить.',
  publishedAt: '2025-04-29',
  readMinutes: 7,
  tags: ['отопление', 'реновация'],
}

export function Seriya119Content() {
  return (
    <div className="space-y-5 text-gray-700 leading-relaxed">
      <p className="text-lg text-gray-600">
        Если ваш дом построен в Риге между 1970 и 1985 годом и в нём 9 этажей — скорее всего,
        это серия 119. Самый массовый советский проект в Латвии, и один из самых энергозатратных.
      </p>

      <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-2">
        <p className="text-sm font-semibold text-gray-700">Серия 119 — коротко</p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-gray-500">Этажность</p>
            <p className="font-medium text-gray-900">5 и 9 этажей</p>
          </div>
          <div>
            <p className="text-gray-500">Годы постройки</p>
            <p className="font-medium text-gray-900">1965–1985</p>
          </div>
          <div>
            <p className="text-gray-500">Материал стен</p>
            <p className="font-medium text-gray-900">Крупнопанельный бетон</p>
          </div>
          <div>
            <p className="text-gray-500">Типичный энергокласс</p>
            <p className="font-medium text-warning">D–E</p>
          </div>
          <div>
            <p className="text-gray-500">Районы в Риге</p>
            <p className="font-medium text-gray-900">Пурвциемс, Иманта, Плявниеки, Зиепниеккалнс</p>
          </div>
          <div>
            <p className="text-gray-500">Количество квартир</p>
            <p className="font-medium text-gray-900">60–120 квартир</p>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-bold text-gray-900 mt-6">Почему серия 119 тратит так много тепла</h2>
      <p>
        Дома строились по советским нормам тепловой защиты — они были рассчитаны на дешёвое
        централизованное теплоснабжение, а не на эффективность. Основные причины теплопотерь:
      </p>
      <ul className="space-y-2 text-sm pl-4 list-disc">
        <li>
          <strong>Стыки панелей.</strong> Горизонтальные и вертикальные швы между панелями
          со временем теряют герметичность. Через них уходит значительная часть тепла.
        </li>
        <li>
          <strong>Торцевые стены.</strong> Они тоньше фасадных и хуже утеплены. Квартиры
          на торцах платят за отопление заметно больше среднего по дому.
        </li>
        <li>
          <strong>Крыша.</strong> Чердачное перекрытие в серии 119 не имеет эффективного
          утепления — тепло уходит через потолок последнего этажа.
        </li>
        <li>
          <strong>Окна.</strong> Исторически — деревянные одинарные или двойные рамы.
          Даже если жильцы заменили окна в квартире, подъезды и лестничные клетки
          остаются с оригинальными.
        </li>
        <li>
          <strong>Система отопления.</strong> Центральное регулирование без ИТП:
          при потеплении до +10°C подача тепла не снижается оперативно — дом «перетапливает».
        </li>
      </ul>

      <h2 className="text-xl font-bold text-gray-900 mt-6">Сколько тратит типичный дом серии 119</h2>
      <div className="card overflow-hidden p-0 my-4">
        <div className="grid grid-cols-2 bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-600">
          <span>Статья</span>
          <span>€/м²/мес. (в отопительный сезон)</span>
        </div>
        {[
          { label: 'Отопление (до реновации)', val: '1.40–2.20', bad: true },
          { label: 'Отопление (после реновации)', val: '0.65–0.95', bad: false },
          { label: 'Горячая вода', val: '2.80–3.80', bad: false },
          { label: 'Холодная вода + канализация', val: '1.20–1.60', bad: false },
          { label: 'Ремонтный фонд', val: '0.20–0.45', bad: false },
        ].map((row) => (
          <div
            key={row.label}
            className={`grid grid-cols-2 px-4 py-2.5 text-sm border-t border-gray-100 ${row.bad ? 'text-danger' : 'text-gray-700'}`}
          >
            <span>{row.label}</span>
            <span className={`font-medium ${row.bad ? 'text-danger' : 'text-gray-900'}`}>{row.val}</span>
          </div>
        ))}
      </div>

      {/* Inline CTA */}
      <div className="bg-gray-50 rounded-xl p-5 my-6 text-center space-y-3">
        <p className="font-medium text-gray-900">Узнайте точные цифры для вашего дома</p>
        <p className="text-sm text-gray-500">
          Загрузите счёт — сравним с нормой для вашей серии и квартала.
        </p>
        <Link href="/" className="btn-primary inline-block w-auto px-8">
          Проверить расходы →
        </Link>
      </div>

      <h2 className="text-xl font-bold text-gray-900 mt-6">Что даёт реновация серии 119</h2>
      <p>
        Реновация дома серии 119 — это комплекс работ: утепление фасада и кровли, замена окон
        в подъездах, установка ИТП, обновление инженерных систем. Результат через 5–7 лет
        реальной эксплуатации:
      </p>
      <div className="grid grid-cols-2 gap-3 my-4">
        {[
          { label: 'Экономия на отоплении', value: '−50–60%' },
          { label: 'Средняя экономия в месяц', value: '€100–150/квартира' },
          { label: 'Рост стоимости квартиры', value: '+10–11%' },
          { label: 'Субсидия Altum', value: 'до 50%' },
        ].map((item) => (
          <div key={item.label} className="card text-center">
            <p className="text-lg font-bold text-primary">{item.value}</p>
            <p className="text-xs text-gray-500 mt-0.5 leading-snug">{item.label}</p>
          </div>
        ))}
      </div>
      <p className="text-sm text-gray-500">
        Источники: Altum (fi-compass, ноябрь 2024), Latvijas Banka DP 3/2025.
        Реальные значения зависят от состояния конкретного дома.
      </p>

      <h2 className="text-xl font-bold text-gray-900 mt-6">Как начать для дома серии 119</h2>
      <p>
        Первый шаг — понять текущую ситуацию: насколько ваши расходы отличаются от нормы
        для таких же домов. Это даёт аргументы для разговора с соседями и управляющей компанией.
      </p>
      <p>
        Введите адрес на ALTEKO — покажем карточку дома с данными из реестра VZD,
        энергокласс и, если у вас есть PDF-счёт, сравним расходы с бенчмарком.
      </p>

      <h2 className="text-xl font-bold text-gray-900 mt-6">Источники</h2>
      <ul className="space-y-1 text-sm">
        <li>
          <a href="https://www.altum.lv" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            altum.lv — результаты реновированных домов
          </a>
        </li>
        <li>
          <a href="https://www.bank.lv/publikacijas-un-prese/publikacijas/diskusijas-materiali/raksts/7083" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            Latvijas Banka DP 3/2025 — влияние реновации на стоимость жилья
          </a>
        </li>
        <li>
          <a href="https://data.gov.lv/dati/lv/dataset/eku-energosertifikati" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            data.gov.lv — база энергосертификатов BVKB
          </a>
        </li>
      </ul>
    </div>
  )
}
