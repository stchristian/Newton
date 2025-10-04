import { useWorkspace } from '@renderer/shared/hooks/useWorkspace'
import { TreeItem, useNavigatorStore } from '../stores/navigator-store'
import { StorageService } from '@renderer/features/storage'

export const useNavigator = () => {
  const {
    setNewItem,
    toggleFolderExpansion,
    cancelNewItem,
    saveNewItem,
    deleteRecursively,
    newItem,
    expandedFolderPaths,
    treeItems
  } = useNavigatorStore()
  const { workspaceFolder } = useWorkspace()

  const getTreeItemByPath = (path: string, items: TreeItem[]): TreeItem | null => {
    for (const item of items) {
      if (item.path === path) return item
      if (item.type === 'directory' && item.children) {
        const found = getTreeItemByPath(path, item.children)
        if (found) return found
      }
    }
    return null
  }

  const handleFolderExpand = async (treeItem: TreeItem) => {
    if (!treeItem.children) {
      const children = await StorageService.readDirectory(treeItem.path)
      treeItem.children = children.map((child) => ({
        displayName: child.name,
        path: child.path,
        type: child.type
      }))
    }
    toggleFolderExpansion(treeItem)
  }

  const handleAddFolder = (path: string = workspaceFolder!) => {
    if (!expandedFolderPaths.has(path)) {
      // Auto-expand if not already
      const item = getTreeItemByPath(path, treeItems)
      handleFolderExpand(item as TreeItem)
    }
    setNewItem('directory', path)
  }

  const handleAddNote = (path: string = workspaceFolder!) => {
    if (!expandedFolderPaths.has(path)) {
      // Auto-expand if not already
      const item = getTreeItemByPath(path, treeItems)
      handleFolderExpand(item as TreeItem)
    }
    setNewItem('note', path)
  }

  const openContextMenu = (itemPath: string) => {
    console.log('Context menu:', itemPath)
  }

  const handleSaveNewItem = async (name: string) => {
    if (!newItem) return

    const parentPath = newItem.path.substring(0, newItem.path.lastIndexOf('/'))

    if (newItem.type === 'directory') {
      const finalPath = `${parentPath}/${name}`
      await StorageService.createFolder(finalPath)
    } else if (newItem.type === 'note') {
      const fileName = `${name}.md`
      console.log('Creating note at:', `${parentPath}/${fileName}`)
      await StorageService.createFile(parentPath, fileName, '')
    }
    saveNewItem(name)
  }

  const handleCancelNewItem = () => {
    cancelNewItem()
  }

  const handleRename = (itemPath: string) => {
    console.log('Rename operation for:', itemPath)
    // TODO: Implement rename functionality
    // This would involve:
    // 1. Setting the item to editing mode
    // 2. Allowing user to enter new name
    // 3. Calling StorageService.renameFile or similar
  }

  const handleDelete = async (itemPath: string) => {
    await StorageService.deleteRecursively(itemPath)
    deleteRecursively(itemPath)
  }

  return {
    handleAddFolder,
    handleAddNote,
    handleFolderExpand,
    handleCancelNewItem,
    handleSaveNewItem,
    handleRename,
    handleDelete,
    openContextMenu,
    newItem
  }
}
