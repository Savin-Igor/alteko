/**
 * Shared Lexical JSON builders for Payload CMS blog seeding.
 * Mirrors the helper subset used by scripts/seed-blog-articles.ts but
 * exposes it as a reusable module so new seed scripts (readiness pack
 * etc.) do not duplicate the boilerplate.
 */

export type TextFormat = 0 | 1 | 2 | 8 | 16

export interface TextNode {
  type: 'text'
  text: string
  format: TextFormat
  detail: 0
  mode: 'normal'
  style: ''
  version: 1
}

export interface ParagraphNode {
  type: 'paragraph'
  children: TextNode[]
  direction: 'ltr'
  format: ''
  indent: 0
  version: 1
}

export interface HeadingNode {
  type: 'heading'
  tag: 'h2' | 'h3'
  children: TextNode[]
  direction: 'ltr'
  format: ''
  indent: 0
  version: 1
}

export interface ListItemNode {
  type: 'listitem'
  value: number
  children: TextNode[]
  direction: 'ltr'
  format: ''
  indent: 0
  version: 1
}

export interface ListNode {
  type: 'list'
  listType: 'bullet' | 'number'
  tag: 'ul' | 'ol'
  start: 1
  children: ListItemNode[]
  direction: 'ltr'
  format: ''
  indent: 0
  version: 1
}

export interface BlockNode {
  type: 'block'
  version: 2
  format: ''
  fields: Record<string, unknown>
}

export type ContentNode = ParagraphNode | HeadingNode | ListNode | BlockNode

export function txt(text: string, format: TextFormat = 0): TextNode {
  return { type: 'text', text, format, detail: 0, mode: 'normal', style: '', version: 1 }
}

export function bold(text: string): TextNode {
  return txt(text, 1)
}

export function p(...children: TextNode[]): ParagraphNode {
  return { type: 'paragraph', children, direction: 'ltr', format: '', indent: 0, version: 1 }
}

export function h2(text: string): HeadingNode {
  return {
    type: 'heading',
    tag: 'h2',
    children: [txt(text)],
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
  }
}

export function h3(text: string): HeadingNode {
  return {
    type: 'heading',
    tag: 'h3',
    children: [txt(text)],
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
  }
}

export function ul(items: Array<TextNode | TextNode[]>): ListNode {
  return {
    type: 'list',
    listType: 'bullet',
    tag: 'ul',
    start: 1,
    children: items.map((item, i) => ({
      type: 'listitem' as const,
      value: i + 1,
      children: Array.isArray(item) ? item : [item],
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0 as const,
      version: 1 as const,
    })),
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
  }
}

export function ol(items: Array<TextNode | TextNode[]>): ListNode {
  return { ...ul(items), listType: 'number', tag: 'ol' }
}

export function calloutBlock(
  type: 'info' | 'warning' | 'success',
  title: string,
  body: string,
): BlockNode {
  return {
    type: 'block',
    version: 2,
    format: '',
    fields: { blockType: 'callout', type, title, body },
  }
}

export function statsBlock(
  rows: Array<{ label: string; value: string; color?: string }>,
): BlockNode {
  return {
    type: 'block',
    version: 2,
    format: '',
    fields: {
      blockType: 'stats-table',
      rows: rows.map((r) => ({ label: r.label, value: r.value, color: r.color ?? 'default' })),
    },
  }
}

export function ctaBlock(label: string, href: string, note?: string): BlockNode {
  return {
    type: 'block',
    version: 2,
    format: '',
    fields: { blockType: 'inline-cta', label, href, ...(note ? { note } : {}) },
  }
}

export function lexical(children: ContentNode[]) {
  return {
    root: {
      type: 'root',
      children: children.length > 0 ? children : [p(txt(''))],
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  }
}
