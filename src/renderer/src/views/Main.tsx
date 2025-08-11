import React, { useState } from 'react'
import MarkdownViewer from '../components/MarkdownViewer'
import Sidebar from '../components/Sidebar'

interface Document {
  id: number
  name: string
  path: string
  markdownContent: string
}

export default function Main(): React.ReactElement {
  const [activeDocument, setActiveDocument] = useState<Document | null>(null)

  // Workspace folder selected by the user
  const [workspaceFolder, setWorkspaceFolder] = useState<string | null>(null)

  // Track the current document by id for easier updates

  const handleSave = (markdown: string): void => {
    if (!activeDocument) return
    void (async () => {
      try {
        await window.api.writeFile(activeDocument.path, markdown)
        setActiveDocument((prev) => (prev ? { ...prev, markdownContent: markdown } : prev))
      } catch (error) {
        console.error('Failed to save markdown file:', error)
      }
    })()
  }

  const handleDocumentClick = (path: string): void => {
    const isMarkdown = /\.(md|mdx|markdown)$/i.test(path)
    if (!isMarkdown) return

    void (async () => {
      try {
        const content = await window.api.readFile(path)
        const name = path.split('/').pop() ?? path
        setActiveDocument({ id: Date.now(), name, markdownContent: content, path })
      } catch (error) {
        console.error('Failed to open markdown file:', error)
      }
    })()
  }

  return (
    <div className="flex h-screen">
      <Sidebar
        workspaceFolder={workspaceFolder}
        onChangeWorkspaceFolder={setWorkspaceFolder}
        onDocumentClick={handleDocumentClick}
      />
      {activeDocument && (
        <MarkdownViewer value={activeDocument.markdownContent} onSave={handleSave} />
      )}
    </div>
  )
}
