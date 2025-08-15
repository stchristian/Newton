import { ElectronAPI } from '@electron-toolkit/preload'

interface FileSystemItem {
  name: string
  path: string
  isDirectory: boolean
  isFile: boolean
}

interface FileSystemAPI {
  openFolder: () => Promise<string | null>
  readDirectory: (folderPath: string) => Promise<FileSystemItem[]>
  readFile: (filePath: string) => Promise<string>
  writeFile: (filePath: string, content: string) => Promise<boolean>
  contextMenu: {
    show: () => void
    onCommand: (cb: (cmd: string) => void) => void
  }
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: FileSystemAPI
  }
}
