import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger
} from '../../../components/ui'
import { useNavigator } from '../hooks/useNavigator'
import { useContextMenu } from '@renderer/shared/hooks/useContextMenu'
import { ReactNode } from 'react'

interface ContextMenuProviderProps {
  children: ReactNode
}

export const ContextMenuProvider = ({ children }: ContextMenuProviderProps) => {
  // Set up context menu listeners
  useContextMenu()
  const { handleAddFolder, handleAddNote } = useNavigator()

  return (
    <ContextMenu>
      <ContextMenuTrigger className="flex-1">
        <div
          onContextMenu={() => {
            if (!window.WEB_VERSION) {
              window.api.contextMenu.show()
              return false
            }
            return true
          }}
        >
          <div className="flex-1 overflow-y-auto">{children}</div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={() => handleAddNote()}>New note</ContextMenuItem>
        <ContextMenuItem onClick={() => handleAddFolder()}>New folder</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}
