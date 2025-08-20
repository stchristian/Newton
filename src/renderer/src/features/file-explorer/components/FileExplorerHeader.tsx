import React from 'react'
import { Button } from '../../../components/ui'
import { Folder, Plus } from 'lucide-react'
import { useWorkspace } from '../../../shared/hooks/useWorkspace'
import { useFileSystem } from '../hooks/useFileSystem'

interface FileExplorerHeaderProps {
  onAddNote: () => void
}

export const FileExplorerHeader: React.FC<FileExplorerHeaderProps> = ({ onAddNote }) => {
  const { workspaceFolder, openWorkspace } = useWorkspace()

  return (
    <div className="p-4 border-b flex flex-row border-gray-200 gap-2">
      <Button variant="ghost" onClick={onAddNote} disabled={!workspaceFolder}>
        <Plus />
        Add note
      </Button>
      <Button onClick={openWorkspace} variant="ghost">
        <Folder />
        Open
      </Button>
    </div>
  )
}
