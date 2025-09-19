import { useWorkspace } from '@renderer/shared/hooks/useWorkspace'
import { TreeItem, useNavigatorStore } from '../stores/navigator-store'
import { FileSystemService } from '@renderer/features/storage/services/fileSystemService'

export const useNavigator = () => {
  const { setNewItem, toggleFolderExpansion } = useNavigatorStore()
  const { workspaceFolder } = useWorkspace()

  const handleAddFolder = (path: string = workspaceFolder!) => {
    setNewItem('directory', path)
  }

  const handleAddNote = (path: string = workspaceFolder!) => {
    setNewItem('note', path)
  }

  const handleFolderExpand = async (treeItem: TreeItem) => {
    if (!treeItem.children) {
      const children = await FileSystemService.readDirectory(treeItem.path)
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

  return {
    handleAddFolder,
    handleAddNote,
    handleFolderExpand,
    openContextMenu
  }
}
