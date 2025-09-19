import { Button } from '../../../components/ui'
import { FolderPlus, SquarePen } from 'lucide-react'
import { useWorkspace } from '../../../shared/hooks/useWorkspace'
import { useNavigator } from '../hooks/useNavigator'

export const NavigatorToolbar = () => {
  const { hasOpenedWorkspace } = useWorkspace()
  const { handleAddFolder, handleAddNote } = useNavigator()

  return (
    <div className="px-2 py-0.5 border-b flex flex-row border-gray-200 gap-1">
      <Button
        size="icon"
        variant="ghost"
        onClick={() => handleAddNote()}
        disabled={!hasOpenedWorkspace}
        title="Add note"
      >
        <SquarePen />
      </Button>
      <Button
        size="icon"
        variant="ghost"
        disabled={!hasOpenedWorkspace}
        title="Add folder"
        onClick={() => handleAddFolder()}
      >
        <FolderPlus />
      </Button>
    </div>
  )
}
