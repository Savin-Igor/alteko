import Link from 'next/link'

export const serija119Meta = {
  title: '119. sērijas mājas Latvijā: kāpēc iedzīvotāji pārmaksā un ko darīt',
  description: '119. sērija ir visizplatītākais padomju projekts Rīgā. Noskaidrojam, kāpēc šīs mājas tērē tik daudz un kā to labot.',
}

export function Serija119Content() {
  return (
    <div className="space-y-5">
      <div className="bg-warning-light border border-orange-200 rounded-xl px-5 py-4">
        <p className="text-sm font-medium text-warning">Tulkojums tiek gatavots</p>
        <p className="text-sm text-gray-600 mt-1">
          Šis raksts pagaidām nav pieejams latviski. Lasiet krieviski:
        </p>
        <Link
          href="/ru/blog/seriya-119-latviya"
          className="text-sm text-primary hover:underline mt-2 inline-block"
        >
          Серия 119 в Латвии — читать на русском →
        </Link>
      </div>
    </div>
  )
}
