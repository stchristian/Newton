import { useEffect, useRef } from 'react'
import { EditorState } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { markdown as cmMarkdown } from '@codemirror/lang-markdown'
import { config } from '@renderer/components/EditorConfig'
import { livePreviewExtension } from '../config/live-preview-styles'
import { editableCompartment, hideFormattingCompartment } from '../utils/compartments'
import { hideFormattingPlugin } from '../config/formatting-decorations'

interface UseCodeMirrorOptions {
  initialValue: string
  editMode: boolean
  onDocChange?: (content: string) => void
}

export function useCodeMirror(
  container: HTMLDivElement | null,
  { initialValue, editMode, onDocChange }: UseCodeMirrorOptions
): EditorView | null {
  const editorViewRef = useRef<EditorView | null>(null)

  useEffect(() => {
    if (!container || editorViewRef.current) return

    const state = EditorState.create({
      doc: initialValue,
      extensions: [
        config,
        cmMarkdown(),
        EditorView.lineWrapping,
        livePreviewExtension,
        editableCompartment.of(EditorView.editable.of(editMode)),
        hideFormattingCompartment.of(editMode ? [] : hideFormattingPlugin),
        EditorView.updateListener.of((update) => {
          if (update.docChanged && onDocChange) {
            const nextValue = update.state.doc.toString()
            onDocChange(nextValue)
          }
        })
      ]
    })

    editorViewRef.current = new EditorView({
      state,
      parent: container
    })

    return () => {
      if (editorViewRef.current) {
        editorViewRef.current.destroy()
        editorViewRef.current = null
      }
    }
  }, [container, editMode, onDocChange])

  return editorViewRef.current
}
