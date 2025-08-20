import { useCallback } from 'react'
import { useFileSystemStore } from '../../../stores/file-system-store'
import { FileSystemService } from '../services/fileSystemService'
import type { FileSystemItem } from '../types/file-system'

export const useFileSystem = () => {
  const {
    currentFolder,
    folderHistory,
    folderItems,
    isAddingNewItem,
    newItemType,
    newItemName,
    targetDirectory,
    setCurrentFolder,
    setFolderHistory,
    setFolderItems,
    refreshFolder,
    navigateToFolder,
    setIsAddingNewItem,
    setNewItemType,
    setNewItemName,
    setTargetDirectory,
    resetFileCreation,
    createNewItem,
    deleteItem,
    handleContextMenuCommand
  } = useFileSystemStore()

  const handleItemClick = useCallback((item: FileSystemItem) => {
    if (item.isFile && FileSystemService.isMarkdownFile(item.path)) {
      // This will be handled by the parent component
      return item.path
    }
    return null
  }, [])

  const handleFolderExpand = useCallback(async (folderPath: string) => {
    try {
      return await FileSystemService.readDirectory(folderPath)
    } catch (error) {
      console.error('Error expanding folder:', error)
      return []
    }
  }, [])

  const handleContextMenu = useCallback(
    (itemPath: string, itemType: 'file' | 'directory') => {
      if (window.WEB_VERSION) {
        return false
      }

      if (itemType === 'directory') {
        setTargetDirectory(itemPath)
      } else {
        setTargetDirectory(currentFolder)
      }

      window.api.contextMenu.show(itemPath)
      return false
    },
    [currentFolder, setTargetDirectory]
  )

  const filteredItems = folderItems.filter((item) => !item.name.startsWith('.'))

  return {
    // State
    currentFolder,
    folderHistory,
    folderItems: filteredItems,
    isAddingNewItem,
    newItemType,
    newItemName,
    targetDirectory,

    // Actions
    setCurrentFolder,
    setFolderHistory,
    setFolderItems,
    refreshFolder,
    navigateToFolder,
    setIsAddingNewItem,
    setNewItemType,
    setNewItemName,
    setTargetDirectory,
    resetFileCreation,
    createNewItem,
    deleteItem,
    handleContextMenuCommand,

    // Event handlers
    handleItemClick,
    handleFolderExpand,
    handleContextMenu
  }
}
