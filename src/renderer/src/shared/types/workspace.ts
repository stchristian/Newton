export interface WorkspaceState {
  workspaceFolder: string | null
  activeFilePath: string | null
}

export interface WorkspaceActions {
  setWorkspaceFolder: (folder: string | null) => void
  setActiveFilePath: (path: string | null) => void
  openWorkspace: () => Promise<void>
}
