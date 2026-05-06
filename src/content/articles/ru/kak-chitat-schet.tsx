import Link from 'next/link'

export const kakChitatSchetMeta = {
  title: 'Как читать счёт за коммуналку: разбор всех строк',
  description:
    'Что скрыто в каждой строке коммунального счёта, как управляющая компания считает «норму», когда счёт точно завышен и как проверить свои расходы.',
}

export function KakChitatSchetContent() {
  return (
    <div className="space-y-5 text-gray-700 leading-relaxed">
      <p className="text-lg text-gray-600">
        Большинство жителей советских домов в Латвии получают счёт на 1–2 страницах, не вполне
        понимая, что в нём написано. Тем не менее именно в этих строках скрыта информация о том,
        сколько реально тратит ваш дом и где деньги уходят впустую.
      </p>

      <h2 className="text-xl font-bold text-gray-900 mt-6">Что вообще в счёте: карта статей</h2>
      <p>
        Типичный счёт от управляющей компании (Namsaimnieks, RNP, Latio или другой) содержит
        от семи до десяти строк. Вот что обычно в них:
      </p>
      <div className="card overflow-hidden p-0 my-4">
        <div className="grid grid-cols-3 bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-600">
          <span>Строка</span>
          <span>Что это</span>
          <span>Доля в счёте</span>
        </div>
        {[
          { name: 'Apkure / Отопление', desc: 'Теплоэнергия из сети', share: '40–55%', highlight: true },
          { name: 'Karstais ūdens / Горячая вода', desc: 'Горячее водоснабжение', share: '20–30%', highlight: false },
          { name: 'Aukstais ūdens / Холодная вода', desc: 'Холодная вода + канализация', share: '8–12%', highlight: false },
          { name: 'Apsaimniekošana / Управление', desc: 'Услуги управляющей компании', share: '5–10%', highlight: false },
          { name: 'Remonta fonds / Фонд ремонта', desc: 'Накопление на ремонт общих частей', share: '3–7%', highlight: false },
          { name: 'Lifts / Лифт', desc: 'Обслуживание лифта (если есть)', share: '2–5%', highlight: false },
          { name: 'Uzkopšana / Уборка', desc: 'Уборка подъездов и территории', share: '2–4%', highlight: false },
        ].map((row) => (
          <div
            key={row.name}
            className={`grid grid-cols-3 px-4 py-2.5 text-sm border-t border-gray-100 ${row.highlight ? 'bg-red-50' : ''}`}
          >
            <span className={`font-medium ${row.highlight ? 'text-danger' : 'text-gray-900'}`}>{row.name}</span>
            <span className="text-gray-600">{row.desc}</span>
            <span className={`font-medium ${row.highlight ? 'text-danger' : 'text-gray-700'}`}>{row.share}</span>
          </div>
        ))}
      </div>

      <h2 className="text-xl font-bold text-gray-900 mt-6">Отопление — самая большая и непрозрачная статья</h2>
      <p>
        Строка «Apkure» — обычно самая крупная в счёте и одновременно самая сложная для
        понимания. Управляющая компания распределяет между квартирами теплоэнергию, потреблённую
        всем домом по счётчику.
      </p>
      <p>
        Расчёт идёт пропорционально: по площади квартиры или по показаниям квартирных
        теплосчётчиков (если они установлены). Но суть одна — вы платите за
        <em> долю общедомового потребления</em>, а не только за «своё» тепло.
      </p>

      <h2 className="text-xl font-bold text-gray-900 mt-6">Как управляющая компания считает «норму»</h2>
      <p>
        Управляющая компания рассчитывает тариф за отопление по формуле: общее потребление дома
        (в кВт·ч или Гкал) × тариф поставщика тепла ÷ общая площадь квартир. Тариф поставщика
        тепла регулируется SPRK (Комиссия по общественным коммунальным услугам) и публикуется
        на их сайте.
      </p>
      <p>
        Проблема не в тарифе — он одинаков для всех. Проблема в <em>количестве</em> потреблённого
        тепла. Плохо утеплённый дом потребляет в 2–3 раза больше нормально утеплённого при тех
        же внешних условиях.
      </p>

      <h2 className="text-xl font-bold text-gray-900 mt-6">Красные флаги: когда счёт точно завышен</h2>
      <p>
        Несколько сигналов, что ваш дом тратит больше нормы:
      </p>
      <ul className="space-y-2 text-sm pl-4 list-disc">
        <li>
          <strong>Отопление {'>'} €1,50/м²/мес.</strong> в отопительный сезон для домов серии
          119 или 602 — выше среднего по сопоставимым домам в Риге.
        </li>
        <li>
          <strong>Нет ИТП (индивидуального теплового пункта).</strong> Без ИТП дом не
          регулирует подачу тепла по погоде: в мороз −10°C и в оттепель +5°C подаётся
          одинаковое количество — дом «перетапливает» при потеплении.
        </li>
        <li>
          <strong>Разрыв между квартирами {'>'} 30%.</strong> Если ваша квартира платит
          значительно больше соседней той же площади — скорее всего, вы в угловой или торцевой
          квартире, или данные счётчиков распределяются неравномерно.
        </li>
        <li>
          <strong>Фонд ремонта не используется.</strong> Если деньги накапливаются,
          но ремонты не проводятся — это вопрос к правлению бiedrībiы о состоянии и расходовании
          фонда.
        </li>
      </ul>

      <h2 className="text-xl font-bold text-gray-900 mt-6">Как сравнить: есть ли смысл волноваться</h2>
      <p>
        Чтобы понять, нормальны ли ваши расходы, нужен бенчмарк: сколько тратят похожие дома
        той же серии в том же районе. Именно это делает аудит счёта на ALTEKO: вы загружаете
        PDF-счёт, платформа извлекает данные и сравнивает с нормой для вашей серии и квартала.
      </p>

      <div className="bg-gray-50 rounded-xl p-5 my-6 text-center space-y-3">
        <p className="font-medium text-gray-900">Проверьте ваш счёт прямо сейчас</p>
        <p className="text-sm text-gray-500">
          Загрузите PDF-счёт — сравним с нормой для вашей серии и покажем, где переплата.
        </p>
        <Link href="/" className="btn-primary inline-block w-auto px-8">
          Загрузить счёт →
        </Link>
      </div>

      <h2 className="text-xl font-bold text-gray-900 mt-6">Источники</h2>
      <ul className="space-y-1 text-sm">
        <li>
          <a href="https://www.sprk.gov.lv" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            sprk.gov.lv — тарифы на теплоснабжение по регионам Латвии
          </a>
        </li>
        <li>
          <a href="https://www.altum.lv" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            altum.lv — нормы теплопотребления МКД
          </a>
        </li>
      </ul>
    </div>
  )
}
