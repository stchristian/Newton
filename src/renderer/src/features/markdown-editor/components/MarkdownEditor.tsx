import { useRef, useCallback } from 'react'
import { MarkdownEditorProps } from '../types/editor'
import { useAutoSave } from '../hooks/useAutoSave'
import { useNoteContent } from '../hooks/useNoteContent'
import { EditorHeader } from './EditorHeader'
import { EditorStatusBar } from './EditorStatusBar'
import { EditorContent, EditorContentRef } from './EditorContent'

export const MarkdownEditor = ({ fileName, filePath }: MarkdownEditorProps) => {
  const editorRef = useRef<EditorContentRef>(null)

  // Load note content from file
  const { content } = useNoteContent(filePath)
  console.log('Loaded content:', content)

  // Auto-save hook
  const { isSaving, lastSaved, save } = useAutoSave(filePath)

  // Handle content changes from editor
  const handleContentChange = useCallback(
    (content: string) => {
      if (filePath) {
        save(content)
      }
    },
    [filePath, save]
  )

  // Toggle edit mode
  const handleToggleMode = () => {
    if (editorRef.current) {
      const currentMode = editorRef.current.getEditMode()
      editorRef.current.setEditMode(!currentMode)
    }
  }

  return (
    <div className="flex-1 flex flex-col">
      <EditorHeader
        fileName={fileName}
        editMode={editorRef.current?.getEditMode() ?? true}
        onToggleMode={handleToggleMode}
      />
      {/* Force remount EditorContent when filePath changes to reinitialize CodeMirror with new content */}
      <EditorContent
        key={filePath}
        ref={editorRef}
        initialValue={content}
        onContentChange={handleContentChange}
      />
      <EditorStatusBar isSaving={isSaving} lastSaved={lastSaved} filePath={filePath} />
    </div>
  )
}

MarkdownEditor.displayName = 'MarkdownEditor'
