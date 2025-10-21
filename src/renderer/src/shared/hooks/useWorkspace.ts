import { StorageService } from '@renderer/features/storage'
import { useWorkspaceStore } from '../../stores/workspace-store'
import { useNavigatorStore } from '@renderer/features/navigator/stores/navigator-store'
import { useCallback, useMemo } from 'react'

export const useWorkspace = () => {
  const { workspaceFolder, setWorkspaceFolder, setActiveNote, activeNote } = useWorkspaceStore()

  const { initializeNavigator } = useNavigatorStore()

  const openWorkspace = async () => {
    try {
      const folderPath = await StorageService.openFolder()
      if (folderPath) {
        setWorkspaceFolder(folderPath)

        const items = await StorageService.readDirectory(folderPath)
        initializeNavigator(
          items.map((item) => ({
            displayName: item.name,
            path: item.path,
            type: item.type
          }))
        )
      }
    } catch (error) {
      console.error('Error opening workspace:', error)
    }
  }

  const openNote = useCallback(
    (path: string): void => {
      console.log('Opening note:', path)
      if (!StorageService.isMarkdownFile(path)) {
        return
      }

      const name = StorageService.getFileName(path)
      setActiveNote({
        name,
        path
      })
    },
    [setActiveNote]
  )

  const activeNotePath = useMemo(() => {
    return activeNote?.path
  }, [activeNote])

  return {
    hasOpenedWorkspace: !!workspaceFolder,
    workspaceFolder,
    activeNotePath,
    activeNote,
    setWorkspaceFolder,
    openWorkspace,
    openNote
  }
}
