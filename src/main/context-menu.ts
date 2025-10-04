import { ipcMain, Menu } from 'electron'
import type { ContextMenuContext } from '../renderer/src/features/navigator'
import { CONTEXT_MENU_ITEMS } from '../renderer/src/features/navigator'

ipcMain.on('show-context-menu', (event, context: ContextMenuContext) => {
  const items = CONTEXT_MENU_ITEMS[context.type] || []

  const template: Array<Electron.MenuItem | Electron.MenuItemConstructorOptions> = []

  items.forEach((item, index) => {
    // Add separator before destructive items
    if (index > 0 && item.variant === 'destructive') {
      template.push({ type: 'separator' })
    }

    if (item.type === 'separator') {
      template.push({ type: 'separator' })
      return
    }

    if (!item.id) return // Skip items without id
    template.push({
      label: item.label,
      click: () => event.sender.send('context-menu-command', item.id, context.itemPath)
    })
  })

  const menu = Menu.buildFromTemplate(template)
  menu.popup()
})
