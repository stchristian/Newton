import { useWorkspaceStore } from '../../stores/workspace-store'

export const useWorkspace = () => {
  const {
    workspaceFolder,
    activeFilePath,
    setWorkspaceFolder,
    setActiveFilePath,
    openWorkspace,
    initializeWorkspace
  } = useWorkspaceStore()

  return {
    workspaceFolder,
    activeFilePath,
    setWorkspaceFolder,
    setActiveFilePath,
    openWorkspace,
    initializeWorkspace
  }
}
