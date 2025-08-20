import React, { useState, useRef, useEffect } from 'react'
import MarkdownViewer, { MarkdownViewerRef } from '../components/MarkdownViewer'
import { Sidebar } from '../components/layout'
import { useWorkspace } from '../shared/hooks/useWorkspace'
import { FileSystemService } from '../features/file-explorer'

interface Document {
  id: number
  name: string
  path: string
  markdownContent: string
}

export default function Main(): React.ReactElement {
  const [activeDocument, setActiveDocument] = useState<Document | null>(null)
  const { workspaceFolder, setActiveFilePath, initializeWorkspace } = useWorkspace()
  const editorRef = useRef<MarkdownViewerRef>(null)

  // Initialize workspace when component mounts
  useEffect(() => {
    if (workspaceFolder) {
      void initializeWorkspace(workspaceFolder)
    }
  }, [workspaceFolder, initializeWorkspace])

  const handleSave = (markdown: string): void => {
    if (!activeDocument) return
    void (async () => {
      try {
        await FileSystemService.writeFile(activeDocument.path, markdown)
        setActiveDocument((prev) => (prev ? { ...prev, markdownContent: markdown } : prev))
      } catch (error) {
        console.error('Failed to save markdown file:', error)
      }
    })()
  }

  const handleDocumentClick = (path: string): void => {
    if (!FileSystemService.isMarkdownFile(path)) return

    void (async () => {
      try {
        const content = await FileSystemService.readFile(path)
        const name = FileSystemService.getFileName(path)
        setActiveDocument({
          id: Date.now(),
          name,
          markdownContent: content,
          path
        })
        setActiveFilePath(path)

        // Focus the editor after a short delay to ensure it's rendered
        setTimeout(() => {
          editorRef.current?.focus()
        }, 100)
      } catch (error) {
        console.error('Failed to open markdown file:', error)
      }
    })()
  }

  return (
    <div className="flex h-screen">
      <Sidebar onDocumentClick={handleDocumentClick} />
      {activeDocument && (
        <MarkdownViewer
          ref={editorRef}
          value={activeDocument.markdownContent}
          fileName={activeDocument.name}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
