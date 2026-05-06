import Link from 'next/link'

export const kaCelaPanelumajasMeta = {
  title: 'Kā tika celtas padomju paneļmājas: tehnoloģija, kas mainīja pilsētas',
  description:
    'Uzziniet, kā padomju celtnieki 12 darba dienās uzcēla deviņstāvu mājas un kāpēc šie lēmumi ietekmē jūsu apkures rēķinus šodien.',
}

export function KaCelaPanelumajas() {
  return (
    <div className="space-y-5">
      <div className="bg-warning-light border border-orange-200 rounded-xl px-5 py-4">
        <p className="text-sm font-medium text-warning">Tulkojums tiek gatavots</p>
        <p className="text-sm text-gray-600 mt-1">
          Šis raksts pagaidām nav pieejams latviski. Lasiet krieviski:
        </p>
        <Link
          href="/ru/blog/kak-stroilis-sovetskie-panelyoty"
          className="text-sm text-primary hover:underline mt-2 inline-block"
        >
          Как строились советские панельки — читать на русском →
        </Link>
      </div>
    </div>
  )
}
