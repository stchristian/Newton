import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  openFolder: () => ipcRenderer.invoke('open-folder'),
  readDirectory: (folderPath: string) => ipcRenderer.invoke('read-directory', folderPath),
  readFile: (filePath: string) => ipcRenderer.invoke('read-file', filePath),
  writeFile: (filePath: string, content: string) =>
    ipcRenderer.invoke('write-file', filePath, content),
  createFile: (folderPath: string, fileName: string, content: string) =>
    ipcRenderer.invoke('create-file', folderPath, fileName, content),
  contextMenu: {
    show: () => ipcRenderer.send('show-context-menu'),
    onCommand: (cb: (cmd: string) => void) =>
      ipcRenderer.on('context-menu-command', (_e, cmd) => cb(cmd)),
    removeListener: (cb: (cmd: string) => void) => {
      ipcRenderer.removeListener('context-menu-command', (_e, cmd) => cb(cmd))
    }
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
}
