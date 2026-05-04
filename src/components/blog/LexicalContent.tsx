import { RichText } from '@payloadcms/richtext-lexical/react'
import type { JSXConvertersFunction } from '@payloadcms/richtext-lexical/react'
import Link from 'next/link'
import { ReactNode } from 'react'

function Callout({ type = 'info', title, children }: { type?: 'info' | 'warning' | 'success'; title?: string; children: ReactNode }) {
  const styles = {
    info: 'bg-primary-light border-blue-200 text-blue-900',
    warning: 'bg-warning-light border-orange-200 text-orange-900',
    success: 'bg-success-light border-green-200 text-green-900',
  }
  const titleStyles = { info: 'text-primary', warning: 'text-warning', success: 'text-success' }
  return (
    <div className={`border rounded-xl p-5 my-4 space-y-1.5 not-prose ${styles[type]}`}>
      {title && <p className={`text-sm font-semibold ${titleStyles[type]}`}>{title}</p>}
      <div className="text-sm">{children}</div>
    </div>
  )
}

type StatsRow = { label: string; value: string; color?: string; id?: string }

function StatsTable({ rows }: { rows: StatsRow[] }) {
  const colorMap: Record<string, string> = {
    warning: 'text-warning',
    danger: 'text-danger',
    success: 'text-success',
    default: 'text-gray-900',
  }
  return (
    <div className="card overflow-hidden p-0 my-4 not-prose divide-y divide-gray-100">
      {rows.map((row, i) => (
        <div key={row.id ?? i} className="flex justify-between px-5 py-3 text-sm">
          <span className="text-gray-500">{row.label}</span>
          <span className={`font-medium ${colorMap[row.color ?? 'default'] ?? 'text-gray-900'}`}>{row.value}</span>
        </div>
      ))}
    </div>
  )
}

const blogConverters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  blocks: {
    callout: ({ node }: { node: any }) => (
      <Callout type={node.fields.type} title={node.fields.title}>
        {node.fields.body}
      </Callout>
    ),
    'stats-table': ({ node }: { node: any }) => (
      <StatsTable rows={node.fields.rows ?? []} />
    ),
    'inline-cta': ({ node }: { node: any }) => (
      <div className="bg-gray-50 rounded-xl p-5 my-6 text-center space-y-3 not-prose">
        {node.fields.note && <p className="text-sm text-gray-500">{node.fields.note}</p>}
        <Link href={node.fields.href ?? '/#hero'} className="btn-primary inline-block w-auto px-8">
          {node.fields.label ?? 'Найти свой дом →'}
        </Link>
      </div>
    ),
  },
})

interface LexicalContentProps {
  data: unknown
}

export function LexicalContent({ data }: LexicalContentProps) {
  return (
    <RichText
      data={data as any}
      converters={blogConverters}
      className="prose prose-sm max-w-none"
    />
  )
}
