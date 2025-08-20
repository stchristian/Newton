export interface FileSystemItem {
  name: string
  path: string
  isFile: boolean
  isDirectory: boolean
  children?: FileSystemItem[]
}

export interface FileCreationState {
  isAddingNewItem: boolean
  newItemType: 'note' | 'folder'
  newItemName: string
  targetDirectory: string | null
}

export interface FileSystemNavigation {
  currentFolder: string | null
  folderHistory: string[]
  folderItems: FileSystemItem[]
}

export interface FileSystemContext {
  itemPath: string
  itemType: 'file' | 'directory'
}
