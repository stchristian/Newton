import { useWorkspace } from '@renderer/shared/hooks/useWorkspace'
import { TreeItem, useNavigatorStore } from '../stores/navigator-store'
import { StorageService } from '@renderer/features/storage'

export const useNavigator = () => {
  const { setNewItem, toggleFolderExpansion, newItem, cancelNewItem, saveNewItem } =
    useNavigatorStore()
  const { workspaceFolder } = useWorkspace()

  const handleAddFolder = (path: string = workspaceFolder!) => {
    setNewItem('directory', path)
  }

  const handleAddNote = (path: string = workspaceFolder!) => {
    setNewItem('note', path)
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

  const handleDelete = (itemPath: string) => {
    console.log('Delete operation for:', itemPath)
    // TODO: Implement delete functionality
    // This would involve:
    // 1. Showing confirmation dialog
    // 2. Calling StorageService.deleteFile
    // 3. Updating the tree state
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
