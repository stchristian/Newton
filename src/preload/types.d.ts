export interface FileSystemItem {
  name: string
  path: string
  type: 'directory' | 'note' | 'unknown'
}

// Segregated interfaces following SRP and ISP
export interface FileSystemAPI {
  openFolder: () => Promise<string | null>
  readDirectory: (folderPath: string) => Promise<FileSystemItem[]>
  readFile: (filePath: string) => Promise<string>
  writeFile: (filePath: string, content: string) => Promise<boolean>
  deleteFile: (folderPath: string) => Promise<boolean>
  createFile: (folderPath: string, fileName: string, content: string) => Promise<string>
  createFolder: (folderPath: string) => Promise<boolean>
  renameFile: (filePath: string, newPath: string) => Promise<boolean>
}

export interface ContextMenuAPI {
  show: (context: import('../renderer/src/features/navigator').ContextMenuContext) => void
  onCommand: (cb: (cmd: string, ...args: unknown[]) => void) => void
  removeListener: () => void
}

export interface ClipboardAPI {
  readText: () => Promise<string>
  writeText: (text: string) => Promise<boolean>
}

export interface EditorAPI {
  onRequestCopy: (callback: () => void) => () => void
  onRequestCut: (callback: () => void) => () => void
  onPasteText: (callback: (text: string) => void) => () => void
  onRequestSelectAll: (callback: () => void) => () => void
}
