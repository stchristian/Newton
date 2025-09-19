import { useCallback, useEffect, useRef } from 'react'
import { ChevronRight, ChevronDown } from 'lucide-react'
import { useFileSystemStore } from '@renderer/stores/file-system-store'
import clsx from 'clsx'
import { TreeItem as TreeViewItem, useNavigatorStore } from '../stores/navigator-store'
import { useNavigator } from '../hooks/useNavigator'
import { useWorkspace } from '@renderer/shared/hooks/useWorkspace'

// Separate component for tree item to use hooks properly
interface TreeItemProps {
  item: TreeViewItem
  level: number
  isExpanded: boolean
  hasChildren: boolean
  itemChildren: TreeViewItem[]
  isRenaming: boolean
  onItemClick: (item: TreeViewItem) => void
  onFolderClick: (item: TreeViewItem) => void
  onContextMenu?: (itemPath: string, itemType: 'file' | 'directory') => void
  renderChildren: (children: TreeViewItem[], level: number) => React.ReactNode
}

const TreeItem = ({
  item,
  level,
  isExpanded,
  hasChildren,
  itemChildren,
  isRenaming,
  onItemClick,
  onFolderClick,
  onContextMenu,
  renderChildren
}: TreeItemProps) => {
  const { renameFile, cancelRenameFile, setNewNameOfFileUnderRename } = useFileSystemStore()
  const editableRef = useRef<HTMLSpanElement>(null)

  // Auto-focus and select text when renaming starts
  useEffect(() => {
    if (isRenaming && editableRef.current) {
      editableRef.current.focus()
      // Select all text content
      const range = document.createRange()
      range.selectNodeContents(editableRef.current)
      const selection = window.getSelection()
      if (selection) {
        selection.removeAllRanges()
        selection.addRange(range)
      }
    }
  }, [isRenaming])

  const handleItemClick = () => {
    if (item.type === 'directory') {
      onFolderClick(item)
    } else {
      onItemClick(item)
    }
  }

  return (
    <div>
      <div
        className={`flex items-center p-2 hover:bg-gray-100 cursor-pointer  focus:outline-1 focus:outline-blue-500`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={handleItemClick}
        onContextMenu={(e) => {
          e.preventDefault()
          onContextMenu?.(item.path, item.type === 'directory' ? 'directory' : 'file')
        }}
      >
        <span className="mr-2 flex items-center">
          {item.type === 'directory' && (
            <>
              {isExpanded ? (
                <ChevronDown size={14} className="text-gray-500" />
              ) : (
                <ChevronRight size={14} className="text-gray-500" />
              )}
            </>
          )}
        </span>
        <span
          ref={editableRef}
          className={clsx('truncate text-sm', isRenaming ? 'cursor-text ' : '')}
          title={item.displayName}
          contentEditable={isRenaming}
          onInput={(e) => {
            setNewNameOfFileUnderRename(e.currentTarget.innerText)
          }}
          onBlur={() => {
            cancelRenameFile()
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              renameFile()
            }
          }}
        >
          {item.displayName}
        </span>
      </div>

      {/* Render children if folder is expanded */}
      {isExpanded && hasChildren && renderChildren(itemChildren, level + 1)}
    </div>
  )
}

const TreeView = () => {
  const { expandedFolderPaths, treeItems } = useNavigatorStore()
  const { handleFolderExpand, openContextMenu } = useNavigator()
  const { openNote } = useWorkspace()
  const { pathOfFileUnderRename } = useFileSystemStore()

  const handleItemClick = useCallback(
    (item: TreeViewItem) => {
      if (item.type === 'note') {
        openNote(item.path)
      }
    },
    [openNote]
  )

  const renderTreeItem = (item: TreeViewItem, level: number = 0) => {
    const isExpanded = expandedFolderPaths.has(item.path)
    const hasChildren = item.type === 'directory' && item.children && item.children.length > 0
    const children = hasChildren ? item.children : []
    const isRenaming = pathOfFileUnderRename === item.path

    return (
      <TreeItem
        key={item.path}
        item={item}
        level={level}
        isExpanded={isExpanded}
        hasChildren={!!hasChildren}
        itemChildren={children || []}
        isRenaming={isRenaming}
        onItemClick={handleItemClick}
        onFolderClick={handleFolderExpand}
        onContextMenu={openContextMenu}
        renderChildren={(childrenToRender, childLevel) => (
          <div>
            {childrenToRender
              .filter((child) => !child.displayName.startsWith('.'))
              .sort((a, b) => {
                // Sort directories first, then files, both alphabetically
                if (a.type === 'directory' && b.type !== 'directory') return -1
                if (a.type !== 'directory' && b.type === 'directory') return 1
                return a.displayName.localeCompare(b.displayName)
              })
              .map((child) => renderTreeItem(child, childLevel))}
          </div>
        )}
      />
    )
  }

  const sortedItems = treeItems
    .filter((item) => !item.displayName.startsWith('.'))
    .sort((a, b) => {
      // Sort directories first, then files, both alphabetically
      if (a.type === 'directory' && b.type !== 'directory') return -1
      if (a.type !== 'directory' && b.type === 'directory') return 1
      return a.displayName.localeCompare(b.displayName)
    })

  return <div className={`tree-view`}>{sortedItems.map((item) => renderTreeItem(item))}</div>
}

TreeView.displayName = 'TreeView'
export default TreeView
export type { TreeViewItem as FileSystemItem }
