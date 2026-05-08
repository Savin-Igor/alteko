import type { Metadata } from 'next'
import { SiteFooter } from '@/components/ui/SiteFooter'
import { SiteHeader } from '@/components/ui/SiteHeader'
import { routing } from '@/i18n/routing'
import { localizedAlternates } from '@/lib/seo'
import { notFound } from 'next/navigation'

interface Props {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const isRu = locale === 'ru'
  return {
    title: isRu ? 'Политика конфиденциальности — ALTEKO' : 'Privātuma politika — ALTEKO',
    description: isRu
      ? 'Политика конфиденциальности платформы ALTEKO: какие персональные данные мы собираем, для каких целей и каковы права пользователя согласно GDPR.'
      : 'ALTEKO platformas privātuma politika: kādus personas datus mēs apkopojam, kādiem mērķiem un kādas ir lietotāja tiesības saskaņā ar VDAR.',
    alternates: localizedAlternates({ path: '/privacy', locale }),
  }
}

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params
  if (!routing.locales.includes(locale as 'lv' | 'ru')) notFound()

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="flex-1 px-4 py-10 max-w-3xl mx-auto w-full">
        <article className="prose prose-gray max-w-none">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Privātuma politika</h1>
          <p className="text-sm text-gray-500 mb-8">
            Spēkā no 2026. gada 1. maija
          </p>

          <section className="mb-8">
            <p className="text-gray-700 leading-relaxed">
              Šajā privātuma politikā ir aprakstīts, kā ALTEKO platforma
              (turpmāk — <strong>ALTEKO</strong> vai <strong>mēs</strong>) apkopo, izmanto un aizsargā lietotāju
              personas datus saskaņā ar Eiropas Parlamenta un Padomes Regulu (ES)
              2016/679 (Vispārīgā datu aizsardzības regula, turpmāk — <strong>VDAR</strong>) un
              Latvijas Republikas Fizisko personu datu apstrādes likumu.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Datu pārzinis</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Personas datu pārzinis (VDAR 13. panta 1. punkta a) apakšpunkts):
            </p>
            <ul className="list-none pl-0 text-gray-700 space-y-1 mb-3">
              <li><strong>Nosaukums:</strong> SIA &ldquo;ALTEKO&rdquo;</li>
              <li><strong>Reģistrācijas numurs:</strong> [jāreģistrē pirms publiskās palaišanas]</li>
              <li><strong>Juridiskā adrese:</strong> [jānorāda pirms publiskās palaišanas], Rīga, Latvija</li>
              <li>
                <strong>Kontaktpersona datu aizsardzības jautājumos:</strong>{' '}
                <a href="mailto:info@alteko.lv" className="text-primary hover:underline">
                  info@alteko.lv
                </a>
              </li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              Saziņai jautājumos par personas datu apstrādi lūdzam rakstīt uz{' '}
              <a href="mailto:info@alteko.lv" className="text-primary hover:underline">
                info@alteko.lv
              </a>
              .
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              2. Kādus personas datus mēs apkopojam
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Mēs apkopojam tikai to informāciju, kas ir absolūti nepieciešama
              pakalpojuma sniegšanai. Vienīgais personu identificējošais dati,
              ko mēs uzglabājam, ir:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>
                <strong>E-pasta adrese</strong> — to lietotājs norāda brīvprātīgi, lai saņemtu
                detalizētu komunālo izdevumu auditu, lai pieteiktos savā kontā
                vai lai saņemtu informāciju par renovācijas iespējām.
              </li>
            </ul>
            <p className="text-gray-700 leading-relaxed mb-2">
              Papildus tam, pakalpojuma darbības nodrošināšanai automātiski tiek
              apstrādāti šādi tehniskie dati:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>
                <strong>Sesijas sīkdatnes (cookies)</strong> — nepieciešamas autentifikācijai
                un pakalpojuma pamatfunkciju darbībai.
              </li>
              <li>
                <strong>Servera žurnālfaili</strong> — IP adrese, pārlūkprogrammas tips
                un piekļuves laiks; tos izmanto drošības un tehnisko problēmu
                diagnostikai.
              </li>
              <li>
                <strong>Augšupielādētie PDF rēķini</strong> — satur informāciju par dzīvojamo
                māju (adrese, periods, izdevumu pozīcijas), bet nesatur lietotāju
                personas datus.
              </li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              <strong>Mēs neapkopojam un neuzglabājam citus personas datus</strong> — proti,
              mēs nelūdzam un neglabājam vārdu, uzvārdu, tālruņa numuru, personas
              kodu, dzīvesvietas adresi, bankas konta numuru vai jebkādu citu
              finanšu informāciju.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              3. Personas datu apstrādes mērķi
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              E-pasta adresi mēs izmantojam vienīgi šādiem mērķiem:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>
                detalizēta komunālo izdevumu audita rezultāta nosūtīšanai
                lietotājam;
              </li>
              <li>
                lietotāja autentifikācijai (pieteikšanās bez paroles, izmantojot
                vienreizēju saiti, kas tiek nosūtīta uz e-pastu);
              </li>
              <li>
                informēšanai par renovācijas finansējuma iespējām un
                pakalpojuma būtiskām izmaiņām (tikai pēc skaidri izteiktas
                lietotāja piekrišanas).
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              4. Apstrādes tiesiskais pamats
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Personas datu apstrāde tiek veikta saskaņā ar VDAR 6. panta 1. punktu:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>
                <strong>Lietotāja piekrišana</strong> (a apakšpunkts) — kad lietotājs
                brīvprātīgi norāda savu e-pasta adresi, lai saņemtu pakalpojumu;
              </li>
              <li>
                <strong>Līguma izpilde</strong> (b apakšpunkts) — kad apstrāde ir
                nepieciešama, lai sniegtu lietotājam pieprasīto pakalpojumu;
              </li>
              <li>
                <strong>Pārziņa likumiskās intereses</strong> (f apakšpunkts) — pakalpojuma
                drošības nodrošināšanai un tehnisko problēmu diagnostikai.
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              5. Personas datu glabāšanas termiņš
            </h2>
            <p className="text-gray-700 leading-relaxed">
              E-pasta adresi mēs glabājam tik ilgi, cik tas ir nepieciešams
              pakalpojuma sniegšanai vai līdz brīdim, kad lietotājs pieprasa
              dzēst savu kontu. Servera žurnālfailus glabājam ne ilgāk kā 12
              mēnešus. <strong>Augšupielādētos PDF rēķinu oriģinālus dzēšam automātiski
              pēc to veiksmīgas apstrādes</strong> (parasti dažu minūšu laikā); sistēmā
              tiek saglabāti tikai strukturētie izdevumu dati (kategorijas un summas).
              Strukturētos izdevumu datus glabājam, kamēr lietotājs uztur aktīvu kontu
              vai pieprasīto pakalpojumu vēsturi. Pēc konta dzēšanas dati tiek
              neatgriezeniski dzēsti 30 dienu laikā.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              6. Personas datu nodošana trešajām personām
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Mēs nepārdodam un nenododam jūsu e-pasta adresi trešajām personām
              tirgvedības mērķiem. Personas datus var apstrādāt mūsu apstrādātāji,
              kas darbojas mūsu uzdevumā un saskaņā ar mūsu norādījumiem:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>e-pasta sūtīšanas pakalpojumu sniedzēji (lai piegādātu auditu un autentifikācijas saites);</li>
              <li>mākoņa infrastruktūras pakalpojumu sniedzēji (datu glabāšanai un pakalpojuma darbībai);</li>
              <li>dokumentu apstrādes pakalpojumu sniedzēji (PDF rēķinu apstrādei — tikai dokumenta saturs, bez e-pasta adreses).</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              7. Datu nodošana ārpus Eiropas Ekonomikas zonas
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Atsevišķi mūsu apstrādātāji var atrasties ārpus Eiropas Ekonomikas
              zonas (EEZ). Šādos gadījumos datu nodošana notiek, pamatojoties uz
              Eiropas Komisijas pieņemtām standartlīguma klauzulām vai citiem
              VDAR 46. pantā paredzētajiem aizsardzības pasākumiem.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Lietotāja tiesības</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Saskaņā ar VDAR jums ir tiesības:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>piekļūt saviem personas datiem un saņemt to kopiju;</li>
              <li>pieprasīt nepareizu vai nepilnīgu datu labošanu;</li>
              <li>pieprasīt savu personas datu dzēšanu (“tiesības tikt aizmirstam”);</li>
              <li>ierobežot personas datu apstrādi;</li>
              <li>iebilst pret personas datu apstrādi;</li>
              <li>saņemt savus datus strukturētā, plaši izmantotā formātā (datu pārnesamība);</li>
              <li>jebkurā brīdī atsaukt savu piekrišanu, ja apstrāde balstās uz piekrišanu;</li>
              <li>iesniegt sūdzību Datu valsts inspekcijai (<a href="https://www.dvi.gov.lv" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">www.dvi.gov.lv</a>).</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              Lai izmantotu savas tiesības, lūdzam sazināties ar mums pa e-pastu{' '}
              <a href="mailto:info@alteko.lv" className="text-primary hover:underline">
                info@alteko.lv
              </a>
              .
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Sīkdatnes</h2>
            <p className="text-gray-700 leading-relaxed">
              Mūsu vietne izmanto tikai tehniski nepieciešamās sīkdatnes, kas
              nodrošina pakalpojuma pamatfunkciju darbību (autentifikācija,
              valodas izvēle). Mēs neizmantojam reklāmas vai trešo pušu
              analītikas sīkdatnes bez lietotāja piekrišanas.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              10. Datu drošība
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Mēs piemērojam atbilstošus tehniskos un organizatoriskos pasākumus,
              lai aizsargātu jūsu personas datus pret neatļautu piekļuvi, izmaiņām,
              izpaušanu vai iznīcināšanu. Datu pārraide notiek, izmantojot
              šifrētu HTTPS savienojumu.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              11. Privātuma politikas izmaiņas
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Mēs paturam tiesības laiku pa laikam grozīt šo privātuma politiku.
              Aktuālā versija vienmēr ir pieejama šajā lapā, un būtisku izmaiņu
              gadījumā mēs informēsim lietotājus pa e-pastu.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">12. Kontaktinformācija</h2>
            <p className="text-gray-700 leading-relaxed">
              Jautājumu vai pretenziju gadījumā par personas datu apstrādi lūdzam
              rakstīt uz{' '}
              <a href="mailto:info@alteko.lv" className="text-primary hover:underline">
                info@alteko.lv
              </a>
              .
            </p>
          </section>
        </article>
      </main>

      <SiteFooter />
    </div>
  )
}
