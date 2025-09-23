import { create } from 'zustand'

export interface Note {
  name: string
  path: string
  markdownContent: string
}

interface WorkspaceStore {
  workspaceFolder: string | null
  activeNote: Note | null
  setWorkspaceFolder: (folder: string | null) => void
  setActiveNote: (note: Note | null) => void
}

export const useWorkspaceStore = create<WorkspaceStore>((set) => ({
  // Initial state
  workspaceFolder: null,
  activeNote: null,

  // Actions
  setWorkspaceFolder: (folder) => set({ workspaceFolder: folder }),
  setActiveNote: (note) => set({ activeNote: note })
}))
