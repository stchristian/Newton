import React, { useState, useEffect, useRef } from 'react'
import { EditorState } from '@codemirror/state'
import { EditorView, Decoration, ViewPlugin, DecorationSet, ViewUpdate } from '@codemirror/view'
import { basicSetup } from 'codemirror'
import { markdown as cmMarkdown } from '@codemirror/lang-markdown'
import { syntaxHighlighting, HighlightStyle } from '@codemirror/language'
import { tags } from '@lezer/highlight'
import { Button } from './ui/button'

interface MarkdownViewerProps {
  value: string
  onSave?: (markdown: string) => void
}

// Live preview styles similar to Obsidian: larger, bold headings; bold/italic emphasis
const livePreviewStyle = HighlightStyle.define([
  { tag: tags.heading1, fontSize: '1.75rem', fontWeight: '700' },
  { tag: tags.heading2, fontSize: '1.5rem', fontWeight: '700' },
  { tag: tags.heading3, fontSize: '1.25rem', fontWeight: '700' },
  { tag: tags.heading4, fontSize: '1.15rem', fontWeight: '700' },
  { tag: tags.heading5, fontSize: '1.05rem', fontWeight: '700' },
  { tag: tags.heading6, fontSize: '1rem', fontWeight: '700' },
  { tag: tags.strong, fontWeight: '700' },
  { tag: tags.emphasis, fontStyle: 'italic' },
  { tag: tags.link, textDecoration: 'underline' }
])

// Decoration plugin: hide Markdown formatting markers (#, **, *) in visible ranges
function buildFormattingDecorations(view: EditorView): DecorationSet {
  const hiddenRanges: Array<{ from: number; to: number }> = []
  for (const { from, to } of view.visibleRanges) {
    const text = view.state.doc.sliceString(from, to)

    // Hide heading markers at line start: e.g., "## "
    text.replace(/^(#{1,6})(\s+)/gm, (match, hashes: string, space: string, idx: number) => {
      const start = from + idx
      const end = start + hashes.length + space.length
      hiddenRanges.push({ from: start, to: end })
      return match
    })

    // Hide bold markers: **bold** (avoid greedy over-match)
    text.replace(/\*\*(?=\S)([\s\S]*?\S)\*\*/g, (m: string, _inner: string, idx: number) => {
      const start = from + idx
      const end = start + m.length
      // Hide opening **
      hiddenRanges.push({ from: start, to: start + 2 })
      // Hide closing **
      hiddenRanges.push({ from: end - 2, to: end })
      return m
    })

    // Hide italic markers: *italic* but not **bold**
    text.replace(
      /(^|[^*])\*(?!\s)([^*]+?)(?<!\s)\*(?!\*)/g,
      (m: string, pre: string, _inner: string, idx: number) => {
        const start = from + idx + pre.length
        const end = start + (m.length - pre.length)
        // Hide opening *
        hiddenRanges.push({ from: start, to: start + 1 })
        // Hide closing *
        hiddenRanges.push({ from: end - 1, to: end })
        return m
      }
    )
  }
  hiddenRanges.sort((a, b) => a.from - b.from)
  const decorations = hiddenRanges.map(({ from, to }) => Decoration.replace({}).range(from, to))
  return Decoration.set(decorations)
}

const hideFormatting = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet
    constructor(view: EditorView) {
      this.decorations = buildFormattingDecorations(view)
    }
    update(update: ViewUpdate): void {
      if (update.docChanged || update.viewportChanged) {
        this.decorations = buildFormattingDecorations(update.view)
      }
    }
  },
  { decorations: (v: { decorations: DecorationSet }) => v.decorations }
)

const MarkdownViewer: React.FC<MarkdownViewerProps> = ({ value, onSave }) => {
  const [markdown, setMarkdown] = useState(value)

  const editorContainerRef = useRef<HTMLDivElement | null>(null)
  const editorViewRef = useRef<EditorView | null>(null)

  // Update markdown if value prop changes
  React.useEffect(() => {
    setMarkdown(value)
  }, [value])

  // Initialize CodeMirror and sync with external value
  useEffect(() => {
    if (editorContainerRef.current && !editorViewRef.current) {
      const state = EditorState.create({
        doc: value,
        extensions: [
          basicSetup,
          cmMarkdown(),
          EditorView.lineWrapping,
          syntaxHighlighting(livePreviewStyle),
          // hideFormatting,
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              const nextValue = update.state.doc.toString()
              setMarkdown(nextValue)
            }
          })
        ]
      })

      editorViewRef.current = new EditorView({
        state,
        parent: editorContainerRef.current
      })
    }

    // Keep editor in sync with external `value`
    if (editorViewRef.current && typeof value === 'string') {
      const view = editorViewRef.current
      const current = view.state.doc.toString()
      if (current !== value) {
        view.dispatch({
          changes: { from: 0, to: view.state.doc.length, insert: value }
        })
      }
    }

    return () => {
      // Always destroy on cleanup to avoid leaks
      if (editorViewRef.current) {
        editorViewRef.current.destroy()
        editorViewRef.current = null
      }
    }
  }, [value])

  return (
    <div className="flex flex-col w-3xl mx-auto">
      <div>
        <Button onClick={() => onSave && onSave(markdown)}>Save</Button>
      </div>
      <div
        ref={editorContainerRef}
        style={{
          padding: 0,
          minHeight: 300
        }}
      />
    </div>
  )
}

export default MarkdownViewer
