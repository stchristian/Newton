import { useEffect } from 'react'
import { useFileSystemStore } from '../../stores/file-system-store'

export const useContextMenu = () => {
  const { handleContextMenuCommand } = useFileSystemStore()

  useEffect(() => {
    window.api.contextMenu.onCommand(handleContextMenuCommand)

    return () => {
      window.api.contextMenu.removeListener()
    }
  }, [handleContextMenuCommand])
}
