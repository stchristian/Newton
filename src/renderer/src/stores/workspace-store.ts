import { create } from 'zustand'
import type { WorkspaceState, WorkspaceActions } from '../shared/types/workspace'
import { FileSystemService } from '../features/file-explorer'

interface WorkspaceStore extends WorkspaceState, WorkspaceActions {
  initializeWorkspace: (folder: string | null) => Promise<void>
}

export const useWorkspaceStore = create<WorkspaceStore>((set, get) => ({
  // Initial state
  workspaceFolder: null,
  activeFilePath: null,

  // Actions
  setWorkspaceFolder: (folder) => set({ workspaceFolder: folder }),
  setActiveFilePath: (path) => set({ activeFilePath: path }),

  openWorkspace: async () => {
    try {
      const folderPath = await FileSystemService.openFolder()
      if (folderPath) {
        await get().initializeWorkspace(folderPath)
      }
    } catch (error) {
      console.error('Error opening workspace:', error)
    }
  },

  initializeWorkspace: async (folder: string | null) => {
    set({ workspaceFolder: folder })

    if (folder) {
      // Initialize file system store with the new workspace
      const { useFileSystemStore } = await import('./file-system-store')
      const fileSystemStore = useFileSystemStore.getState()

      fileSystemStore.setCurrentFolder(folder)
      fileSystemStore.setFolderHistory([folder])

      try {
        const items = await FileSystemService.readDirectory(folder)
        fileSystemStore.setFolderItems(items)
      } catch (error) {
        console.error('Error reading workspace folder:', error)
      }
    }
  }
}))
