import Link from 'next/link'

export const normaTeplaLvMeta = {
  title: 'Siltumenerģijas patēriņa norma daudzdzīvokļu mājā Latvijā: cik jāmaksā',
  description: 'Kā saprast, vai jūsu māja pārmaksā par apkuri. Etaloni pēc sērijas, rajona un platības.',
}

export function NormaTeplaLvContent() {
  return (
    <div className="space-y-5">
      <div className="bg-warning-light border border-orange-200 rounded-xl px-5 py-4">
        <p className="text-sm font-medium text-warning">Tulkojums tiek gatavots</p>
        <p className="text-sm text-gray-600 mt-1">
          Šis raksts pagaidām nav pieejams latviski. Lasiet krieviski:
        </p>
        <Link
          href="/ru/blog/norma-rashoda-tepla-latviya"
          className="text-sm text-primary hover:underline mt-2 inline-block"
        >
          Норма расхода тепла в Латвии — читать на русском →
        </Link>
      </div>
    </div>
  )
}
