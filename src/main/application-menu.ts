import { BrowserWindow, clipboard, app, Menu } from 'electron'

export function createApplicationMenu(mainWindow: BrowserWindow) {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'placeholder', // https://www.electronjs.org/docs/latest/api/menu#main-menus-name
      submenu: []
    },
    {
      label: 'Edit',
      submenu: [
        {
          label: 'Copy',
          accelerator: 'CmdOrCtrl+C',
          click: () => {
            // Request copy from the focused editor
            mainWindow?.webContents.send('request-copy')
          }
        },
        {
          label: 'Cut',
          accelerator: 'CmdOrCtrl+X',
          click: () => {
            // Request cut from the focused editor
            mainWindow?.webContents.send('request-cut')
          }
        },
        {
          label: 'Paste',
          accelerator: 'CmdOrCtrl+V',
          click: () => {
            // Get text from clipboard and send to renderer
            const text = clipboard.readText()
            mainWindow?.webContents.send('paste-text', text)
          }
        },
        { type: 'separator' },
        {
          label: 'Select All',
          accelerator: 'CmdOrCtrl+A',
          click: () => {
            mainWindow?.webContents.send('request-select-all')
          }
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Toggle Developer Tools',
          accelerator: 'CmdOrCtrl+Alt+I',
          click: () => {
            mainWindow?.webContents.openDevTools({
              mode: 'right'
            })
          }
        },
        { type: 'separator' },
        {
          label: 'Reload Window',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            mainWindow?.reload()
          }
        },
        {
          label: 'Hard Reload Window',
          accelerator: 'CmdOrCtrl+Shift+R',
          click: () => {
            mainWindow?.webContents.reloadIgnoringCache()
          }
        },
        {
          label: 'Restart App',
          accelerator: 'CmdOrCtrl+Shift+Alt+R',
          click: () => {
            app.relaunch()
            app.exit(0)
          }
        }
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}
