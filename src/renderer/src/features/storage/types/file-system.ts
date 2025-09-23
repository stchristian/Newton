export interface FileSystemItem {
  name: string
  path: string
  type: 'note' | 'directory'
  children?: FileSystemItem[]
}

export interface FileCreationState {
  isAddingNewItem: boolean
  newItemType: 'note' | 'folder'
  newItemName: string
  targetDirectory: string | null
}

export interface FileRenameState {
  pathOfFileUnderRename: string | null
  newNameOfFileUnderRename: string | null
}




