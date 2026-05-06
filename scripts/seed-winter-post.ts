/**
 * Create blog post: "Зимнее утро в панельке" with hero image.
 *
 * Run:
 *   npx tsx scripts/seed-winter-post.ts
 */

import fs from 'fs'
import path from 'path'
import { getPayload } from 'payload'
import config from '../payload.config'

// ─── Lexical helpers ──────────────────────────────────────────────────────────

const t = (text: string, bold = false) => ({
  type: 'text', text, format: bold ? 1 : 0,
  detail: 0, mode: 'normal', style: '', version: 1,
})

const p = (...children: ReturnType<typeof t>[]) => ({
  type: 'paragraph', children,
  direction: 'ltr', format: '', indent: 0, version: 1,
})

const h2 = (text: string) => ({
  type: 'heading', tag: 'h2',
  children: [t(text)],
  direction: 'ltr', format: '', indent: 0, version: 1,
})

const li = (value: number, ...children: ReturnType<typeof t>[]) => ({
  type: 'listitem', value, children,
  direction: 'ltr', format: '', indent: 0, version: 1,
})

const ul = (...items: ReturnType<typeof li>[]) => ({
  type: 'list', listType: 'bullet', tag: 'ul', start: 1,
  children: items,
  direction: 'ltr', format: '', indent: 0, version: 1,
})

const root = (...children: object[]) => ({
  root: {
    type: 'root', children,
    direction: 'ltr', format: '', indent: 0, version: 1,
  },
})

// ─── Content ──────────────────────────────────────────────────────────────────

const contentRu = root(
  p(t('Январь. Шесть утра. За окном —15°C. Именно в такие часы панельный дом теряет тепло с максимальной скоростью — и именно тогда формируется большая часть вашего зимнего счёта.')),

  h2('Почему утром холоднее всего'),
  p(t('За ночь несущие панели здания отдают накопленное тепло наружу. Тепловая масса стены охлаждается. К шести утра — между окончанием ночного затишья и началом активной работы отопления — в квартирах на торцах и верхних этажах температура может упасть на 2–4°C ниже нормы.')),
  p(t('Это не поломка системы отопления. Это физика: теплопотери прямо пропорциональны разнице температур внутри и снаружи (ΔT). При ΔT = 35°C стена серии 119 без утепления пропускает в 3–4 раза больше тепла, чем весной при ΔT = 10°C.')),

  h2('Что это значит на практике'),
  ul(
    li(1, t('Январский расход тепла существенно выше, чем в переходные месяцы: разница температур (ΔT) между улицей и квартирой в 3–4 раза больше, чем весной')),
    li(2, t('Торцевые квартиры платят за январь '), t('+20–30%', true), t(' по сравнению с центральными на том же этаже (по данным платформы ALTEKO)')),
    li(3, t('Дом без ИТП: переплата за январь '), t('до €0.40/м²', true), t(' против домов с погодным регулированием (по данным платформы ALTEKO)')),
  ),

  h2('Где уходит тепло'),
  p(t('В типовом советском доме серии 119 или 602 зима вскрывает три слабых места:')),
  ul(
    li(1, t('Стыки панелей'), t(' — со временем теряют герметичность и становятся существенным источником теплопотерь. Промерзают первыми.')),
    li(2, t('Торцевые стены'), t(' — единственная стена с улицей на трёх сторонах квартиры, без теплозащиты со стороны соседних квартир. Значительно холоднее фасадных стен.')),
    li(3, t('Чердачное перекрытие'), t(' — если не утеплено, верхние этажи теряют через крышу значительную часть тепла.')),
  ),

  h2('Как читать свой счёт за январь'),
  p(t('Сравните январский счёт с апрельским и ноябрьским. Ориентировочное соотношение для Латвии (по данным платформы ALTEKO):')),
  ul(
    li(1, t('Январь / апрель ≈ 3,5–4,5×'), t(' — если больше 5×, дом теряет тепло непропорционально')),
    li(2, t('Январь / ноябрь ≈ 1,5–2×'), t(' — если больше 2,5×, вероятна проблема с регулировкой')),
  ),
  p(t('Загрузите счёт в ALTEKO — платформа сравнит ваш дом с медианой по серии и покажет отклонение.')),
)

