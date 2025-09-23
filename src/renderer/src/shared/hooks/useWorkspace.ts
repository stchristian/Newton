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

      void (async () => {
        try {
          const content = await StorageService.readFile(path)
          const name = StorageService.getFileName(path)
          setActiveNote({
            name,
            markdownContent: content,
            path
          })
        } catch (error) {
          console.error('Failed to open markdown file:', error)
        }
      })()
    },
    [setActiveNote]
  )

  const activeNotePath = useMemo(() => {
    return activeNote?.path
  }, [activeNote])

  const saveActiveNote = useCallback(
    async (markdown: string) => {
      if (!activeNote) return
      await StorageService.writeFile(activeNote.path, markdown)
      setActiveNote({
        ...activeNote,
        markdownContent: markdown
      })
    },
    [activeNote, setActiveNote]
  )

  return {
    hasOpenedWorkspace: !!workspaceFolder,
    workspaceFolder,
    activeNotePath,
    activeNote,
    setWorkspaceFolder,
    openWorkspace,
    openNote,
    saveActiveNote
  }
}
