import {
  FileSystemAPI,
  FileSystemItem,
  ContextMenuAPI,
  ClipboardAPI,
  EditorAPI
} from '../../../preload/types'

interface WorkspaceItem extends FileSystemItem {
  content?: string
}

interface Workspace {
  path: string
  name: string
  items: WorkspaceItem[]
}

// Web implementation of FileSystemAPI
class WebFileSystem implements FileSystemAPI {
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
    if (doc && doc.content !== undefined) {
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
    }
    throw new Error(`File not found: ${filePath}`)
  }

  async createFile(folderPath: string, fileName: string, content: string): Promise<string> {
    const filePath = `${folderPath}/${fileName}`
    const doc: WorkspaceItem = {
      name: fileName,
      path: filePath,
      type: 'note',
      content
    }

    this.currentWorkspace?.items.push(doc)
    this.saveToStorage()
    return filePath
  }

  async deleteFile(filePath: string): Promise<boolean> {
    this.currentWorkspace!.items =
      this.currentWorkspace!.items.filter((item) => item.path !== filePath) || []
    this.saveToStorage()
    return true
  }

  async createFolder(filePath: string): Promise<boolean> {
    // In web version, we'll just create a new folder in the workspace
    const name = filePath.split('/').pop() || 'New Folder'
    this.currentWorkspace?.items.push({
      name,
      path: filePath,
      type: 'directory'
    })
    this.saveToStorage()
    return true
  }

  async renameFile(filePath: string, newPath: string): Promise<boolean> {
    const doc = this.currentWorkspace?.items.find((item) => item.path === filePath)
    if (doc) {
      doc.path = newPath
      doc.name = newPath.split('/').pop() || doc.name
      this.saveToStorage()
      return true
    }
    return false
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
        type: 'note',
        content: sample.content
      }
      this.currentWorkspace?.items.push(doc)
    })

    this.saveToStorage()
  }
}

// Web implementation of ContextMenuAPI
class WebContextMenu implements ContextMenuAPI {
  show(context: import('../features/navigator').ContextMenuContext): void {
    // Web version - will be handled by shadcn context menu
    console.log('Context menu requested for', context)
  }

  onCommand(_cb: (cmd: string, ...args: unknown[]) => void): void {
    // Web version - commands handled directly by component
  }

  removeListener(): void {
    // Web version - no cleanup needed
  }
}

// Web implementation of ClipboardAPI
class WebClipboard implements ClipboardAPI {
  async readText(): Promise<string> {
    return navigator.clipboard.readText()
  }

  async writeText(text: string): Promise<boolean> {
    await navigator.clipboard.writeText(text)
    return true
  }
}

// Web implementation of EditorAPI
class WebEditor implements EditorAPI {
  onRequestCopy(_callback: () => void): () => void {
    return () => {}
  }

  onRequestCut(_callback: () => void): () => void {
    return () => {}
  }

  onPasteText(_callback: (text: string) => void): () => void {
    return () => {}
  }

  onRequestSelectAll(_callback: () => void): () => void {
    return () => {}
  }
}

// Expose segregated APIs globally for web
if (typeof window.fileSystem === 'undefined') {
  window.fileSystem = new WebFileSystem()
  window.contextMenu = new WebContextMenu()
  window.clipboard = new WebClipboard()
  window.editor = new WebEditor()
  window.WEB_VERSION = true
}
