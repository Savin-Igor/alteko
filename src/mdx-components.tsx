import type { MDXComponents } from 'mdx/types'
import Link from 'next/link'
import { InfoBanner, StatCard } from '@/components/ui'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // Override HTML elements
    h2: (props) => (
      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3" {...props} />
    ),
    h3: (props) => (
      <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-2" {...props} />
    ),
    p: (props) => (
      <p className="text-gray-700 leading-relaxed mb-4" {...props} />
    ),
    ul: (props) => (
      <ul className="space-y-1.5 pl-4 list-disc text-gray-700 mb-4" {...props} />
    ),
    ol: (props) => (
      <ol className="space-y-1.5 pl-4 list-decimal text-gray-700 mb-4" {...props} />
    ),
    li: (props) => (
      <li className="text-sm leading-relaxed" {...props} />
    ),
    strong: (props) => (
      <strong className="font-semibold text-gray-900" {...props} />
    ),
    a: ({ href = '#', ...props }) => (
      <a href={href} className="text-primary hover:underline" target={href.startsWith('http') ? '_blank' : undefined} rel={href.startsWith('http') ? 'noopener noreferrer' : undefined} {...props} />
    ),
    // Custom components available in MDX files
    InfoBanner,
    StatCard,
    Link,
    // Inline CTA block
    InlineCta: ({ href = '/#hero', label = 'Найти свой дом →', note }: { href?: string; label?: string; note?: string }) => (
      <div className="bg-gray-50 rounded-xl p-5 my-6 text-center space-y-3 not-prose">
        {note && <p className="text-sm text-gray-500">{note}</p>}
        <Link href={href} className="btn-primary inline-block w-auto px-8">
          {label}
        </Link>
      </div>
    ),
    // Stats table
    StatsTable: ({ rows }: { rows: Array<{ label: string; value: string; color?: string }> }) => (
      <div className="card overflow-hidden p-0 my-4 not-prose">
        {rows.map((row, i) => (
          <div key={i} className="flex justify-between px-5 py-3 text-sm border-t border-gray-100 first:border-t-0">
            <span className="text-gray-500">{row.label}</span>
            <span className={`font-medium ${row.color ?? 'text-gray-900'}`}>{row.value}</span>
          </div>
        ))}
      </div>
    ),
    ...components,
  }
}
