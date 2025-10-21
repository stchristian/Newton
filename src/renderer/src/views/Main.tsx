import React from 'react'
import { MarkdownEditor } from '@renderer/features/markdown-editor'
import { Sidebar } from '../components/layout'
import Header from '../components/layout/Header'
import { useWorkspace } from '@renderer/shared/hooks/useWorkspace'

export default function Main(): React.ReactElement {
  const { activeNote } = useWorkspace()

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        {activeNote && <MarkdownEditor fileName={activeNote.name} filePath={activeNote.path} />}
      </div>
    </div>
  )
}
