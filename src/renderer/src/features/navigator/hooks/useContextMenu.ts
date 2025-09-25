import { useCallback } from 'react'
import type { ContextMenuItem, ContextMenuContext } from '../types/context-menu'
import { CONTEXT_MENU_ITEMS } from '../types/context-menu'

export const useContextMenu = () => {
  const getMenuItems = useCallback((context: ContextMenuContext): ContextMenuItem[] => {
    return CONTEXT_MENU_ITEMS[context.type] || []
  }, [])

  return { getMenuItems }
}
