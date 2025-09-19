import { create } from 'zustand'

type TreeItemType = 'note' | 'directory'

export interface TreeItem {
  displayName: string
  path: string
  type: TreeItemType
  children?: TreeItem[]
}

interface NewItem {
  type: TreeItemType
  name: string
  path: string
}

interface NavigatorStore {
  treeItems: TreeItem[]
  expandedFolderPaths: Set<string>

  newItem: NewItem | null

  toggleFolderExpansion: (treeItem: TreeItem) => Promise<void>
  initializeNavigator: (treeItems: TreeItem[]) => void
  setNewItem: (type: TreeItemType, path: string) => void
}

export const useNavigatorStore = create<NavigatorStore>((set) => ({
  treeItems: [],
  expandedFolderPaths: new Set(),

  newItem: null,

  setNewItem: (type: TreeItemType, path: string) => {
    set({
      newItem: {
        name: type === 'note' ? 'New note' : 'New folder',
        type,
        path
      }
    })
  },

  toggleFolderExpansion: async (treeItem: TreeItem) => {
    if (treeItem.type !== 'directory') return

    set((state) => {
      const expandedFolderPaths = new Set(state.expandedFolderPaths)
      if (expandedFolderPaths.has(treeItem.path)) {
        expandedFolderPaths.delete(treeItem.path)
      } else {
        expandedFolderPaths.add(treeItem.path)
      }
      return { expandedFolderPaths }
    })
  },

  initializeNavigator: async (treeItems: TreeItem[]) => {
    set({ treeItems, expandedFolderPaths: new Set() })
  }
}))
