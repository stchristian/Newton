import { create } from 'zustand'

type TreeItemType = 'note' | 'directory'
type DraftMode = 'add' | 'rename'

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

  draftItem: TreeItem | null
  draftMode: DraftMode | null

  toggleFolderExpansion: (treeItem: TreeItem) => Promise<void>
  initializeNavigator: (treeItems: TreeItem[]) => void
  setDraftItem: (type: TreeItemType, parentPath: string) => void
  setRenameItem: (path: string) => void
  saveDraftItem: (name: string) => void
  cancelDraftItem: () => void
  deleteRecursively: (path: string) => Promise<void>
}

export const useNavigatorStore = create<NavigatorStore>((set) => ({
  treeItems: [],
  expandedFolderPaths: new Set(),

  draftItem: null,
  draftMode: null,

  setDraftItem: (type: TreeItemType, parentPath: string) => {
    const name = type === 'note' ? 'New note' : 'New folder'

    const draftItem = {
      displayName: name,
      type,
      path: `${parentPath}/${name}` + (type === 'note' ? '.md' : ''),
      draft: true
    }

    set((state) => {
      // Helper function to recursively find parent and add draft item
      const findAndAddDraft = (items: TreeItem[], targetParentPath: string): { items: TreeItem[]; found: boolean } => {
        let found = false
        const newItems = items.map((item) => {
          // If this is the parent folder, add draft to its children
          if (item.path === targetParentPath && item.type === 'directory') {
            found = true
            return {
              ...item,
              children: [...(item.children || []), draftItem]
            }
          }
          // Recursively search in children
          if (item.type === 'directory' && item.children) {
            const result = findAndAddDraft(item.children, targetParentPath)
            if (result.found) {
              found = true
              return {
                ...item,
                children: result.items
              }
            }
          }
          return item
        })
        return { items: newItems, found }
      }

      // Check if parentPath is the workspace root by checking if it matches any root item's parent
      const isRootLevel = state.treeItems.length > 0 &&
        state.treeItems.some(item => {
          const itemParent = item.path.substring(0, item.path.lastIndexOf('/'))
          return itemParent === parentPath
        })

      return {
        draftItem,
        draftMode: 'add',
        treeItems: isRootLevel
          ? [...state.treeItems, draftItem]
          : findAndAddDraft(state.treeItems, parentPath).items
      }
    })
  },

  setRenameItem: (path: string) => {
    set((state) => {
      const markItemAsDraft = (items: TreeItem[]): TreeItem[] => {
        return items.map((item) => {
          if (item.path === path) {
            return { ...item, draft: true }
          }
          if (item.type === 'directory' && item.children) {
            return { ...item, children: markItemAsDraft(item.children) }
          }
          return item
        })
      }

      // Find the item to rename
      const findItem = (items: TreeItem[]): TreeItem | null => {
        for (const item of items) {
          if (item.path === path) return item
          if (item.type === 'directory' && item.children) {
            const found = findItem(item.children)
            if (found) return found
          }
        }
        return null
      }

      const itemToRename = findItem(state.treeItems)
      if (!itemToRename) return state

      return {
        draftItem: { ...itemToRename, draft: true },
        draftMode: 'rename',
        treeItems: markItemAsDraft(state.treeItems)
      }
    })
  },

  deleteRecursively: async (path: string) => {
    function removeChildren(items: TreeItem[], path: string): TreeItem[] {
      return items
        .filter((item) => !item.path.startsWith(path))
        .map((item) =>
          item.type === 'directory' && item.children
            ? { ...item, children: removeChildren(item.children, path) }
            : item
        )
    }

    set((state) => ({
      treeItems: removeChildren(state.treeItems, path),
      expandedFolderPaths: new Set(
        Array.from(state.expandedFolderPaths).filter((p) => !p.startsWith(path))
      )
    }))
  },

  saveDraftItem: (name: string) => {
    set((state) => {
      if (!state.draftItem || !state.draftMode) return {}

      if (state.draftMode === 'add') {
        // Adding new item
        const displayName = state.draftItem.type === 'note' ? `${name}.md` : name
        const parentPath = state.draftItem.path.substring(0, state.draftItem.path.lastIndexOf('/'))
        const newPath = `${parentPath}/${displayName}`

        const updateDraftItems = (items: TreeItem[]): TreeItem[] => {
          return items.map((item) =>
            item.draft
              ? {
                  displayName: displayName,
                  type: item.type,
                  path: newPath,
                  draft: false
                }
              : item.type === 'directory' && item.children
                ? { ...item, children: updateDraftItems(item.children) }
                : item
          )
        }

        return {
          draftItem: null,
          draftMode: null,
          treeItems: updateDraftItems(state.treeItems)
        }
      } else {
        // Renaming existing item
        const originalPath = state.draftItem.path
        const displayName = state.draftItem.type === 'note' ? `${name}.md` : name
        const parentPath = originalPath.substring(0, originalPath.lastIndexOf('/'))
        const newPath = `${parentPath}/${displayName}`

        const updateRenamedItems = (items: TreeItem[]): TreeItem[] => {
          return items.map((item) => {
            if (item.path === originalPath) {
              return {
                ...item,
                displayName: displayName,
                path: newPath,
                draft: false
              }
            }
            if (item.type === 'directory' && item.children) {
              return { ...item, children: updateRenamedItems(item.children) }
            }
            return item
          })
        }

        return {
          draftItem: null,
          draftMode: null,
          treeItems: updateRenamedItems(state.treeItems)
        }
      }
    })
  },

  cancelDraftItem: () => {
    set((state) => {
      if (state.draftMode === 'add') {
        // Remove the draft item if adding
        const removeDraftItems = (items: TreeItem[]): TreeItem[] => {
          return items
            .filter((item) => !item.draft)
            .map((item) =>
              item.type === 'directory' && item.children
                ? { ...item, children: removeDraftItems(item.children) }
                : item
            )
        }

        return {
          draftItem: null,
          draftMode: null,
          treeItems: removeDraftItems(state.treeItems)
        }
      } else {
        // Remove draft flag if renaming
        const removeDraftFlag = (items: TreeItem[]): TreeItem[] => {
          return items.map((item) => {
            if (item.draft) {
              return { ...item, draft: false }
            }
            if (item.type === 'directory' && item.children) {
              return { ...item, children: removeDraftFlag(item.children) }
            }
            return item
          })
        }

        return {
          draftItem: null,
          draftMode: null,
          treeItems: removeDraftFlag(state.treeItems)
        }
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
