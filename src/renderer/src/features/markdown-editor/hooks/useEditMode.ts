import { useState, useEffect } from 'react'
import { EditorView } from '@codemirror/view'
import { editableCompartment, hideFormattingCompartment } from '../utils/compartments'
import { hideFormattingPlugin } from '../config/formatting-decorations'

export function useEditMode(editorView: EditorView | null) {
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
    if (!editorView) return

    editorView.dispatch({
      effects: [
        editableCompartment.reconfigure(EditorView.editable.of(editMode)),
        hideFormattingCompartment.reconfigure(editMode ? [] : hideFormattingPlugin)
      ]
    })

    // Focus/blur based on mode
    if (editMode) {
      editorView.focus()
    } else {
      editorView.contentDOM.blur()
    }
  }, [editMode, editorView])

  return { editMode, setEditMode }
}
