// Components
export { Navigator } from './components/Navigator'

// Types
export type { FileSystemItem, FileCreationState } from '../storage/types/file-system'

// Context Menu Types (for cross-layer access while maintaining navigator ownership)
export type {
  ContextMenuType,
  ContextMenuCommandType as ContextMenuCommand,
  ContextMenuContext,
  ContextMenuItem
} from './types/context-menu'

export { CONTEXT_MENU_ITEMS } from './types/context-menu'
