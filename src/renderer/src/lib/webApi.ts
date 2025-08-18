import { FileSystemAPI, FileSystemItem } from '../../../preload/types'

export interface Document {
  id: string
  name: string
  path: string
  content: string
  lastModified: number
}

class WebAPI implements FileSystemAPI {
  private documents: Map<string, Document> = new Map()
  private currentWorkspace: string | null = null

  constructor() {
    this.loadFromStorage()

    // Add sample documents if none exist
    if (this.documents.size === 0) {
      this.addSampleDocuments()
    }
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('markdown-documents')
      if (stored) {
        const docs = JSON.parse(stored) as Document[]
        this.documents.clear()
        docs.forEach((doc) => this.documents.set(doc.path, doc))
      }
    } catch (error) {
      console.error('Failed to load documents from storage:', error)
    }
  }

  private saveToStorage(): void {
    try {
      const docs = Array.from(this.documents.values())
      localStorage.setItem('markdown-documents', JSON.stringify(docs))
    } catch (error) {
      console.error('Failed to save documents to storage:', error)
    }
  }

  async openFolder(): Promise<string> {
    // In web version, we'll use a virtual workspace
    this.currentWorkspace = '/workspace'
    return this.currentWorkspace
  }

  async readDirectory(folderPath: string): Promise<FileSystemItem[]> {
    const items: FileSystemItem[] = []

    // Add virtual folders
    items.push({
      name: 'Documents',
      path: '/workspace/documents',
      isDirectory: true,
      isFile: false
    })

    // Add markdown files
    for (const doc of this.documents.values()) {
      if (doc.path.startsWith(folderPath)) {
        items.push({
          name: doc.name,
          path: doc.path,
          isDirectory: false,
          isFile: true
        })
      }
    }

    return items
  }

  async readFile(filePath: string): Promise<string> {
    const doc = this.documents.get(filePath)
    if (doc) {
      return doc.content
    }
    throw new Error(`File not found: ${filePath}`)
  }

  async writeFile(filePath: string, content: string) {
    const doc = this.documents.get(filePath)
    if (doc) {
      doc.content = content
      doc.lastModified = Date.now()
      this.documents.set(filePath, doc)
      this.saveToStorage()
      return true
    } else {
      throw new Error(`File not found: ${filePath}`)
      return false
    }
  }

  async createFile(folderPath: string, fileName: string, content: string): Promise<string> {
    const filePath = `${folderPath}/${fileName}`
    const doc: Document = {
      id: Date.now().toString(),
      name: fileName,
      path: filePath,
      content,
      lastModified: Date.now()
    }

    this.documents.set(filePath, doc)
    this.saveToStorage()
    return filePath
  }

  contextMenu = {
    show: () => {
      // Web version - could implement custom context menu
      console.log('Context menu requested')
    },
    onCommand: () => {}
  }

  private addSampleDocuments(): void {
    const samples = [
      {
        name: 'Welcome.md',
        content: `# Welcome to Markdown Editor

This is a web version of your markdown editor.

## Features
- **Bold text** and *italic text*
- \`Code blocks\` and \`\`\`code fences\`\`\`
- [Links](https://example.com)
- Lists like this one

## Getting Started
1. Create new documents using the "Add note" button
2. Edit content in the editor
3. See live preview as you type
4. All changes are saved automatically to your browser

Try editing this document to see the live preview!`
      },
      {
        name: 'Getting Started.md',
        content: `# Getting Started Guide

## How to Use This Editor

### Creating Documents
- Click "Add note" to create a new markdown file
- Give your file a name (it will automatically add .md extension)

### Editing
- Click on any markdown file in the sidebar to open it
- Edit the content in the left panel
- See the live preview in the right panel

### Saving
- Changes are automatically saved to your browser's local storage
- Your documents will persist between browser sessions

### Markdown Syntax
- Use \`#\` for headings
- Use \`**bold**\` for **bold text**
- Use \`*italic*\` for *italic text*
- Use \`\`\` for code blocks

Happy writing!`
      }
    ]

    samples.forEach((sample, index) => {
      const doc: Document = {
        id: (index + 1).toString(),
        name: sample.name,
        path: `/workspace/documents/${sample.name}`,
        content: sample.content,
        lastModified: Date.now()
      }
      this.documents.set(doc.path, doc)
    })

    this.saveToStorage()
  }
}

// Expose the API globally for web
if (typeof window.api === 'undefined') {
  window.api = new WebAPI()
}
