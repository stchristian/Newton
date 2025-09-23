import { create } from 'zustand'

type TreeItemType = 'note' | 'directory'

export interface TreeItem {
  displayName: string
  path: string
  type: TreeItemType
  children?: TreeItem[]
  draft?: boolean
}

interface NavigatorStore {
  treeItems: TreeItem[]
  expandedFolderPaths: Set<string>

  newItem: TreeItem | null

  toggleFolderExpansion: (treeItem: TreeItem) => Promise<void>
  initializeNavigator: (treeItems: TreeItem[]) => void
  setNewItem: (type: TreeItemType, parentPath: string) => void
  saveNewItem: (name: string) => void
  cancelNewItem: () => void
}

export const useNavigatorStore = create<NavigatorStore>((set) => ({
  treeItems: [],
  expandedFolderPaths: new Set(),

  newItem: null,

  setNewItem: (type: TreeItemType, parentPath: string) => {
    const name = type === 'note' ? 'New note' : 'New folder'

    const newItem = {
      displayName: name,
      type,
      path: `${parentPath}/${name}` + (type === 'note' ? '.md' : ''),
      draft: true
    }

    set((state) => ({
      newItem,
      treeItems: [...state.treeItems, newItem]
    }))
  },

  // TODO: flatten the TreeItems as the draft can be anywhere.
  saveNewItem: (name: string) => {
    set((state) => {
      if (!state.newItem) return {}

      const parentPath = state.newItem.path.substring(0, state.newItem.path.lastIndexOf('/'))
      const newPath = `${parentPath}/${name}` + (state.newItem.type === 'note' ? '.md' : '')

      return {
        newItem: null,
        treeItems: state.treeItems.map((item) =>
          item.draft
            ? {
                displayName: name,
                type: item.type,
                path: newPath,
                draft: false
              }
            : item
        )
      }
    })
  },

  // TODO: flatten the TreeItems as the draft can be anywhere.
  cancelNewItem: () => {
    set((state) => ({
      newItem: null,
      treeItems: state.treeItems.filter((item) => !item.draft)
    }))
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
