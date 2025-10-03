import { ReactNode, useEffect, useState, createContext, useCallback } from 'react'
import { useContextMenu } from '../hooks/useContextMenu'
import type { ContextMenuContext, ContextMenuCommandType } from '../types/context-menu'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger
} from '../../../components/ui'

interface ContextMenuProviderProps {
  children: ReactNode
}

// Context for providing showContextMenu function to children
interface NavigatorContextMenuContextValue {
  showContextMenu: (context: ContextMenuContext, event?: React.MouseEvent) => void
}

export const NavigatorContextMenuContext = createContext<NavigatorContextMenuContextValue | null>(
  null
)

export const ContextMenuProvider = ({ children }: ContextMenuProviderProps) => {
  const { getMenuItems, handleContextMenuCommand } = useContextMenu()
  const [menuContext, setMenuContext] = useState<ContextMenuContext | null>(null)

  // Handle Electron context menu commands
  useEffect(() => {
    const handleMainProcessCommand = (cmd: string, ...args: unknown[]) => {
      const itemPath = args[0] as string | undefined
      handleContextMenuCommand({ id: cmd as ContextMenuCommandType, itemPath })
    }

    if (!window.WEB_VERSION) {
      window.contextMenu.onCommand(handleMainProcessCommand)
    }

    return () => {
      if (!window.WEB_VERSION) {
        window.contextMenu.removeListener()
      }
    }
  }, [handleContextMenuCommand])

  const showContextMenu = useCallback(
    (context: ContextMenuContext, event?: React.MouseEvent) => {
      if (!window.WEB_VERSION) {
        // Electron version - prevent default and show native menu
        if (event) {
          event.preventDefault()
          event.stopPropagation()
        }
        window.contextMenu.show(context)
      } else {
        // Web version - update state but let event bubble to Radix trigger
        setMenuContext(context)
      }
    },
    []
  )

  if (window.WEB_VERSION) {
    // Web version using shadcn components
    return (
      <NavigatorContextMenuContext.Provider value={{ showContextMenu }}>
        <ContextMenu
          onOpenChange={(open) => {
            if (!open) {
              // Delay clearing context to avoid showing empty menu during close animation
              setTimeout(() => setMenuContext(null), 200)
            }
          }}
        >
          <ContextMenuTrigger asChild>
            <div
              className="flex-1 flex flex-col"
              onContextMenu={(e) => {
                // Handle empty area clicks (when clicking directly on this div)
                if (e.target === e.currentTarget) {
                  showContextMenu({ type: 'empty-area' }, e)
                }
              }}
            >
              {children}
            </div>
          </ContextMenuTrigger>
          {menuContext && (
            <ContextMenuContent>
              {getMenuItems(menuContext).map((item) => (
                <ContextMenuItem
                  key={item.id}
                  onSelect={() => {
                    handleContextMenuCommand({
                      id: item.id,
                      itemPath: menuContext.itemPath
                    })
                  }}
                  variant={item.variant}
                >
                  {item.label}
                </ContextMenuItem>
              ))}
            </ContextMenuContent>
          )}
        </ContextMenu>
      </NavigatorContextMenuContext.Provider>
    )
  }

  // Electron version - provide context and handle native menus
  return (
    <NavigatorContextMenuContext.Provider value={{ showContextMenu }}>
      <div className="flex-1 flex flex-col">{children}</div>
    </NavigatorContextMenuContext.Provider>
  )
}
