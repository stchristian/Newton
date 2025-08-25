import { clipboard, ipcMain } from 'electron'

ipcMain.handle('set-clipboard-text', async (_, text: string) => {
  clipboard.writeText(text)
  return true
})

ipcMain.handle('get-clipboard-text', async () => {
  return clipboard.readText()
})
