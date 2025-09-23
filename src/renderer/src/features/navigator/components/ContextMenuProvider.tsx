import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger
} from '../../../components/ui'
import { useNavigator } from '../hooks/useNavigator'
import { ReactNode, useEffect } from 'react'

interface ContextMenuProviderProps {
  children: ReactNode
}

function useContextMenuHandler() {
  const { handleAddFolder, handleAddNote } = useNavigator()

  useEffect(() => {
    window.api.contextMenu.onCommand((cmd, ...args) => {
      switch (cmd) {
        case 'new':
          handleAddNote()
        case 'create-folder':
          handleAddFolder()
          break
        case 'remove': {
          const path = args[0] as string
          break
        }
        case 'rename': {
          const path = args[0] as string
          console.log('path', path)
          // if (path) {
          //   set({ pathOfFileUnderRename: path })
          //   set({ newNameOfFileUnderRename: path.split('/').pop() })
          // }
          break
        }
      }
    })

    return () => {
      window.api.contextMenu.removeListener()
    }
  }, [])
}

export const ContextMenuProvider = ({ children }: ContextMenuProviderProps) => {
  // Set up context menu listeners
  useContextMenuHandler()
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
