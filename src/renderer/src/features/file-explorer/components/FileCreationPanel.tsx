import React, { useRef, useEffect } from 'react'
import { Button } from '../../../components/ui'
import { useFileSystem } from '../hooks/useFileSystem'

export const FileCreationPanel: React.FC = () => {
  const {
    isAddingNewItem,
    newItemType,
    newItemName,
    targetDirectory,
    setNewItemName,
    createNewItem,
    resetFileCreation
  } = useFileSystem()

  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isAddingNewItem) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [isAddingNewItem])

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter') {
      void createNewItem()
    } else if (e.key === 'Escape') {
      resetFileCreation()
    }
  }

  if (!isAddingNewItem) {
    return null
  }

  return (
    <div className="p-4 border-b border-gray-200 bg-blue-50">
      <div className="flex flex-col gap-2">
        <input
          ref={inputRef}
          type="text"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Enter ${newItemType} name...`}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {targetDirectory && (
          <div className="text-xs text-gray-500">
            Creating in: {targetDirectory.split('/').pop() || targetDirectory}
          </div>
        )}
        <div className="flex gap-2">
          <Button size="sm" onClick={() => void createNewItem()} disabled={!newItemName.trim()}>
            Create
          </Button>
          <Button size="sm" variant="outline" onClick={resetFileCreation}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}
