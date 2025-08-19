import React, { useState, useRef, useEffect } from 'react'
import MarkdownViewer, { MarkdownViewerRef } from '../components/MarkdownViewer'
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

  // Ref to focus the editor
  const editorRef = useRef<MarkdownViewerRef>(null)

  // Initialize workspace on component mount for web version
  // useEffect(() => {
  //   const initializeWorkspace = async () => {
  //     if (!workspaceFolder) {
  //       try {
  //         const folder = await window.api.openFolder()
  //         setWorkspaceFolder(folder)
  //       } catch (error) {
  //         console.error('Failed to initialize workspace:', error)
  //       }
  //     }
  //   }

  //   initializeWorkspace()
  // }, [workspaceFolder])

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
      <Sidebar
        workspaceFolder={workspaceFolder}
        onChangeWorkspaceFolder={setWorkspaceFolder}
        onDocumentClick={handleDocumentClick}
        activeFilePath={activeDocument?.path}
      />
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
