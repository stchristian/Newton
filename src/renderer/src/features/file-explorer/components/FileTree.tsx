import React, { useRef } from 'react'
import {
  TreeView,
  type TreeViewRef,
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger
} from '../../../components/ui'
import { useFileSystem } from '../hooks/useFileSystem'
import { useWorkspace } from '../../../shared/hooks/useWorkspace'
import type { FileSystemItem } from '../types/file-system'

interface FileTreeProps {
  onDocumentClick: (path: string) => void
}

export const FileTree: React.FC<FileTreeProps> = ({ onDocumentClick }) => {
  const {
    folderItems,
    handleItemClick,
    handleFolderExpand,
    handleContextMenu,
    setIsAddingNewItem,
    setNewItemType
  } = useFileSystem()

  const { activeFilePath } = useWorkspace()
  const treeViewRef = useRef<TreeViewRef>(null)

  const handleAddNote = () => {
    setNewItemType('note')
    setIsAddingNewItem(true)
  }

  const handleAddFolder = () => {
    setNewItemType('folder')
    setIsAddingNewItem(true)
  }

  const handleFolderItemClick = (item: FileSystemItem) => {
    const filePath = handleItemClick(item)
    if (filePath) {
      onDocumentClick(filePath)
    }
  }

  if (folderItems.length === 0) {
    return null
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger className="flex-1">
        <div
          onContextMenu={() => {
            if (!window.WEB_VERSION) {
              window.api.contextMenu.show()
              return false
            }
            return true
          }}
        >
          <div className="flex-1 overflow-y-auto">
            <div className="p-2 text-sm text-gray-500 border-b border-gray-200">
              {folderItems.length} item{folderItems.length !== 1 ? 's' : ''}
            </div>
            <TreeView
              ref={treeViewRef}
              items={folderItems}
              onItemClick={handleFolderItemClick}
              onFolderExpand={handleFolderExpand}
              activeFilePath={activeFilePath || undefined}
              onContextMenu={handleContextMenu}
              className="flex-1"
            />
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={handleAddNote}>New note</ContextMenuItem>
        <ContextMenuItem onClick={handleAddFolder}>New folder</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}
