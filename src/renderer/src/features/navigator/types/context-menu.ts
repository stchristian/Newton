// Navigator context menu types - single source of truth for navigator feature

export type ContextMenuType = 'empty-area' | 'file' | 'folder'
export type ContextMenuCommandType = 'new-folder' | 'new-note' | 'rename' | 'delete'
export type ContextMenuCommandPayload = {
  id: ContextMenuCommandType
  itemPath?: string
}

export interface ContextMenuContext {
  type: ContextMenuType
  itemPath?: string
  itemType?: 'file' | 'directory'
}

export interface ContextMenuItem {
  id?: ContextMenuCommandType
  type?: 'separator'
  label?: string
  variant?: 'default' | 'destructive'
}

// Shared menu definitions to avoid duplication across layers
export const CONTEXT_MENU_ITEMS: Record<ContextMenuType, ContextMenuItem[]> = {
  'empty-area': [
    { id: 'new-folder', label: 'New folder' },
    { id: 'new-note', label: 'New note' }
  ],
  file: [
    { id: 'rename', label: 'Rename...' },
    { id: 'delete', label: 'Delete', variant: 'destructive' }
  ],
  folder: [
    { id: 'new-note', label: 'New note' },
    { id: 'new-folder', label: 'New folder' },
    { type: 'separator' },
    { id: 'rename', label: 'Rename...' },
    { id: 'delete', label: 'Delete', variant: 'destructive' }
  ]
}
