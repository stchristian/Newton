import { ContextMenuProvider } from './ContextMenuProvider'
import { NavigatorToolbar } from './NavigatorToolbar'
import TreeView from './TreeView'

export const Navigator = () => {
  return (
    <div className="flex flex-col h-full">
      <NavigatorToolbar />
      <ContextMenuProvider>
        {(showContextMenu) => <TreeView onItemContextMenu={showContextMenu} />}
      </ContextMenuProvider>
    </div>
  )
}
