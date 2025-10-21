import { useEffect } from 'react'
import { EditorView } from '@codemirror/view'

export function useEditorEvents(editorView: EditorView | null) {
  useEffect(() => {
    if (!window.editor || !window.clipboard || !editorView) return

    const handleCopy = () => {
      const selection = editorView.state.selection
      if (!selection.main.empty) {
        const text = editorView.state.sliceDoc(selection.main.from, selection.main.to)
        window.clipboard.writeText(text)
      }
    }

    const handleCut = () => {
      const selection = editorView.state.selection
      if (!selection.main.empty) {
        const text = editorView.state.sliceDoc(selection.main.from, selection.main.to)
        window.clipboard.writeText(text)
        editorView.dispatch({
          changes: { from: selection.main.from, to: selection.main.to, insert: '' }
        })
      }
    }

    const handlePaste = (text: string) => {
      const selection = editorView.state.selection
      const changes = selection.main.empty
        ? { from: selection.main.head, insert: text }
        : { from: selection.main.from, to: selection.main.to, insert: text }

      editorView.dispatch({
        changes,
        selection: { anchor: selection.main.from + text.length }
      })
    }

    const handleSelectAll = () => {
      editorView.dispatch({
        selection: { anchor: 0, head: editorView.state.doc.length }
      })
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
  }, [editorView])
}
