import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron'
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
  renameFile: (filePath: string, newPath: string) =>
    ipcRenderer.invoke('rename-file', filePath, newPath),
  contextMenu: {
    show: (path?: string) => ipcRenderer.send('show-context-menu', path),
    onCommand: (cb: (cmd: string, ...args: unknown[]) => void) =>
      ipcRenderer.on('context-menu-command', (_e, cmd, ...args) => cb(cmd, ...args)),
    removeListener: () => ipcRenderer.removeAllListeners('context-menu-command')
  },
  createFolder: (filePath: string) => ipcRenderer.invoke('create-folder', filePath),
  deleteFile: (filePath: string) => ipcRenderer.invoke('delete-file', filePath),
  clipboard: {
    readText: () => ipcRenderer.invoke('get-clipboard-text'),
    writeText: (text: string) => ipcRenderer.invoke('set-clipboard-text', text)
  },
  // Add new clipboard operations
  onRequestCopy: (callback: () => void) => {
    ipcRenderer.on('request-copy', callback)
    return () => ipcRenderer.removeListener('request-copy', callback)
  },
  onRequestCut: (callback: () => void) => {
    ipcRenderer.on('request-cut', callback)
    return () => ipcRenderer.removeListener('request-cut', callback)
  },
  onPasteText: (callback: (text: string) => void) => {
    const wrappedCallback = (_e: IpcRendererEvent, text: string) => callback(text)
    ipcRenderer.on('paste-text', wrappedCallback)
    return () => ipcRenderer.removeListener('paste-text', wrappedCallback)
  },
  onRequestSelectAll: (callback: () => void) => {
    ipcRenderer.on('request-select-all', callback)
    return () => ipcRenderer.removeListener('request-select-all', callback)
  }
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
  // @ts-ignore (define in dts)
  window.WEB_VERSION = false
}
