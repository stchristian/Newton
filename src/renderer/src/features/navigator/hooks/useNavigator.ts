import { useWorkspace } from '@renderer/shared/hooks/useWorkspace'
import { TreeItem, useNavigatorStore } from '../stores/navigator-store'
import { StorageService } from '@renderer/features/storage'

export const useNavigator = () => {
  const {
    setDraftItem,
    setRenameItem,
    toggleFolderExpansion,
    cancelDraftItem,
    saveDraftItem,
    deleteRecursively,
    draftItem,
    draftMode,
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
    setDraftItem('directory', path)
  }

  const handleAddNote = (path: string = workspaceFolder!) => {
    if (!expandedFolderPaths.has(path)) {
      // Auto-expand if not already
      const item = getTreeItemByPath(path, treeItems)
      handleFolderExpand(item as TreeItem)
    }
    setDraftItem('note', path)
  }

  const openContextMenu = (itemPath: string) => {
    console.log('Context menu:', itemPath)
  }

  const handleSaveDraft = async (name: string) => {
    if (!draftItem || !draftMode) return

    if (draftMode === 'add') {
      // Adding new item
      const parentPath = draftItem.path.substring(0, draftItem.path.lastIndexOf('/'))

      if (draftItem.type === 'directory') {
        const finalPath = `${parentPath}/${name}`
        await StorageService.createFolder(finalPath)
      } else if (draftItem.type === 'note') {
        const fileName = `${name}.md`
        await StorageService.createFile(parentPath, fileName, '')
      }
    } else if (draftMode === 'rename') {
      // Renaming existing item
      const originalPath = draftItem.path
      const parentPath = originalPath.substring(0, originalPath.lastIndexOf('/'))
      const displayName = draftItem.type === 'note' ? `${name}.md` : name
      const newPath = `${parentPath}/${displayName}`

      await StorageService.renameFile(originalPath, newPath)
    }

    saveDraftItem(name)
  }

  const handleCancelDraft = () => {
    cancelDraftItem()
  }

  const handleRename = (itemPath: string) => {
    // Get parent path and check if parent folder needs to be expanded
    const parentPath = itemPath.substring(0, itemPath.lastIndexOf('/'))

    if (parentPath && !expandedFolderPaths.has(parentPath)) {
      // Auto-expand parent if not already
      const item = getTreeItemByPath(parentPath, treeItems)
      if (item) {
        handleFolderExpand(item as TreeItem)
      }
    }

    setRenameItem(itemPath)
  }

  const handleDelete = async (itemPath: string) => {
    await StorageService.deleteRecursively(itemPath)
    deleteRecursively(itemPath)
  }

  return {
    handleAddFolder,
    handleAddNote,
    handleFolderExpand,
    handleCancelDraft,
    handleSaveDraft,
    handleRename,
    handleDelete,
    openContextMenu,
    draftItem
  }
}
