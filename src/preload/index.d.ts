import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    fileSystem: import('./types').FileSystemAPI
    contextMenu: import('./types').ContextMenuAPI
    clipboard: import('./types').ClipboardAPI
    editor: import('./types').EditorAPI
    WEB_VERSION: boolean
  }
}
