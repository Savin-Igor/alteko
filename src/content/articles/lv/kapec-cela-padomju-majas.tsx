import Link from 'next/link'

export const kapecCelaPardomjuMajasMeta = {
  title: 'Kāpēc tika celtas padomju mājas: kā PSRS atrisināja mājokļu jautājumu',
  description:
    'Padomju mājokļu celtniecības vēsture: no barakām un komunālajiem dzīvokļiem līdz masveida paneļmājām. Kāpēc visas mājas izskatās vienādi un ko tas nozīmē šodien.',
}

export function KapecCelaPardomjuMajasContent() {
  return (
    <div className="space-y-5">
      <div className="bg-warning-light border border-orange-200 rounded-xl px-5 py-4">
        <p className="text-sm font-medium text-warning">Tulkojums tiek gatavots</p>
        <p className="text-sm text-gray-600 mt-1">
          Šis raksts pagaidām nav pieejams latviski. Lasiet krieviski:
        </p>
        <Link
          href="/ru/blog/zachem-stroili-sovetskie-doma"
          className="text-sm text-primary hover:underline mt-2 inline-block"
        >
          Зачем строили советские дома — читать на русском →
        </Link>
      </div>
    </div>
  )
}
