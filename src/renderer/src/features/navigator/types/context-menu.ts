// Navigator context menu types - single source of truth for navigator feature

export type ContextMenuType = 'empty-area' | 'file' | 'folder'
export type ContextMenuCommand = 'new-folder' | 'new-note' | 'rename' | 'delete'

export interface ContextMenuContext {
  type: ContextMenuType
  itemPath?: string
  itemType?: 'file' | 'directory'
}

export interface ContextMenuItem {
  id: ContextMenuCommand
  label: string
  variant?: 'default' | 'destructive'
}

// Shared menu definitions to avoid duplication across layers
export const CONTEXT_MENU_ITEMS: Record<ContextMenuType, ContextMenuItem[]> = {
  'empty-area': [
    { id: 'new-folder', label: 'New Folder' },
    { id: 'new-note', label: 'New Note' }
  ],
  'file': [
    { id: 'rename', label: 'Rename...' },
    { id: 'delete', label: 'Delete', variant: 'destructive' }
  ],
  'folder': [
    { id: 'rename', label: 'Rename...' },
    { id: 'delete', label: 'Delete', variant: 'destructive' }
  ]
}