import Link from 'next/link'

export const dzivePirmsUnPecRenovacijasMeta = {
  title: 'Dzīve pirms un pēc renovācijas: reālie skaitļi Latvijā',
  description:
    'Cik patiesībā ietaupa iedzīvotāji pēc daudzdzīvokļu mājas renovācijas Latvijā: dati par 624 mājām, dzīvokļu vērtības pieaugums un ko rāda prakse.',
}

export function DzivePirmsUnPecRenovacijasContent() {
  return (
    <div className="space-y-5">
      <div className="bg-warning-light border border-orange-200 rounded-xl px-5 py-4">
        <p className="text-sm font-medium text-warning">Tulkojums tiek gatavots</p>
        <p className="text-sm text-gray-600 mt-1">
          Šis raksts pagaidām nav pieejams latviski. Lasiet krieviski:
        </p>
        <Link
          href="/ru/blog/zhizn-do-i-posle-renovacii"
          className="text-sm text-primary hover:underline mt-2 inline-block"
        >
          Жизнь до и после реновации — читать на русском →
        </Link>
      </div>
    </div>
  )
}
