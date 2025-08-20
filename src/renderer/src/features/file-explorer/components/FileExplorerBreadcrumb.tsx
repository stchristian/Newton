import React from 'react'
import { useFileSystem } from '../hooks/useFileSystem'

export const FileExplorerBreadcrumb: React.FC = () => {
  const { currentFolder, folderHistory, navigateToFolder } = useFileSystem()

  if (!currentFolder) {
    return null
  }

  return (
    <div className="p-4 border-b border-gray-200 bg-gray-50">
      <div className="text-sm text-gray-600">
        <div className="flex items-center space-x-1 overflow-x-auto">
          {folderHistory.map((path, index) => (
            <React.Fragment key={path}>
              {index > 0 && <span className="text-gray-400">/</span>}
              <button
                onClick={() => void navigateToFolder(path, index)}
                className="hover:text-blue-600 hover:underline truncate max-w-[100px]"
                title={path}
              >
                {index === 0 ? '📁' : ''} {path.split('/').pop() || path}
              </button>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  )
}
