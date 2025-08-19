export interface FileSystemItem {
  name: string
  path: string
  isDirectory: boolean
  isFile: boolean
}

export interface FileSystemAPI {
  openFolder: () => Promise<string | null>
  readDirectory: (folderPath: string) => Promise<FileSystemItem[]>
  readFile: (filePath: string) => Promise<string>
  writeFile: (filePath: string, content: string) => Promise<boolean>
  deleteFile: (folderPath: string) => Promise<boolean>
  createFile: (folderPath: string, fileName: string, content: string) => Promise<string>
  createFolder: (folderPath: string) => Promise<boolean>
  contextMenu: {
    show: (path?: string) => void
    onCommand: (cb: (cmd: string, ...args: unknown[]) => void) => void
    removeListener: () => void
  }
}