const contentLv = root(
  p(t('Janvāris. Seši no rīta. Ārā ir -15°C. Tieši šajās stundās paneļmāja zaudē siltumu ar maksimālo ātrumu — un tieši tad veidojas lielākā daļa jūsu ziemas rēķina.')),

  h2('Kāpēc no rīta ir viskaltākais'),
  p(t('Nakts laikā mājas nesošās plāksnes atdod uzkrāto siltumu uz āru. Sienas termiskā masa atdziest. Līdz sešiem no rīta — starp nakts miera beigām un apkures aktīvo darbību — gala un augšējo stāvu dzīvokļos temperatūra var noslīdēt par 2–4°C zem normas.')),

  h2('Ko tas nozīmē praksē'),
  ul(
    li(1, t('Janvāra siltuma patēriņš ir ievērojami augstāks nekā pārejas mēnešos: temperatūru starpība (ΔT) starp ielu un dzīvokli ir 3–4 reizes lielāka nekā pavasarī')),
    li(2, t('Gala dzīvokļi janvārī maksā '), t('+20–30%', true), t(' vairāk nekā centrālie dzīvokļi tajā pašā stāvā (pēc ALTEKO platformas datiem)')),
    li(3, t('Māja bez ITP: pārmaksa janvārī '), t('līdz €0,40/m²', true), t(' salīdzinājumā ar mājām ar laika apstākļu regulēšanu (pēc ALTEKO platformas datiem)')),
  ),

  h2('Kur siltums aiziet'),
  ul(
    li(1, t('Plākšņu savienojumu spraugas'), t(' — laika gaitā zaudē hermētiskumu un kļūst par būtisku siltuma zudumu avotu. Sasalst pirmie.')),
    li(2, t('Gala sienas'), t(' — vienīgā siena ar ielu trīs dzīvokļa pusēs, bez siltuma aizsardzības no kaimiņu dzīvokļu puses. Ievērojami aukstākas par fasādes sienām.')),
    li(3, t('Bēniņu pārsegums'), t(' — ja nav siltināts, augšējie stāvi caur jumtu zaudē ievērojamu siltuma daudzumu.')),
  ),
)

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const payload = await getPayload({ config })

  // Check slug doesn't exist
  const existing = await payload.find({
    collection: 'blog-posts',
    where: { slug: { equals: 'zimnyaya-panelka-teplopoteri' } },
    limit: 1,
  })
  if (existing.docs.length > 0) {
    console.log('Post already exists, skipping.')
    process.exit(0)
  }

  // Upload hero image
  const imagePath = path.join(process.cwd(), 'public/articles/soviet-winter-morning.png')
  const imageBuffer = fs.readFileSync(imagePath)
  const { size } = fs.statSync(imagePath)

  console.log('↑ Uploading hero image...')
  const media = await payload.create({
    collection: 'media',
    data: { alt: 'Soviet panel apartment building in winter morning, Baltic city' },
    file: { data: imageBuffer, mimetype: 'image/png', name: 'soviet-winter-morning.png', size },
  })
  console.log(`✓ Media #${media.id}`)

  // Create RU post
  console.log('↑ Creating RU post...')
  const post = await payload.create({
    collection: 'blog-posts',
    locale: 'ru',
    data: {
      slug: 'zimnyaya-panelka-teplopoteri',
      title: 'Зимнее утро в панельке: почему январь — самый дорогой месяц за тепло',
      description: 'При -15°C снаружи советский дом теряет тепло значительно интенсивнее, чем весной — теплопотери прямо пропорциональны разнице температур. Разбираем физику теплопотерь, слабые места панельных домов и как читать зимний счёт.',
      heroImage: media.id,
      publishedAt: new Date('2025-06-24').toISOString(),
      readMinutes: 5,
      tags: [{ tag: 'отопление' }, { tag: 'расходы' }],
      content: contentRu,
      published: true,
    },
  })
  console.log(`✓ RU post #${post.id}`)

  // Add LV translation
  console.log('↑ Adding LV translation...')
  await payload.update({
    collection: 'blog-posts',
    id: post.id,
    locale: 'lv',
    data: {
      title: 'Ziemas rīts paneļmājā: kāpēc janvāris ir dārgākais apkures mēnesis',
      description: 'Pie -15°C ārā padomju māja zaudē siltumu ievērojami intensīvāk nekā pavasarī — siltuma zudumi ir tieši proporcionāli temperatūru starpībai. Analizējam siltuma zudumu fiziku, paneļmāju vājās vietas un kā lasīt ziemas rēķinu.',
      tags: [{ tag: 'apkure' }, { tag: 'izdevumi' }],
      content: contentLv,
    },
  })
  console.log('✓ LV translation added')

  console.log(`\nDone. Slug: zimnyaya-panelka-teplopoteri`)
  process.exit(0)
}

main().catch((err) => { console.error(err); process.exit(1) })
