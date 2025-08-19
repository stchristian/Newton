import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: import('./types').FileSystemAPI
    WEB_VERSION: boolean
  }
}
