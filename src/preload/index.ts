import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { FileSystemAPI } from './types'

const api: FileSystemAPI = {
  openFolder: () => ipcRenderer.invoke('open-folder'),
  readDirectory: (folderPath: string) => ipcRenderer.invoke('read-directory', folderPath),
  readFile: (filePath: string) => ipcRenderer.invoke('read-file', filePath),
  writeFile: (filePath: string, content: string) =>
    ipcRenderer.invoke('write-file', filePath, content),
  createFile: (folderPath: string, fileName: string, content: string) =>
    ipcRenderer.invoke('create-file', folderPath, fileName, content),
  contextMenu: {
    show: (path?: string) => ipcRenderer.send('show-context-menu', path),
    onCommand: (cb: (cmd: string, ...args: unknown[]) => void) =>
      ipcRenderer.on('context-menu-command', (_e, cmd, ...args) => cb(cmd, ...args)),
    removeListener: () => ipcRenderer.removeAllListeners('context-menu-command')
  },
  createFolder: (filePath: string) => ipcRenderer.invoke('create-folder', filePath),
  deleteFile: (filePath: string) => ipcRenderer.invoke('delete-file', filePath)
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
