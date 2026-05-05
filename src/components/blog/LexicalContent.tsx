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

// Payload block nodes don't have typed fields in the JSX converter API — use unknown with narrowing
interface BlockNode { fields: Record<string, unknown> }

const blogConverters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  blocks: {
    callout: ({ node }: { node: BlockNode }) => (
      <Callout type={node.fields.type as 'info' | 'warning' | 'success'} title={node.fields.title as string}>
        {String(node.fields.body ?? '')}
      </Callout>
    ),
    'stats-table': ({ node }: { node: BlockNode }) => (
      <StatsTable rows={(node.fields.rows as StatsRow[]) ?? []} />
    ),
    'inline-cta': ({ node }: { node: BlockNode }) => (
      <div className="bg-gray-50 rounded-xl p-5 my-6 text-center space-y-3 not-prose">
        {node.fields.note ? <p className="text-sm text-gray-500">{String(node.fields.note)}</p> : null}
        <Link href={(node.fields.href as string) ?? '/#hero'} className="btn-primary inline-block w-auto px-8">
          {(node.fields.label as string) ?? 'Найти свой дом →'}
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
      data={data as Parameters<typeof RichText>[0]['data']}
      converters={blogConverters}
      className="prose prose-sm max-w-none"
    />
  )
}
