import { FileSystemAPI, FileSystemItem } from '../../../preload/types'

interface WorkspaceItem extends FileSystemItem {
  content?: string
}

interface Workspace {
  path: string
  name: string
  items: WorkspaceItem[]
}

class WebAPI implements FileSystemAPI {
  private currentWorkspace: Workspace | null = null

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('workspace')
      if (stored) {
        const workspace = JSON.parse(stored) as Workspace
        this.currentWorkspace = workspace
      } else {
        this.currentWorkspace = {
          path: '/workspace',
          name: 'Workspace',
          items: []
        }

        this.addSampleDocuments()
      }
    } catch (error) {
      console.error('Failed to load documents from storage:', error)
    }
  }

  private saveToStorage(): void {
    if (this.currentWorkspace) {
      localStorage.setItem('workspace', JSON.stringify(this.currentWorkspace))
    }
  }

  async openFolder(): Promise<string> {
    // In web version, we'll use a virtual workspace
    this.loadFromStorage()
    return this.currentWorkspace?.path || ''
  }

  async readDirectory(folderPath: string): Promise<FileSystemItem[]> {
    return (
      this.currentWorkspace?.items.filter(
        (item) => item.path.startsWith(folderPath) && item.path !== folderPath
      ) || []
    )
  }

  async readFile(filePath: string): Promise<string> {
    const doc = this.currentWorkspace?.items.find((item) => item.path === filePath)
    if (doc) {
      return doc.content
    }
    throw new Error(`File not found: ${filePath}`)
  }

  async writeFile(filePath: string, content: string) {
    const doc = this.currentWorkspace?.items.find((item) => item.path === filePath)
    if (doc) {
      doc.content = content
      this.saveToStorage()
      return true
    } else {
      throw new Error(`File not found: ${filePath}`)
      return false
    }
  }

  async createFile(folderPath: string, fileName: string, content: string): Promise<string> {
    const filePath = `${folderPath}/${fileName}`
    const doc: WorkspaceItem = {
      name: fileName,
      path: filePath,
      content,
      isFile: true,
      isDirectory: false
    }

    this.currentWorkspace?.items.push(doc)
    this.saveToStorage()
    return filePath
  }

  contextMenu = {
    show: () => {
      // Web version - could implement custom context menu
      console.log('Context menu requested')
    },
    onCommand: () => {},
    removeListener: () => {}
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

    samples.forEach((sample) => {
      const doc: WorkspaceItem = {
        name: sample.name,
        path: `/workspace/${sample.name}`,
        isFile: true,
        isDirectory: false,
        content: sample.content
      }
      this.currentWorkspace?.items.push(doc)
    })

    this.saveToStorage()
  }

  deleteFile(filePath: string): Promise<boolean> {
    this.currentWorkspace!.items =
      this.currentWorkspace!.items.filter((item) => item.path !== filePath) || []
    this.saveToStorage()
    return Promise.resolve(true)
  }

  createFolder(filePath: string): Promise<boolean> {
    // In web version, we'll just create a new folder in the workspace
    const name = filePath.split('/').pop() || 'New Folder'
    this.currentWorkspace?.items.push({
      name,
      path: filePath,
      isFile: false,
      isDirectory: true
    })
    this.saveToStorage()
    return Promise.resolve(true)
  }
}

// Expose the API globally for web
if (typeof window.api === 'undefined') {
  window.api = new WebAPI()
  window.WEB_VERSION = true
}
