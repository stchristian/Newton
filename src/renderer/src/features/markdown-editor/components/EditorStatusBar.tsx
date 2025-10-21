interface EditorStatusBarProps {
  isSaving: boolean
  lastSaved: Date | null
  filePath?: string
}

export function EditorStatusBar({ isSaving, lastSaved, filePath }: EditorStatusBarProps) {
  return (
    <div className="flex justify-between items-center p-2 border-b border-gray-200 bg-gray-50 text-xs text-gray-500">
      <div className="flex items-center space-x-2">
        {isSaving && (
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
            <span>Saving...</span>
          </div>
        )}
        {lastSaved && !isSaving && <span>Last saved: {lastSaved.toLocaleTimeString()}</span>}
      </div>
      {filePath && <span className="text-gray-400">Auto-save enabled</span>}
    </div>
  )
}
