'use client'

import { RichText } from '@payloadcms/richtext-lexical/react'
import type { JSXConvertersFunction } from '@payloadcms/richtext-lexical/react'
import Link from 'next/link'
import { ReactNode, useState } from 'react'

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

function VideoEmbed({ url, caption }: { url: string; caption?: string }) {
  const embedUrl = toEmbedUrl(url)
  if (!embedUrl) return null
  return (
    <figure className="my-6 not-prose">
      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
        <iframe
          src={embedUrl}
          className="absolute inset-0 w-full h-full rounded-xl"
          allowFullScreen
          loading="lazy"
          title={caption ?? 'Video'}
        />
      </div>
      {caption && <figcaption className="mt-2 text-xs text-center text-gray-500">{caption}</figcaption>}
    </figure>
  )
}

function toEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url)
    if (u.hostname.includes('youtube.com') || u.hostname.includes('youtu.be')) {
      const videoId = u.hostname.includes('youtu.be')
        ? u.pathname.slice(1)
        : u.searchParams.get('v')
      if (!videoId) return null
      return `https://www.youtube-nocookie.com/embed/${videoId}`
    }
    if (u.hostname.includes('vimeo.com')) {
      const videoId = u.pathname.split('/').filter(Boolean).pop()
      if (!videoId) return null
      return `https://player.vimeo.com/video/${videoId}`
    }
  } catch {
    // invalid URL
  }
  return null
}

type FAQItem = { question: string; answer: string; id?: string }

function FAQAccordion({ items }: { items: FAQItem[] }) {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <div className="my-6 not-prose divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden">
      {items.map((item, i) => (
        <div key={item.id ?? i}>
          <button
            className="w-full flex justify-between items-center px-5 py-4 text-left text-sm font-medium text-gray-800 hover:bg-gray-50 transition-colors"
            onClick={() => setOpen(open === i ? null : i)}
            aria-expanded={open === i}
          >
            <span>{item.question}</span>
            <span className="ml-3 text-gray-400 text-lg leading-none">{open === i ? '−' : '+'}</span>
          </button>
          {open === i && (
            <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed">
              {item.answer}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function AlertBanner({ type, text }: { type: 'info' | 'warning' | 'danger'; text: string }) {
  const styles = {
    info: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-800', icon: 'ℹ' },
    warning: { bg: 'bg-orange-50 border-orange-200', text: 'text-orange-800', icon: '⚠' },
    danger: { bg: 'bg-red-50 border-red-200', text: 'text-red-800', icon: '!' },
  }
  const s = styles[type] ?? styles.info
  return (
    <div className={`flex gap-3 border rounded-xl px-5 py-4 my-4 not-prose ${s.bg}`}>
      <span className={`shrink-0 font-bold ${s.text}`}>{s.icon}</span>
      <p className={`text-sm ${s.text}`}>{text}</p>
    </div>
  )
}

type ComparisonRow = { label: string; before: string; after: string; id?: string }

function ComparisonTable({ beforeLabel, afterLabel, rows }: { beforeLabel: string; afterLabel: string; rows: ComparisonRow[] }) {
  return (
    <div className="my-6 not-prose overflow-x-auto">
      <table className="w-full border border-gray-200 rounded-xl overflow-hidden text-sm">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-4 py-3 text-left text-gray-500 font-medium w-1/3" />
            <th className="px-4 py-3 text-center text-danger font-medium">{beforeLabel}</th>
            <th className="px-4 py-3 text-center text-success font-medium">{afterLabel}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((row, i) => (
            <tr key={row.id ?? i} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-gray-500">{row.label}</td>
              <td className="px-4 py-3 text-center text-danger font-medium">{row.before}</td>
              <td className="px-4 py-3 text-center text-success font-medium">{row.after}</td>
            </tr>
          ))}
        </tbody>
      </table>
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
    'video-embed': ({ node }: { node: BlockNode }) => (
      <VideoEmbed url={String(node.fields.url ?? '')} caption={node.fields.caption as string | undefined} />
    ),
    faq: ({ node }: { node: BlockNode }) => (
      <FAQAccordion items={(node.fields.items as FAQItem[]) ?? []} />
    ),
    'alert-banner': ({ node }: { node: BlockNode }) => (
      <AlertBanner type={node.fields.type as 'info' | 'warning' | 'danger'} text={String(node.fields.text ?? '')} />
    ),
    'comparison-table': ({ node }: { node: BlockNode }) => (
      <ComparisonTable
        beforeLabel={String(node.fields.beforeLabel ?? 'Before')}
        afterLabel={String(node.fields.afterLabel ?? 'After')}
        rows={(node.fields.rows as ComparisonRow[]) ?? []}
      />
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
