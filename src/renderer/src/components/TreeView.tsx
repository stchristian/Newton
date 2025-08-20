import React, { useState, useCallback, forwardRef, useImperativeHandle } from 'react'
import { ChevronRight, ChevronDown, FileText } from 'lucide-react'

interface FileSystemItem {
  name: string
  path: string
  isDirectory: boolean
  isFile: boolean
}

export interface TreeViewRef {
  refreshFolder: (folderPath: string) => Promise<void>
}

interface TreeViewProps {
  items: FileSystemItem[]
  onItemClick: (item: FileSystemItem) => void
  onFolderExpand?: (folderPath: string) => Promise<FileSystemItem[]>
  activeFilePath?: string
  onContextMenu?: (itemPath: string, itemType: 'file' | 'directory') => void
  className?: string
}

const TreeView = forwardRef<TreeViewRef, TreeViewProps>(
  ({ items, onItemClick, onFolderExpand, activeFilePath, onContextMenu, className = '' }, ref) => {
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
    const [folderContents, setFolderContents] = useState<Map<string, FileSystemItem[]>>(new Map())

    useImperativeHandle(ref, () => ({
      refreshFolder: refreshFolderContents
    }))

    // Function to refresh a specific folder's contents
    const refreshFolderContents = useCallback(
      async (folderPath: string) => {
        if (!onFolderExpand) return

        try {
          const contents = await onFolderExpand(folderPath)
          setFolderContents((prev) => new Map(prev).set(folderPath, contents))
        } catch (error) {
          console.error('Error refreshing folder contents:', error)
        }
      },
      [onFolderExpand]
    )

    const handleFolderClick = useCallback(
      async (item: FileSystemItem) => {
        if (!item.isDirectory || !onFolderExpand) return

        const newExpanded = new Set(expandedFolders)
        const isExpanded = newExpanded.has(item.path)

        if (isExpanded) {
          // Collapse folder
          newExpanded.delete(item.path)
          setExpandedFolders(newExpanded)
        } else {
          // Expand folder
          newExpanded.add(item.path)
          setExpandedFolders(newExpanded)

          // Load folder contents if not already loaded
          if (!folderContents.has(item.path)) {
            try {
              const contents = await onFolderExpand(item.path)
              setFolderContents((prev) => new Map(prev).set(item.path, contents))
            } catch (error) {
              console.error('Error loading folder contents:', error)
            }
          }
        }
      },
      [expandedFolders, folderContents, onFolderExpand]
    )

    const handleItemClick = useCallback(
      (item: FileSystemItem) => {
        if (item.isDirectory) {
          void handleFolderClick(item)
        } else {
          onItemClick(item)
        }
      },
      [handleFolderClick, onItemClick]
    )

    const renderTreeItem = (item: FileSystemItem, level: number = 0) => {
      const isExpanded = expandedFolders.has(item.path)
      const isActive = activeFilePath === item.path
      const hasChildren = item.isDirectory && folderContents.has(item.path)
      const children = hasChildren ? folderContents.get(item.path) || [] : []

      return (
        <div key={item.path}>
          <div
            className={`flex items-center p-2 hover:bg-gray-100 cursor-pointer ${
              isActive ? 'bg-blue-50 border-r-2 border-blue-500' : ''
            }`}
            style={{ paddingLeft: `${level * 16 + 8}px` }}
            onClick={() => handleItemClick(item)}
            onContextMenu={(e) => {
              e.preventDefault()
              onContextMenu?.(item.path, item.isDirectory ? 'directory' : 'file')
            }}
          >
            <span className="mr-2 flex items-center">
              {item.isDirectory ? (
                <>
                  {isExpanded ? (
                    <ChevronDown size={14} className="text-gray-500" />
                  ) : (
                    <ChevronRight size={14} className="text-gray-500" />
                  )}
                </>
              ) : (
                <FileText size={16} className="text-gray-600" />
              )}
            </span>
            <span
              className={`truncate text-sm ${
                isActive ? 'font-medium text-blue-700' : 'text-gray-700'
              }`}
              title={item.name}
            >
              {item.name}
            </span>
          </div>

          {/* Render children if folder is expanded */}
          {isExpanded && hasChildren && (
            <div>
              {children
                .filter((child) => !child.name.startsWith('.'))
                .sort((a, b) => {
                  // Sort directories first, then files, both alphabetically
                  if (a.isDirectory && !b.isDirectory) return -1
                  if (!a.isDirectory && b.isDirectory) return 1
                  return a.name.localeCompare(b.name)
                })
                .map((child) => renderTreeItem(child, level + 1))}
            </div>
          )}
        </div>
      )
    }

    const sortedItems = items
      .filter((item) => !item.name.startsWith('.'))
      .sort((a, b) => {
        // Sort directories first, then files, both alphabetically
        if (a.isDirectory && !b.isDirectory) return -1
        if (!a.isDirectory && b.isDirectory) return 1
        return a.name.localeCompare(b.name)
      })

    return (
      <div className={`tree-view ${className}`}>
        {sortedItems.map((item) => renderTreeItem(item))}
      </div>
    )
  }
)

TreeView.displayName = 'TreeView'
export default TreeView
export type { FileSystemItem, TreeViewProps }
