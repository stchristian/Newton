import { FolderOpen } from 'lucide-react'
import React from 'react'
import { Button } from '../ui'
import { useWorkspace } from '@renderer/shared/hooks/useWorkspace'

interface HeaderProps {
  title?: string
  onMenuClick?: () => void
}

export default function Header({ title = 'Newton' }: HeaderProps): React.ReactElement {
  const { openWorkspace, workspaceFolder } = useWorkspace()

  return (
    <div className="header h-10 bg-white border-b border-gray-200 flex items-center justify-between px-4 ">
      <div className="flex items-center space-x-4">
        <h1 className="text-lg font-semibold text-gray-900">{title}</h1>

        <div className="text-sm text-gray-500">{workspaceFolder}</div>
      </div>

      <div className="flex items-center space-x-2">
        {/* Add your header controls here */}
        <Button onClick={openWorkspace} variant="ghost">
          <FolderOpen />
          Open workspace
        </Button>
      </div>
    </div>
  )
}
