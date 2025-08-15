import { app, shell, BrowserWindow, ipcMain, screen, dialog, Menu } from 'electron'
import { join } from 'path'
import { readdir, stat, readFile, writeFile } from 'fs/promises'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

function createWindow(): void {
  const template = [
    {
      label: 'View',
      submenu: [
        {
          label: 'Toggle Developer Tools',
          accelerator: 'CmdOrCtrl+Alt+I',
          click: () => {
            mainWindow.webContents.openDevTools({
              mode: 'right'
            })
          }
        }
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
  // Create the browser window with size equal to the screen size.
  const primaryDisplay = screen.getPrimaryDisplay()
  const { width, height } = primaryDisplay.workAreaSize

  const mainWindow = new BrowserWindow({
    width,
    height,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  // IPC handlers for file system operations
  ipcMain.handle('open-folder', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory']
    })

    if (!result.canceled && result.filePaths.length > 0) {
      return result.filePaths[0]
    }
    return null
  })

  ipcMain.handle('read-directory', async (_, folderPath: string) => {
    try {
      const items = await readdir(folderPath)
      const fileList = await Promise.all(
        items.map(async (item) => {
          const itemPath = join(folderPath, item)
          const stats = await stat(itemPath)
          return {
            name: item,
            path: itemPath,
            isDirectory: stats.isDirectory(),
            isFile: stats.isFile()
          }
        })
      )
      return fileList
    } catch (error) {
      console.error('Error reading directory:', error)
      throw error
    }
  })

  ipcMain.handle('read-file', async (_, filePath: string) => {
    try {
      const content = await readFile(filePath, 'utf-8')
      return content
    } catch (error) {
      console.error('Error reading file:', error)
      throw error
    }
  })

  ipcMain.handle('write-file', async (_, filePath: string, content: string) => {
    try {
      await writeFile(filePath, content, 'utf-8')
      return true
    } catch (error) {
      console.error('Error writing file:', error)
      throw error
    }
  })

  ipcMain.on('show-context-menu', (event) => {
    const template = [
      {
        label: 'New',
        accelerator: 'CmdOrCtrl+N',
        click: () => event.sender.send('context-menu-command', 'new')
      },
      {
        label: 'Open…',
        accelerator: 'CmdOrCtrl+O',
        click: () => event.sender.send('context-menu-command', 'open')
      },
      {
        label: 'Save',
        accelerator: 'CmdOrCtrl+S',
        click: () => event.sender.send('context-menu-command', 'save')
      }
    ]
    const menu = Menu.buildFromTemplate(template)
    menu.popup()
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
