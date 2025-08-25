// IPC handlers for file system operations

import { dialog, ipcMain } from 'electron'
import { readdir, stat, readFile, unlink, writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

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

ipcMain.handle('delete-file', async (_, filePath: string) => {
  try {
    await unlink(filePath)
    return true
  } catch (error) {
    console.error('Error removing file:', error)
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

ipcMain.handle('create-folder', async (_, filePath: string) => {
  try {
    await mkdir(filePath)
    return true
  } catch (error) {
    console.error('Error creating folder:', error)
    throw error
  }
})

ipcMain.handle('create-file', async (_, folderPath: string, fileName: string, content: string) => {
  try {
    const filePath = join(folderPath, fileName)
    await writeFile(filePath, content, 'utf-8')
    return filePath
  } catch (error) {
    console.error('Error creating file:', error)
    throw error
  }
})
