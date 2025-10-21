import { forwardRef, useImperativeHandle, useRef, useEffect, useState } from 'react'
import { useCodeMirror } from '../hooks/useCodeMirror'
import { useEditMode } from '../hooks/useEditMode'
import { useEditorEvents } from '../hooks/useEditorEvents'

export interface EditorContentProps {
  initialValue: string
  onContentChange?: (content: string) => void
}

export interface EditorContentRef {
  focus: () => void
  getEditMode: () => boolean
  setEditMode: (editMode: boolean) => void
}

export const EditorContent = forwardRef<EditorContentRef, EditorContentProps>(
  ({ initialValue, onContentChange }, ref) => {
    const containerRef = useRef<HTMLDivElement | null>(null)
    const [editModeState, setEditModeState] = useState(true)

    // Initialize CodeMirror
    const editorView = useCodeMirror(containerRef.current, {
      initialValue,
      editMode: true,
      onDocChange: onContentChange
    })

    // Edit mode toggle
    const { editMode, setEditMode } = useEditMode(editorView)

    // Sync local state with hook state
    useEffect(() => {
      setEditModeState(editMode)
    }, [editMode])

    // Editor events (copy/paste/cut/selectAll)
    useEditorEvents(editorView)

    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
      focus: () => {
        if (editorView) {
          editorView.focus()
        }
      },
      getEditMode: () => editModeState,
      setEditMode: (mode: boolean) => setEditMode(mode)
    }))

    return (
      <div
        className="flex flex-col w-3xl mx-auto flex-1"
        ref={containerRef}
        style={{
          padding: 0,
          minHeight: 300,
          outline: 'none'
        }}
      />
    )
  }
)

EditorContent.displayName = 'EditorContent'
