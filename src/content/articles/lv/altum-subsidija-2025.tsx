import Link from 'next/link'

export const altumSubsidijaMeta = {
  title: 'Altum subsīdija daudzdzīvokļu mājas renovācijai: pilnīgs ceļvedis 2025',
  description: 'Kā saņemt līdz 49% subsīdiju no valsts daudzdzīvokļu mājas renovācijai Latvijā. Nosacījumi, dokumenti, termiņi.',
}

export function AltumSubsidijaContent() {
  return (
    <div className="space-y-5">
      <div className="bg-warning-light border border-orange-200 rounded-xl px-5 py-4">
        <p className="text-sm font-medium text-warning">Tulkojums tiek gatavots</p>
        <p className="text-sm text-gray-600 mt-1">
          Šis raksts pagaidām nav pieejams latviski. Lasiet krieviski:
        </p>
        <Link
          href="/ru/blog/subsidiya-altum-renovaciya-2025"
          className="text-sm text-primary hover:underline mt-2 inline-block"
        >
          Субсидия Altum на реновацию — читать на русском →
        </Link>
      </div>
    </div>
  )
}
