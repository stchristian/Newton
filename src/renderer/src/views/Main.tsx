import React, {  useRef } from 'react'
import MarkdownViewer, { MarkdownViewerRef } from '../components/MarkdownViewer'
import { Sidebar } from '../components/layout'
import Header from '../components/layout/Header'
import { useWorkspace } from '@renderer/shared/hooks/useWorkspace'


export default function Main(): React.ReactElement {
  const { activeNote, saveActiveNote } = useWorkspace()
  const editorRef = useRef<MarkdownViewerRef>(null)

  const handleSave = (markdown: string): void => {
    saveActiveNote(markdown)
  }

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        {activeNote && (
          <MarkdownViewer
            ref={editorRef}
            value={activeNote.markdownContent}
            fileName={activeNote.name}
            filePath={activeNote.path}
            onSave={handleSave}
          />
        )}
      </div>
    </div>
  )
}
