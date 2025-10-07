import { useEffect, useRef, useContext } from 'react'
import { TreeItem as TreeItemData } from '../stores/navigator-store'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { NavigatorContextMenuContext } from './ContextMenuProvider'

// Separate component for tree item to use hooks properly
interface TreeItemProps {
  item: TreeItemData
  level: number
  isExpanded: boolean
  hasChildren: boolean
  itemChildren: TreeItemData[]
  draft: boolean
  onItemClick: (item: TreeItemData) => void
  onFolderClick: (item: TreeItemData) => void
  onSaveDraft: (name: string) => void
  onCancelDraft: () => void
  renderChildren: (children: TreeItemData[], level: number) => React.ReactNode
}

export const TreeItem = ({
  item,
  level,
  isExpanded,
  hasChildren,
  itemChildren,
  draft,
  onItemClick,
  onFolderClick,
  onSaveDraft,
  onCancelDraft,
  renderChildren
}: TreeItemProps) => {
  const editableRef = useRef<HTMLSpanElement>(null)
  const contextMenuContext = useContext(NavigatorContextMenuContext)

  // Auto-focus and select text when renaming starts
  useEffect(() => {
    if (draft && editableRef.current) {
      editableRef.current.textContent = item.displayName
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
  }, [draft, item.displayName])

  const handleSave = () => {
    if (editableRef.current) {
      const text = editableRef.current.textContent || ''
      onSaveDraft(text)
    }
  }

  const handleItemClick = () => {
    if (item.draft) return
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
          contextMenuContext?.showContextMenu(
            {
              type: item.type === 'directory' ? 'folder' : 'file',
              itemPath: item.path
            },
            e
          )
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
        {draft ? (
          <span
            autoFocus
            ref={editableRef}
            className="truncate text-sm cursor-text"
            title={item.displayName}
            contentEditable={true}
            onBlur={() => {
              onCancelDraft()
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSave()
              }
            }}
            suppressContentEditableWarning={true}
          />
        ) : (
          <span className="truncate text-sm" title={item.displayName}>
            {item.displayName}
          </span>
        )}
      </div>

      {/* Render children if folder is expanded */}
      {isExpanded && hasChildren && renderChildren(itemChildren, level + 1)}
    </div>
  )
}
