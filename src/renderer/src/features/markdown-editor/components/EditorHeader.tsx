import { Pencil, BookOpen } from 'lucide-react'
import { Button } from '@renderer/components/ui'

interface EditorHeaderProps {
  fileName?: string
  editMode: boolean
  onToggleMode: () => void
}

export function EditorHeader({ fileName, editMode, onToggleMode }: EditorHeaderProps) {
  return (
    <div className="flex justify-between items-center py-2 px-4 border-b border-gray-200 bg-gray-50">
      <span className="text-sm text-gray-600 font-medium">{fileName || 'Untitled'}</span>
      <Button
        size="icon"
        variant="ghost"
        onClick={onToggleMode}
        title={`${editMode ? 'Read' : 'Edit'} mode (Cmd/Ctrl+E)`}
      >
        {editMode ? <BookOpen /> : <Pencil />}
      </Button>
    </div>
  )
}
