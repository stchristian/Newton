import { syntaxHighlighting, HighlightStyle } from '@codemirror/language'
import { tags } from '@lezer/highlight'

// Live preview styles similar to Obsidian: larger, bold headings; bold/italic emphasis
export const livePreviewStyle = HighlightStyle.define([
  { tag: tags.heading1, class: 'text-4xl font-bold' },
  { tag: tags.heading2, class: 'text-3xl font-bold' },
  { tag: tags.heading3, class: 'text-2xl font-bold' },
  { tag: tags.heading4, class: 'text-xl font-bold' },
  { tag: tags.heading5, class: 'text-lg font-bold' },
  { tag: tags.heading6, class: 'text-base font-bold' },
  { tag: tags.strong, class: 'font-bold' },
  { tag: tags.emphasis, class: 'italic' },
  { tag: tags.link, class: 'underline' },
  { tag: tags.quote, class: 'pl-2 border-l-2' }
])

export const livePreviewExtension = syntaxHighlighting(livePreviewStyle)
