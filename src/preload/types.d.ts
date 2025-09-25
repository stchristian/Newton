export interface FileSystemItem {
  name: string
  path: string
  type: 'directory' | 'note' | 'unknown'
}

export interface FileSystemAPI {
  openFolder: () => Promise<string | null>
  readDirectory: (folderPath: string) => Promise<FileSystemItem[]>
  readFile: (filePath: string) => Promise<string>
  writeFile: (filePath: string, content: string) => Promise<boolean>
  deleteFile: (folderPath: string) => Promise<boolean>
  createFile: (folderPath: string, fileName: string, content: string) => Promise<string>
  createFolder: (folderPath: string) => Promise<boolean>
  renameFile: (filePath: string, newPath: string) => Promise<boolean>
  contextMenu: {
    show: (context: import('../renderer/src/features/navigator').ContextMenuContext) => void
    onCommand: (cb: (cmd: string, ...args: unknown[]) => void) => void
    removeListener: () => void
  }
  clipboard: {
    readText: () => Promise<string>
    writeText: (text: string) => Promise<boolean>
  }
  onRequestCopy: (callback: () => void) => () => void
  onRequestCut: (callback: () => void) => () => void
  onPasteText: (callback: (text: string) => void) => () => void
  onRequestSelectAll: (callback: () => void) => () => void
}
