import { create } from 'zustand'
import type {
  FileSystemItem,
  FileCreationState,
  FileSystemNavigation
} from '../features/file-explorer/types/file-system'
import { FileSystemService } from '../features/file-explorer'

interface FileSystemStore extends FileSystemNavigation, FileCreationState {
  // Actions
  setCurrentFolder: (folder: string | null) => void
  setFolderHistory: (history: string[]) => void
  setFolderItems: (items: FileSystemItem[]) => void
  refreshFolder: () => Promise<void>
  navigateToFolder: (folderPath: string, historyIndex: number) => Promise<void>

  // File creation actions
  setIsAddingNewItem: (isAdding: boolean) => void
  setNewItemType: (type: 'note' | 'folder') => void
  setNewItemName: (name: string) => void
  setTargetDirectory: (directory: string | null) => void
  resetFileCreation: () => void

  // File operations
  createNewItem: () => Promise<void>
  deleteItem: (path: string) => Promise<void>

  // Context menu
  handleContextMenuCommand: (cmd: string, ...args: unknown[]) => Promise<void>
}

export const useFileSystemStore = create<FileSystemStore>((set, get) => ({
  // Initial state
  currentFolder: null,
  folderHistory: [],
  folderItems: [],

  // File creation state
  isAddingNewItem: false,
  newItemType: 'note',
  newItemName: '',
  targetDirectory: null,

  // Navigation actions
  setCurrentFolder: (folder) => set({ currentFolder: folder }),
  setFolderHistory: (history) => set({ folderHistory: history }),
  setFolderItems: (items) => set({ folderItems: items }),

  refreshFolder: async () => {
    const { currentFolder } = get()
    if (!currentFolder) return

    try {
      const items = await FileSystemService.readDirectory(currentFolder)
      set({ folderItems: items })
    } catch (error) {
      console.error('Error refreshing folder:', error)
    }
  },

  navigateToFolder: async (folderPath: string, historyIndex: number) => {
    try {
      const items = await FileSystemService.readDirectory(folderPath)
      const newHistory = get().folderHistory.slice(0, historyIndex + 1)

      set({
        folderItems: items,
        currentFolder: folderPath,
        folderHistory: newHistory
      })
    } catch (error) {
      console.error('Error navigating to folder:', error)
    }
  },

  // File creation actions
  setIsAddingNewItem: (isAdding) => set({ isAddingNewItem: isAdding }),
  setNewItemType: (type) => set({ newItemType: type }),
  setNewItemName: (name) => set({ newItemName: name }),
  setTargetDirectory: (directory) => set({ targetDirectory: directory }),

  resetFileCreation: () =>
    set({
      isAddingNewItem: false,
      newItemName: '',
      targetDirectory: null
    }),

  // File operations
  createNewItem: async () => {
    const { newItemType, newItemName, targetDirectory, currentFolder, refreshFolder } = get()
    const createInDirectory = targetDirectory || currentFolder

    if (!createInDirectory || !newItemName.trim()) {
      get().resetFileCreation()
      return
    }

    try {
      if (newItemType === 'note') {
        const fileName = newItemName.endsWith('.md') ? newItemName : `${newItemName}.md`
        const content = `# ${fileName.replace('.md', '')}\n\n`

        await FileSystemService.createFile(createInDirectory, fileName, content)
      } else if (newItemType === 'folder') {
        await FileSystemService.createFolder(`${createInDirectory}/${newItemName}`)
      }

      await refreshFolder()
      get().resetFileCreation()
    } catch (error) {
      console.error('Error creating item:', error)
      get().resetFileCreation()
    }
  },

  deleteItem: async (path: string) => {
    try {
      await FileSystemService.deleteFile(path)
      await get().refreshFolder()
    } catch (error) {
      console.error('Error deleting item:', error)
    }
  },

  // Context menu
  handleContextMenuCommand: async (cmd: string, ...args: unknown[]) => {
    const { setNewItemType, setIsAddingNewItem, setNewItemName, deleteItem } = get()

    switch (cmd) {
      case 'new':
        setNewItemType('note')
        setIsAddingNewItem(true)
        setNewItemName('')
        break
      case 'create-folder':
        setNewItemType('folder')
        setIsAddingNewItem(true)
        setNewItemName('')
        break
      case 'remove': {
        const path = args[0] as string
        await deleteItem(path)
        break
      }
    }
  }
}))
