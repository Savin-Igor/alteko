import Link from 'next/link'

export const seriya602Meta = {
  title: 'Серия 602: почему торцевые квартиры — самые холодные',
  description:
    'Серия 602 — дома с керамзитобетонными стенами, которые промерзают. Разбираемся, почему торцевые квартиры платят за отопление больше всех и как это решить.',
}

export function Seriya602Content() {
  return (
    <div className="space-y-5 text-gray-700 leading-relaxed">
      <p className="text-lg text-gray-600">
        Если вы живёте в торцевой квартире дома серии 602, вы знаете это ощущение: стена со
        двора холодная даже летом, зимой иней на внутренней поверхности, счёт за отопление
        заметно выше, чем у соседей с центральными квартирами. Это не проблема конкретного
        дома — это конструктивная особенность серии.
      </p>

      <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-2 my-4">
        <p className="text-sm font-semibold text-gray-700">Серия 602 — коротко</p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-gray-500">Этажность</p>
            <p className="font-medium text-gray-900">9 этажей</p>
          </div>
          <div>
            <p className="text-gray-500">Годы постройки</p>
            <p className="font-medium text-gray-900">Середина 1970-х — начало 1980-х</p>
          </div>
          <div>
            <p className="text-gray-500">Материал стен</p>
            <p className="font-medium text-gray-900">Керамзитобетонные панели</p>
          </div>
          <div>
            <p className="text-gray-500">Типичный энергокласс</p>
            <p className="font-medium text-warning">E–F</p>
          </div>
          <div>
            <p className="text-gray-500">Районы в Риге</p>
            <p className="font-medium text-gray-900">Пурвциемс, Межциемс, Иманта, Плявниеки</p>
          </div>
          <div>
            <p className="text-gray-500">Сменила</p>
            <p className="font-medium text-gray-900">Заменена серией 119</p>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-bold text-gray-900 mt-6">Почему именно торцевые квартиры</h2>
      <p>
        В советском панельном доме каждая квартира со всех сторон граничит с другими квартирами
        или с отапливаемыми помещениями — лестничными клетками, коридорами. Это естественная
        тепловая защита. Но торцевые квартиры — крайние по длине дома — имеют одну наружную стену
        намного больше, чем у средних квартир: и фасадную, и торцевую.
      </p>
      <p>
        Торцевая стена серии 602 — сплошная наружная поверхность без соседних квартир за ней.
        Зимой она принимает удар мороза напрямую. При толщине керамзитобетонной панели 300 мм
        без современного утепления это значительный источник теплопотерь.
      </p>

      <h2 className="text-xl font-bold text-gray-900 mt-6">Главный дефект: панели промерзают</h2>
      <p>
        Особенность серии 602 — микротрещины в керамзитобетонных панелях, которые появляются
        в первые 20–30 лет эксплуатации. Через эти трещины внутрь проникает влага, которая
        при замерзании расширяет их дальше. Результат — нарушение герметичности стыков
        и промерзание не только торцевых, но иногда и фасадных стен.
      </p>
      <p>
        В отличие от серии 119, где главная проблема — теряющие герметичность стыки панелей,
        в серии 602 стареет сама панельная структура.
      </p>

      <h2 className="text-xl font-bold text-gray-900 mt-6">Что значит «холоднее» в деньгах</h2>
      <p>
        Жители торцевых квартир в домах серии 602 нередко отмечают, что их счёт за отопление
        существенно выше, чем у соседей в средних квартирах на том же этаже. Это следствие
        большей площади наружных стен и худшей теплоизоляции торца.
      </p>
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-2 my-4">
        <p className="text-sm font-semibold text-gray-700">Ориентировочное сравнение</p>
        <p className="text-xs text-gray-400 mb-2">Серия 602 без реновации, отопительный сезон</p>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between py-1.5 border-b border-gray-100">
            <span>Средняя квартира 50 м²</span>
            <span className="font-medium text-gray-900">€65–90/мес.</span>
          </div>
          <div className="flex justify-between py-1.5">
            <span className="text-danger">Торцевая квартира 50 м²</span>
            <span className="font-medium text-danger">€80–120/мес.</span>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Расчёт ориентировочный. Реальные значения зависят от состояния конкретного дома и тарифа.
        </p>
      </div>

      <h2 className="text-xl font-bold text-gray-900 mt-6">Что делают жильцы — и почему это не помогает</h2>
      <p>
        Типичная реакция на холодную торцевую стену — дополнительный обогреватель в квартире
        или попытка утеплить стену изнутри пенопластом или минеральной ватой. Оба варианта
        дают ограниченный результат:
      </p>
      <ul className="space-y-2 text-sm pl-4 list-disc">
        <li>
          Электрический обогреватель компенсирует теплопотери, но стоит дорого — в 2–3 раза
          дороже централизованного теплоснабжения за то же количество тепла.
        </li>
        <li>
          Внутреннее утепление переносит «точку росы» — место конденсации влаги — глубже
          в стену, что нередко усиливает намокание конструкции и появление плесени.
        </li>
      </ul>
      <p>
        Системное решение — только наружное утепление в рамках полной реновации дома. Только
        так торцевая стена получает достаточный теплозащитный слой снаружи.
      </p>

      <h2 className="text-xl font-bold text-gray-900 mt-6">Реновация серии 602</h2>
      <p>
        Дома серии 602 входят в приоритетные объекты программ реновации как наиболее
        энергозатратные. При полной реновации — утепление фасада и торцов, кровли, замена
        окон, ИТП — теплопотребление снижается в среднем ~62%, как и в других советских сериях
        (fi-compass, ALTUM, ноябрь 2024).
      </p>
      <p>
        Для следующей программы финансирования (SCF 2026–2032, ожидается запуск в 2027 году)
        дома серии 602 с энергоклассом E–F будут иметь высокий приоритет.
      </p>

      <div className="bg-gray-50 rounded-xl p-5 my-6 text-center space-y-3">
        <p className="font-medium text-gray-900">Проверьте готовность вашего дома серии 602</p>
        <p className="text-sm text-gray-500">
          Введите адрес — покажем энергокласс, типичные проблемы серии и следующий шаг.
        </p>
        <Link href="/" className="btn-primary inline-block w-auto px-8">
          Проверить дом →
        </Link>
      </div>

      <h2 className="text-xl font-bold text-gray-900 mt-6">Источники</h2>
      <ul className="space-y-1 text-sm">
        <li>
          <a href="https://www.altum.lv" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            altum.lv — программа реновации МКД
          </a>
        </li>
        <li>
          <a href="https://data.gov.lv/dati/lv/dataset/eku-energosertifikati" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            data.gov.lv — база энергосертификатов BVKB
          </a>
        </li>
        <li>
          <a href="https://likumi.lv/ta/id/322436" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            likumi.lv — MK Nr.222: нормы тепловой характеристики зданий
          </a>
        </li>
      </ul>
    </div>
  )
}
