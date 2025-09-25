import { ReactNode, useEffect, useState } from 'react'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger
} from '../../../components/ui'
import { useContextMenu } from '../hooks/useContextMenu'
import { useNavigator } from '../hooks/useNavigator'
import type {
  ContextMenuContext,
  ContextMenuCommand
} from '../types/context-menu'

interface ContextMenuProviderProps {
  children: ReactNode | ((showContextMenu: (context: ContextMenuContext) => void) => ReactNode)
  onContextMenu?: (context: ContextMenuContext) => void
}

export const ContextMenuProvider = ({ children, onContextMenu }: ContextMenuProviderProps) => {
  const { getMenuItems } = useContextMenu()
  const { handleAddFolder, handleAddNote, handleRename, handleDelete } = useNavigator()
  const [currentContext, setCurrentContext] = useState<ContextMenuContext | null>(null)

  // Handle Electron context menu commands
  useEffect(() => {
    const handleCommand = (cmd: string, ...args: unknown[]) => {
      const itemPath = args[0] as string | undefined
      handleContextMenuCommand(cmd as ContextMenuCommand, itemPath)
    }

    if (!window.WEB_VERSION) {
      window.api.contextMenu.onCommand(handleCommand)
    }

    return () => {
      if (!window.WEB_VERSION) {
        window.api.contextMenu.removeListener()
      }
    }
  }, [handleAddFolder, handleAddNote, handleRename, handleDelete])

  const handleContextMenuCommand = (command: ContextMenuCommand, itemPath?: string) => {
    switch (command) {
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

  const showContextMenu = (context: ContextMenuContext) => {
    setCurrentContext(context)
    onContextMenu?.(context)

    if (!window.WEB_VERSION) {
      // Electron version - show native menu
      window.api.contextMenu.show(context)
    }
    // Web version - will show shadcn context menu automatically
  }

  const handleWebContextMenuSelect = (command: ContextMenuCommand) => {
    if (currentContext) {
      handleContextMenuCommand(command, currentContext.itemPath)
    }
  }

  if (window.WEB_VERSION) {
    // Web version using shadcn components
    return (
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div
            className="flex-1"
            onContextMenu={(e) => {
              // Determine context based on event target
              const target = e.target as HTMLElement
              const isEmpty = target.classList.contains('tree-view') || target.closest('.tree-view') === target

              if (isEmpty) {
                showContextMenu({ type: 'empty-area' })
              }
            }}
          >
            {typeof children === 'function' ? children(showContextMenu) : children}
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          {currentContext && getMenuItems(currentContext).map((item) => (
            <ContextMenuItem
              key={item.id}
              onClick={() => handleWebContextMenuSelect(item.id)}
              variant={item.variant}
            >
              {item.label}
            </ContextMenuItem>
          ))}
        </ContextMenuContent>
      </ContextMenu>
    )
  }

  // Electron version - just a wrapper div that handles context menu events
  return (
    <div
      className="flex-1"
      onContextMenu={(e) => {
        e.preventDefault()
        // Determine context based on event target
        const target = e.target as HTMLElement
        const isEmpty = target.classList.contains('tree-view') || target.closest('.tree-view') === target

        if (isEmpty) {
          showContextMenu({ type: 'empty-area' })
        }
      }}
    >
      {typeof children === 'function' ? children(showContextMenu) : children}
    </div>
  )
}