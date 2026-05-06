import Link from 'next/link'

export const padomjuKapnutelpasMeta = {
  title: 'Padomju kāpņu telpas: kāpēc sienas ir krāsotas divos toņos',
  description:
    'Baltā apmetums augšā un tumši zaļa krāsa apakšā — izskaidrojam, kāpēc padomju kāpņu telpas izskatās tieši šādi.',
}

export function PadomjuKapnutelpasContent() {
  return (
    <div className="space-y-5">
      <div className="bg-warning-light border border-orange-200 rounded-xl px-5 py-4">
        <p className="text-sm font-medium text-warning">Tulkojums tiek gatavots</p>
        <p className="text-sm text-gray-600 mt-1">
          Šis raksts pagaidām nav pieejams latviski. Lasiet krieviski:
        </p>
        <Link
          href="/ru/blog/sovetskie-podyezdy-dva-cveta"
          className="text-sm text-primary hover:underline mt-2 inline-block"
        >
          Советские подъезды: два цвета — читать на русском →
        </Link>
      </div>
    </div>
  )
}
