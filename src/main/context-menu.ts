import { ipcMain, Menu } from 'electron'

ipcMain.on('show-context-menu', (event, path: string) => {
  let template: Array<Electron.MenuItem | Electron.MenuItemConstructorOptions> = []
  if (path) {
    template = [
      {
        label: 'New',
        accelerator: 'CmdOrCtrl+N',
        click: () => event.sender.send('context-menu-command', 'new')
      },
      {
        label: 'New folder',
        click: () => event.sender.send('context-menu-command', 'create-folder')
      },
      { type: 'separator' },
      {
        label: 'Rename',
        click: () => event.sender.send('context-menu-command', 'rename')
      },
      {
        label: 'Remove',
        accelerator: 'CmdOrCtrl+S',
        click: async () => {
          event.sender.send('context-menu-command', 'remove', path)
        }
      }
    ]
  } else {
    template = [
      {
        label: 'New',
        accelerator: 'CmdOrCtrl+N',
        click: () => event.sender.send('context-menu-command', 'new')
      },
      {
        label: 'New folder',
        click: () => event.sender.send('context-menu-command', 'create-folder')
      }
    ]
  }
  const menu = Menu.buildFromTemplate(template)
  menu.popup()
})
