import Link from 'next/link'

export const kaLasitKomunaloRekinuMeta = {
  title: 'Kā lasīt komunālo rēķinu: visu rindu skaidrojums',
  description:
    'Kas ir paslēpts katrā komunālā rēķina rindā, kā apsaimniekotājs aprēķina "normu" un kā pārbaudīt savus izdevumus.',
}

export function KaLasitKomunaloRekinuContent() {
  return (
    <div className="space-y-5">
      <div className="bg-warning-light border border-orange-200 rounded-xl px-5 py-4">
        <p className="text-sm font-medium text-warning">Tulkojums tiek gatavots</p>
        <p className="text-sm text-gray-600 mt-1">
          Šis raksts pagaidām nav pieejams latviski. Lasiet krieviski:
        </p>
        <Link
          href="/ru/blog/kak-chitat-schet-kommunalka"
          className="text-sm text-primary hover:underline mt-2 inline-block"
        >
          Как читать счёт за коммуналку — читать на русском →
        </Link>
      </div>
    </div>
  )
}
