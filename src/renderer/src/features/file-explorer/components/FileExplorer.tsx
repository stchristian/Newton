import React from 'react'
import { FileExplorerHeader } from './FileExplorerHeader'
import { FileCreationPanel } from './FileCreationPanel'
import { FileExplorerBreadcrumb } from './FileExplorerBreadcrumb'
import { FileTree } from './FileTree'
import { useFileSystem } from '../hooks/useFileSystem'
import { useContextMenu } from '../../../shared/hooks/useContextMenu'

interface FileExplorerProps {
  onDocumentClick: (path: string) => void
}

export const FileExplorer: React.FC<FileExplorerProps> = ({ onDocumentClick }) => {
  const { setIsAddingNewItem, setNewItemType } = useFileSystem()

  // Set up context menu listeners
  useContextMenu()

  const handleAddNote = () => {
    setNewItemType('note')
    setIsAddingNewItem(true)
  }

  return (
    <div className="flex flex-col h-full">
      <FileExplorerHeader onAddNote={handleAddNote} />
      <FileCreationPanel />
      {/* <FileExplorerBreadcrumb /> */}
      <FileTree onDocumentClick={onDocumentClick} />
    </div>
  )
}
