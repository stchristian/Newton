import { useState, useEffect, useRef, useImperativeHandle, forwardRef, useCallback } from 'react'
import { EditorState } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { markdown as cmMarkdown } from '@codemirror/lang-markdown'
import { syntaxHighlighting, HighlightStyle } from '@codemirror/language'
import { tags } from '@lezer/highlight'
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

// const hideFormatting = ViewPlugin.fromClass(
//   class {
//     decorations: DecorationSet
//     constructor(view: EditorView) {
//       this.decorations = buildFormattingDecorations(view)
//     }
//     update(update: ViewUpdate): void {
//       if (update.docChanged || update.viewportChanged) {
//         this.decorations = buildFormattingDecorations(update.view)
//     }
//   },
//   { decorations: (v: { decorations: DecorationSet }) => v.decorations }
// )

const MarkdownViewer = forwardRef<MarkdownViewerRef, MarkdownViewerProps>(
  ({ value, fileName, filePath, onSave, autoSaveDelay = 2000 }, ref) => {
    const [isSaving, setIsSaving] = useState(false)
    const [lastSaved, setLastSaved] = useState<Date | null>(null)

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
            // hideFormatting,
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
      if (!window.api) return

      const handleCopy = () => {
        if (editorViewRef.current) {
          const view = editorViewRef.current
          const selection = view.state.selection
          if (!selection.main.empty) {
            const text = view.state.sliceDoc(selection.main.from, selection.main.to)
            window.api.clipboard.writeText(text)
          }
        }
      }

      const handleCut = () => {
        if (editorViewRef.current) {
          const view = editorViewRef.current
          const selection = view.state.selection
          if (!selection.main.empty) {
            const text = view.state.sliceDoc(selection.main.from, selection.main.to)
            window.api.clipboard.writeText(text)
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
        window.api.onRequestCopy(handleCopy),
        window.api.onRequestCut(handleCut),
        window.api.onPasteText(handlePaste),
        window.api.onRequestSelectAll(handleSelectAll)
      ]

      // Cleanup
      return () => {
        removeListeners.forEach((listener) => listener())
      }
    }, [])

    return (
      <div className="flex-1 flex flex-col">
        {/* File name display */}
        {fileName && (
          <div className="text-center py-2 border-b border-gray-200 bg-gray-50">
            <span className="text-sm text-gray-600 font-medium">{fileName}</span>
          </div>
        )}
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
