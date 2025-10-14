import { useCallback } from 'react'
import { useNavigatorStore } from '../stores/navigator-store'
import { useNavigator } from '../hooks/useNavigator'
import { useWorkspace } from '@renderer/shared/hooks/useWorkspace'
import { TreeItem as TreeItemData } from '../stores/navigator-store'
import { TreeItem } from './TreeItem'

const TreeView = () => {
  const { expandedFolderPaths, treeItems, draftMode } = useNavigatorStore()
  const { handleFolderExpand, handleCancelDraft, handleSaveDraft } = useNavigator()
  const { openNote } = useWorkspace()

  const handleItemClick = useCallback(
    (item: TreeItemData) => {
      if (item.type === 'note') {
        openNote(item.path)
      }
    },
    [openNote]
  )

  const renderTreeItem = (item: TreeItemData, level: number = 0) => {
    const isExpanded = expandedFolderPaths.has(item.path)
    const hasChildren = item.type === 'directory' && item.children && item.children.length > 0
    const children = hasChildren ? item.children : []

    return (
      <TreeItem
        key={item.draft ? '#draft' : item.path}
        item={item}
        level={level}
        isExpanded={isExpanded}
        hasChildren={!!hasChildren}
        itemChildren={children || []}
        draft={item.draft ?? false}
        onItemClick={handleItemClick}
        onFolderClick={handleFolderExpand}
        onCancelDraft={handleCancelDraft}
        onSaveDraft={handleSaveDraft}
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

      // Only push draft items to the end when adding new items, not when renaming
      if (draftMode === 'add') {
        if (a.draft && !b.draft) return 1
        if (!a.draft && b.draft) return -1
      }

      return a.displayName.localeCompare(b.displayName)
    })

  return <div className="tree-view">{sortedItems.map((item) => renderTreeItem(item))}</div>
}

TreeView.displayName = 'TreeView'
export default TreeView
