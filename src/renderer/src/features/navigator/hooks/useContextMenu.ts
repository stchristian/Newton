import { useCallback } from 'react'
import type {
  ContextMenuItem,
  ContextMenuContext,
  ContextMenuCommandType
} from '../types/context-menu'
import { CONTEXT_MENU_ITEMS } from '../types/context-menu'
import { useNavigator } from './useNavigator'

export const useContextMenu = () => {
  const getMenuItems = useCallback((context: ContextMenuContext): ContextMenuItem[] => {
    return CONTEXT_MENU_ITEMS[context.type] || []
  }, [])

  const { handleAddFolder, handleAddNote, handleRename, handleDelete } = useNavigator()

  const handleContextMenuCommand = ({
    id,
    itemPath
  }: {
    id: ContextMenuCommandType
    itemPath?: string
  }) => {
    switch (id) {
      case 'new-folder':
        handleAddFolder(itemPath)
        break
      case 'new-note':
        handleAddNote(itemPath)
        break
      case 'rename':
        if (itemPath) handleRename(itemPath)
        break
      case 'delete':
        if (itemPath) handleDelete(itemPath)
        break
    }
  }

  return { getMenuItems, handleContextMenuCommand }
}
