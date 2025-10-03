import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { FileSystemAPI, ContextMenuAPI, ClipboardAPI, EditorAPI } from './types'

// File system operations API
const fileSystem: FileSystemAPI = {
  openFolder: () => ipcRenderer.invoke('open-folder'),
  readDirectory: (folderPath: string) => ipcRenderer.invoke('read-directory', folderPath),
  readFile: (filePath: string) => ipcRenderer.invoke('read-file', filePath),
  writeFile: (filePath: string, content: string) =>
    ipcRenderer.invoke('write-file', filePath, content),
  createFile: (folderPath: string, fileName: string, content: string) =>
    ipcRenderer.invoke('create-file', folderPath, fileName, content),
  renameFile: (filePath: string, newPath: string) =>
    ipcRenderer.invoke('rename-file', filePath, newPath),
  createFolder: (filePath: string) => ipcRenderer.invoke('create-folder', filePath),
  deleteFile: (filePath: string) => ipcRenderer.invoke('delete-file', filePath)
}

// Context menu API
const contextMenu: ContextMenuAPI = {
  show: (context: import('../renderer/src/features/navigator').ContextMenuContext) =>
    ipcRenderer.send('show-context-menu', context),
  onCommand: (cb: (cmd: string, ...args: unknown[]) => void) =>
    ipcRenderer.on('context-menu-command', (_e, cmd, ...args) => cb(cmd, ...args)),
  removeListener: () => ipcRenderer.removeAllListeners('context-menu-command')
}

// Clipboard operations API
const clipboard: ClipboardAPI = {
  readText: () => ipcRenderer.invoke('get-clipboard-text'),
  writeText: (text: string) => ipcRenderer.invoke('set-clipboard-text', text)
}

// Editor event handlers API
const editor: EditorAPI = {
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
    contextBridge.exposeInMainWorld('fileSystem', fileSystem)
    contextBridge.exposeInMainWorld('contextMenu', contextMenu)
    contextBridge.exposeInMainWorld('clipboard', clipboard)
    contextBridge.exposeInMainWorld('editor', editor)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.fileSystem = fileSystem
  // @ts-ignore (define in dts)
  window.contextMenu = contextMenu
  // @ts-ignore (define in dts)
  window.clipboard = clipboard
  // @ts-ignore (define in dts)
  window.editor = editor
  // @ts-ignore (define in dts)
  window.WEB_VERSION = false
}
