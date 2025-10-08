import { useState, useEffect, useRef, useImperativeHandle, forwardRef, useCallback } from 'react'
import { EditorState, Compartment, RangeSetBuilder } from '@codemirror/state'
import { EditorView, Decoration, DecorationSet, ViewPlugin, ViewUpdate } from '@codemirror/view'
import { markdown as cmMarkdown } from '@codemirror/lang-markdown'
import { syntaxHighlighting, HighlightStyle, syntaxTree } from '@codemirror/language'
import { tags } from '@lezer/highlight'
import { Pencil, BookOpen } from 'lucide-react'
import { Button } from './ui'
import { config } from './EditorConfig'
import { StorageService } from '@renderer/features/storage'

interface MarkdownViewerProps {
  value: string
  fileName?: string
  filePath?: string
  onSave?: (markdown: string) => void
  autoSaveDelay?: number // Delay in milliseconds before auto-saving
}

export interface MarkdownViewerRef {
  focus: () => void
}

// Live preview styles similar to Obsidian: larger, bold headings; bold/italic emphasis
const livePreviewStyle = HighlightStyle.define([
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

// CSS class to hide markdown syntax
const hiddenSyntax = Decoration.mark({
  class: 'cm-hidden-syntax',
  attributes: { style: 'opacity: 0; position: absolute; pointer-events: none;' }
})

// Build decorations to hide markdown formatting in read mode
function buildFormattingDecorations(view: EditorView): DecorationSet {
  const builder = new RangeSetBuilder<Decoration>()

  for (const { from, to } of view.visibleRanges) {
    syntaxTree(view.state).iterate({
      from,
      to,
      enter: (node) => {
        const nodeName = node.name

        // Hide heading marks (##, ###, etc.)
        if (nodeName === 'HeaderMark') {
          builder.add(node.from, node.to, hiddenSyntax)
        }
        // Hide emphasis/strong marks (*, **, _, __)
        else if (nodeName === 'EmphasisMark' || nodeName === 'StrongMark') {
          builder.add(node.from, node.to, hiddenSyntax)
        }
        // Hide link syntax but keep link text visible
        else if (nodeName === 'LinkMark' || nodeName === 'URL') {
          builder.add(node.from, node.to, hiddenSyntax)
        }
        // Hide code marks (`, ```)
        else if (nodeName === 'CodeMark' || nodeName === 'CodeInfo') {
          builder.add(node.from, node.to, hiddenSyntax)
        }
        // Hide list marks (-, *, +, 1., etc.)
        else if (nodeName === 'ListMark') {
          builder.add(node.from, node.to, hiddenSyntax)
        }
        // Hide quote marks (>)
        else if (nodeName === 'QuoteMark') {
          builder.add(node.from, node.to, hiddenSyntax)
        }
      }
    })
  }

  return builder.finish()
}

// ViewPlugin to hide markdown formatting
const hideFormattingPlugin = ViewPlugin.fromClass(
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
  { decorations: (v) => v.decorations }
)

// Compartments for dynamic reconfiguration
const editableCompartment = new Compartment()
const hideFormattingCompartment = new Compartment()

const MarkdownViewer = forwardRef<MarkdownViewerRef, MarkdownViewerProps>(
  ({ value, fileName, filePath, onSave, autoSaveDelay = 2000 }, ref) => {
    const [isSaving, setIsSaving] = useState(false)
    const [lastSaved, setLastSaved] = useState<Date | null>(null)

    const [editMode, setEditMode] = useState(true)

    // Toggle edit mode with Cmd/Ctrl + E
    useEffect(() => {
      const keyDownHandler = (ev: KeyboardEvent) => {
        if ((ev.metaKey || ev.ctrlKey) && ev.key.toLowerCase() === 'e') {
          ev.preventDefault()
          setEditMode((prev) => !prev)
        }
      }

      window.addEventListener('keydown', keyDownHandler)
      return () => window.removeEventListener('keydown', keyDownHandler)
    }, [])

    // Reconfigure editor when edit mode changes
    useEffect(() => {
      if (!editorViewRef.current) return

      editorViewRef.current.dispatch({
        effects: [
          editableCompartment.reconfigure(EditorView.editable.of(editMode)),
          hideFormattingCompartment.reconfigure(editMode ? [] : hideFormattingPlugin)
        ]
      })

      // Focus/blur based on mode
      if (editMode) {
        editorViewRef.current.focus()
      } else {
        editorViewRef.current.contentDOM.blur()
      }
    }, [editMode])

    const editorContainerRef = useRef<HTMLDivElement | null>(null)
    const editorViewRef = useRef<EditorView | null>(null)
    const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    // Expose focus method to parent component
    useImperativeHandle(ref, () => ({
      focus: () => {
        if (editorViewRef.current) {
          editorViewRef.current.focus()
        }
      }
    }))

    // Debounced auto-save function
    const debouncedSave = useCallback(
      (content: string) => {
        // Clear existing timeout
        if (autoSaveTimeoutRef.current) {
          clearTimeout(autoSaveTimeoutRef.current)
        }

        // Set new timeout for auto-save
        autoSaveTimeoutRef.current = setTimeout(async () => {
          if (!filePath) return

          setIsSaving(true)
          try {
            await StorageService.writeFile(filePath, content)
            setLastSaved(new Date())
            // Call the onSave callback if provided
            onSave?.(content)
          } catch (error) {
            console.error('Auto-save failed:', error)
          } finally {
            setIsSaving(false)
          }
        }, autoSaveDelay)
      },
      [filePath, autoSaveDelay, onSave]
    )
    // Cleanup timeout on unmount
    useEffect(() => {
      return () => {
        if (autoSaveTimeoutRef.current) {
          clearTimeout(autoSaveTimeoutRef.current)
        }
      }
    }, [])

    // Initialize CodeMirror and sync with external value
    useEffect(() => {
      if (editorContainerRef.current && !editorViewRef.current) {
        const state = EditorState.create({
          doc: value,
          extensions: [
            config,
            cmMarkdown(),
            EditorView.lineWrapping,
            syntaxHighlighting(livePreviewStyle),
            editableCompartment.of(EditorView.editable.of(editMode)),
            hideFormattingCompartment.of(editMode ? [] : hideFormattingPlugin),
            EditorView.updateListener.of((update) => {
              if (update.docChanged) {
                const nextValue = update.state.doc.toString()
                // Trigger auto-save when content changes
                if (filePath) {
                  debouncedSave(nextValue)
                }
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
    }, [value, filePath, debouncedSave])

    // Handle global copy/paste shortcuts
    useEffect(() => {
      if (!window.editor || !window.clipboard) return

      const handleCopy = () => {
        if (editorViewRef.current) {
          const view = editorViewRef.current
          const selection = view.state.selection
          if (!selection.main.empty) {
            const text = view.state.sliceDoc(selection.main.from, selection.main.to)
            window.clipboard.writeText(text)
          }
        }
      }

      const handleCut = () => {
        if (editorViewRef.current) {
          const view = editorViewRef.current
          const selection = view.state.selection
          if (!selection.main.empty) {
            const text = view.state.sliceDoc(selection.main.from, selection.main.to)
            window.clipboard.writeText(text)
            view.dispatch({
              changes: { from: selection.main.from, to: selection.main.to, insert: '' }
            })
          }
        }
      }

      const handlePaste = (text: string) => {
        if (editorViewRef.current) {
          const view = editorViewRef.current
          const selection = view.state.selection
          const changes = selection.main.empty
            ? { from: selection.main.head, insert: text }
            : { from: selection.main.from, to: selection.main.to, insert: text }

          view.dispatch({
            changes,
            selection: { anchor: selection.main.from + text.length }
          })
        }
      }

      const handleSelectAll = () => {
        if (editorViewRef.current) {
          const view = editorViewRef.current
          view.dispatch({
            selection: { anchor: 0, head: view.state.doc.length }
          })
        }
      }

      // Register event listeners
      const removeListeners = [
        window.editor.onRequestCopy(handleCopy),
        window.editor.onRequestCut(handleCut),
        window.editor.onPasteText(handlePaste),
        window.editor.onRequestSelectAll(handleSelectAll)
      ]

      // Cleanup
      return () => {
        removeListeners.forEach((listener) => listener())
      }
    }, [])

    return (
      <div className="flex-1 flex flex-col">
        {/* Header: File name + Mode toggle */}
        <div className="flex justify-between items-center py-2 px-4 border-b border-gray-200 bg-gray-50">
          <span className="text-sm text-gray-600 font-medium">{fileName || 'Untitled'}</span>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setEditMode((prev) => !prev)}
            title={`${editMode ? 'Read' : 'Edit'} mode (Cmd/Ctrl+E)`}
          >
            {editMode ? <BookOpen /> : <Pencil />}
          </Button>
        </div>
        <div
          className="flex flex-col w-3xl mx-auto flex-1"
          ref={editorContainerRef}
          style={{
            padding: 0,
            minHeight: 300,
            outline: 'none'
          }}
        />
        {/* Auto-save status bar */}
        <div className="flex justify-between items-center p-2 border-b border-gray-200 bg-gray-50 text-xs text-gray-500">
          <div className="flex items-center space-x-2">
            {isSaving && (
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                <span>Saving...</span>
              </div>
            )}
            {lastSaved && !isSaving && <span>Last saved: {lastSaved.toLocaleTimeString()}</span>}
          </div>
          {filePath && <span className="text-gray-400">Auto-save enabled</span>}
        </div>
      </div>
    )
  }
)

MarkdownViewer.displayName = 'MarkdownViewer'

export default MarkdownViewer
