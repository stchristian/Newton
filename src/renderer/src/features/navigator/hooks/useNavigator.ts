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
    const finalPath = `${parentPath}/${name}` + (newItem.type === 'note' ? '.md' : '')

    if (newItem.type === 'directory') {
      await StorageService.createFolder(finalPath)
    } else if (newItem.type === 'note') {
      console.log('Creating note at:', finalPath)
      await StorageService.writeFile(finalPath, '')
    }
    saveNewItem(name)
  }

  const handleCancelNewItem = () => {
    cancelNewItem()
  }

  return {
    handleAddFolder,
    handleAddNote,
    handleFolderExpand,
    handleCancelNewItem,
    handleSaveNewItem,
    openContextMenu,
    newItem
  }
}
