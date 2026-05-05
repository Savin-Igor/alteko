import type { Metadata } from 'next'
import { Link } from '@/i18n/navigation'
import { SiteFooter } from '@/components/ui/SiteFooter'
import { SiteHeader } from '@/components/ui/SiteHeader'
import { routing } from '@/i18n/routing'
import { notFound } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Lietošanas noteikumi — ALTEKO',
  description:
    'ALTEKO platformas lietošanas noteikumi: pakalpojuma apraksts, lietotāja saistības, atbildības ierobežojumi un strīdu risināšanas kārtība.',
}

interface Props {
  params: Promise<{ locale: string }>
}

export default async function TermsPage({ params }: Props) {
  const { locale } = await params
  if (!routing.locales.includes(locale as 'lv' | 'ru')) notFound()

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="flex-1 px-4 py-10 max-w-3xl mx-auto w-full">
        <article className="prose prose-gray max-w-none">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Lietošanas noteikumi</h1>
          <p className="text-sm text-gray-500 mb-8">
            Spēkā no 2026. gada 1. maija
          </p>

          <section className="mb-8">
            <p className="text-gray-700 leading-relaxed">
              Šie lietošanas noteikumi (turpmāk — <strong>noteikumi</strong>) regulē ALTEKO
              platformas (turpmāk — <strong>ALTEKO</strong> vai <strong>platforma</strong>) izmantošanu.
              Apmeklējot vietni vai izmantojot tās pakalpojumus, jūs piekrītat
              šiem noteikumiem pilnā apmērā. Ja nepiekrītat kādam no noteikumiem,
              lūdzam neizmantot platformu.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Vispārīgi noteikumi</h2>
            <p className="text-gray-700 leading-relaxed">
              ALTEKO ir tiešsaistes platforma, kas paredzēta Latvijas dzīvojamo
              māju iedzīvotājiem un to pārvaldītājiem. Platforma piedāvā komunālo
              izdevumu auditu, renovācijas plānošanas rīkus un saistītus
              informatīvos pakalpojumus. Noteikumus pieņem ALTEKO platformas
              operators, kura kontaktinformācija norādīta šo noteikumu pēdējā
              sadaļā.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Pakalpojuma apraksts</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              ALTEKO ir <strong>Mājas gatavības platforma</strong> (Readiness Platform), kas sniedz šādus pakalpojumus:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>
                <strong>Mājas gatavības novērtējums (Building Readiness Score)</strong> — automātiska mājas
                gatavības vērtēšana pēc astoņiem komponentiem (energoefektivitāte, dokumenti,
                īpašnieku lēmumi, finansiālā dzīvotspēja u.c.) uz publiski pieejamo datu pamata.
              </li>
              <li>
                <strong>Izmaksu analīze</strong> — PDF rēķina augšupielāde, datu apstrāde ar MI
                un salīdzinājums ar līdzīgām mājām. Rezultāts ir <em>provizorisks novērtējums</em>,
                kas izmantojams kā izejas punkts diskusijai ar pārvaldnieku.
              </li>
              <li>
                <strong>Finansējuma scenāriji</strong> — pieci informācijas scenāriji (SCF 2026-2032,
                ALTUM remonta aizdevums, komercbanka, pašu uzkrājumi, jauktais). Scenāriji ir
                <em>provizorisks aprēķins</em> un nav uzskatāmi par finanšu konsultāciju.
              </li>
              <li>
                <strong>Īpašnieku lēmumu kampaņas</strong> — lēmumu sagatavošana un eksports uz
                BIS Mājas lieta. ALTEKO nesniedz juridisku slēdzienu par lēmumu derīgumu.
              </li>
              <li>
                <strong>Piegādātāju atlases telpa (Tender Room)</strong> — pārredzams piegādātāja
                atlases process bez veiksmes komisijas.
              </li>
              <li>
                <strong>Informatīvie raksti</strong> — emuārs par komunālajiem izdevumiem,
                renovācijas finansējumu un mājas pārvaldību Latvijā.
              </li>
            </ul>
            <p className="text-sm text-gray-500 leading-relaxed">
              <strong>Svarīgi:</strong> ALTEKO sniegtās novērtējumi un aprēķini ir informatīvi un
              nesatur juridisku vai finanšu konsultāciju. Lēmumus par renovāciju, aizdevumiem un
              pieteikumiem pieņem mājas īpašnieki un pilnvarotās personas, pamatojoties uz
              saviem apsvērumiem un profesionālu speciālistu konsultācijām.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              3. Pakalpojuma sniegšanas nosacījumi
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Lielāko daļu platformas pakalpojumu varat izmantot bez reģistrācijas.
              Detalizēta audita rezultāta saņemšanai un personalizēta renovācijas
              aprēķina piekļuvei var būt nepieciešama e-pasta adreses norādīšana.
              E-pasta adrese tiek apstrādāta saskaņā ar mūsu{' '}
              <Link href="/privacy" className="text-primary hover:underline">
                privātuma politiku
              </Link>
              .
            </p>
            <p className="text-gray-700 leading-relaxed">
              Pakalpojuma izmantošana ir bezmaksas. ALTEKO patur tiesības nākotnē
              ieviest atsevišķus maksas pakalpojumus, par to iepriekš informējot
              lietotājus.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Lietotāja saistības</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Izmantojot platformu, lietotājs apņemas:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>norādīt patiesu un aktuālu informāciju (ieskaitot e-pasta adresi);</li>
              <li>
                augšupielādēt tikai tādus dokumentus, kuru izmantošanai lietotājam
                ir tiesības (piemēram, savas dzīvojamās mājas pārvaldnieka
                izdotos rēķinus);
              </li>
              <li>
                neizmantot platformu pretlikumīgiem mērķiem, krāpšanai, ļaunprātīgu
                programmu izplatīšanai vai citu personu tiesību aizskaršanai;
              </li>
              <li>
                nemēģināt iegūt nesankcionētu piekļuvi platformas tehniskajai
                infrastruktūrai vai citu lietotāju datiem;
              </li>
              <li>
                neizmantot automatizētus rīkus (botu, skrāpju u.c.) bez iepriekšējas
                rakstiskas atļaujas no platformas operatora.
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              5. Intelektuālais īpašums
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Visas tiesības uz platformas saturu — tekstiem, dizainu, programmkodu,
              logotipu un citiem materiāliem — pieder ALTEKO platformas operatoram
              vai to autoriem. Saturu drīkst izmantot tikai personiskām, nekomerciālām
              vajadzībām. Jebkāda satura kopēšana, pavairošana, izplatīšana vai
              komerciāla izmantošana bez rakstiskas atļaujas ir aizliegta.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              6. Informācijas precizitāte un atbildības ierobežojumi
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Platformas sniegtie aprēķini, salīdzinājumi un prognozes ir
              informatīvi un tiek balstīti uz publiski pieejamiem datiem
              (Centrālās statistikas pārvaldes, VZD, Altum, BVKB, SPRK un citiem
              avotiem) un lietotāja iesniegto informāciju. Tie nav uzskatāmi par
              juridisku, finanšu, tehnisku vai cita veida profesionālu konsultāciju.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              Pirms svarīgu lēmumu pieņemšanas (piemēram, par renovācijas projekta
              uzsākšanu, līgumu slēgšanu ar būvuzņēmējiem vai subsīdiju pieteikšanu)
              lūdzam konsultēties ar attiecīgās jomas speciālistiem.
            </p>
            <p className="text-gray-700 leading-relaxed">
              ALTEKO neatbild par zaudējumiem, kas lietotājam vai trešajām personām
              var rasties no platformā sniegtās informācijas izmantošanas, kā arī
              par pārtraukumiem pakalpojuma darbībā, ja tie radušies tehnisku
              iemeslu dēļ vai no platformas neatkarīgu apstākļu rezultātā.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              7. Trešo pušu pakalpojumi un saites
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Platforma var saturēt saites uz trešo pušu vietnēm (Altum, likumi.lv,
              Datu valsts inspekcija u.c.). ALTEKO neatbild par šo vietņu saturu,
              pieejamību vai privātuma praksi.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              8. Pakalpojuma izmaiņas un pārtraukšana
            </h2>
            <p className="text-gray-700 leading-relaxed">
              ALTEKO patur tiesības jebkurā brīdī mainīt, ierobežot vai pārtraukt
              platformas darbību vai tās atsevišķas funkcijas, par to iepriekš
              informējot lietotājus, ja tas ir iespējams. ALTEKO patur arī tiesības
              ierobežot vai liegt piekļuvi platformai lietotājiem, kas pārkāpj
              šos noteikumus.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Noteikumu izmaiņas</h2>
            <p className="text-gray-700 leading-relaxed">
              ALTEKO patur tiesības laiku pa laikam grozīt šos noteikumus. Aktuālā
              redakcija vienmēr ir pieejama šajā lapā. Noteikumu būtisku izmaiņu
              gadījumā lietotāji tiks informēti vietnē vai pa e-pastu. Pakalpojuma
              turpmāka izmantošana pēc grozījumu publicēšanas tiek uzskatīta par
              piekrišanu jaunajiem noteikumiem.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              10. Piemērojamie tiesību akti un strīdu risināšana
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Šiem noteikumiem un platformas izmantošanai ir piemērojami Latvijas
              Republikas tiesību akti. Strīdi, kas izriet no šiem noteikumiem vai
              platformas izmantošanas, tiek risināti pārrunu ceļā. Ja vienošanos
              nav iespējams panākt, strīds tiek izskatīts Latvijas Republikas
              tiesā saskaņā ar tās jurisdikciju.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Kontaktinformācija</h2>
            <p className="text-gray-700 leading-relaxed">
              Visos jautājumos par platformas darbību, šiem noteikumiem vai
              sadarbības iespējām lūdzam rakstīt uz{' '}
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
