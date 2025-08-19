import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react'
import { Button } from './ui/button'
import { Folder, Plus } from 'lucide-react'
import TreeView, { FileSystemItem, TreeViewRef } from './TreeView'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger
} from './ui/context-menu'

interface SidebarProps {
  onDocumentClick: (path: string) => void
  workspaceFolder: string | null
  onChangeWorkspaceFolder: (folder: string | null) => void
  activeFilePath?: string
}

const Sidebar: React.FC<SidebarProps> = ({
  onDocumentClick,
  workspaceFolder,
  onChangeWorkspaceFolder,
  activeFilePath
}) => {
  // Local navigation state inside the selected workspace folder
  const [currentNavFolder, setCurrentNavFolder] = useState<string | null>(null)
  const [folderItems, setFolderItems] = useState<FileSystemItem[]>([])
  const [folderHistory, setFolderHistory] = useState<string[]>([])

  // File creation state
  const [newItemType, setNewItemType] = useState<'note' | 'folder'>('note')
  const [isAddingNewItem, setIsAddingNewItem] = useState(false)
  const [newItemName, setNewItemname] = useState('')
  const [targetDirectory, setTargetDirectory] = useState<string | null>(null)

  const inputRef = useRef<HTMLInputElement>(null)
  const treeViewRef = useRef<TreeViewRef>(null)

  const refresh = useCallback(async () => {
    // Refresh the folder contents
    if (workspaceFolder) {
      const items = await window.api.readDirectory(workspaceFolder)
      setFolderItems(items)
    }
  }, [workspaceFolder])

  // Reset navigation and load contents when the workspace folder changes
  useEffect((): void => {
    const initializeWorkspace = async (): Promise<void> => {
      if (!workspaceFolder) {
        setCurrentNavFolder(null)
        setFolderItems([])
        setFolderHistory([])
        return
      }
      try {
        setCurrentNavFolder(workspaceFolder)
        setFolderHistory([workspaceFolder])
        const items = await window.api.readDirectory(workspaceFolder)
        setFolderItems(items)
      } catch (error) {
        console.error('Error reading workspace folder:', error)
      }
    }

    void initializeWorkspace()
  }, [workspaceFolder])

  function handleAddFolder() {
    setNewItemType('folder')
    setIsAddingNewItem(true)
    setNewItemname('')
  }

  // Set up context menu listener
  useEffect(() => {
    const handleContextMenuCommand = async (cmd: string, ...args: unknown[]) => {
      switch (cmd) {
        case 'new':
          setNewItemType('note')
          setIsAddingNewItem(true)
          setNewItemname('')
          break
        case 'create-folder':
          handleAddFolder()
          break
        case 'remove': {
          const path = args[0] as string
          await window.api.deleteFile(path)
          // Refresh the current folder contents
          if (currentNavFolder) {
            const items = await window.api.readDirectory(currentNavFolder)
            setFolderItems(items)
          }
          break
        }
      }
    }

    window.api.contextMenu.onCommand(handleContextMenuCommand)

    // Cleanup function to remove the listener when component unmounts
    return () => {
      window.api.contextMenu.removeListener()
    }
  }, [currentNavFolder]) // Only re-register when currentNavFolder changes

  // Handle context menu from TreeView
  const handleTreeViewContextMenu = (itemPath: string, itemType: 'file' | 'directory') => {
    if (window.WEB_VERSION) {
      return false
    }
    if (itemType === 'directory') {
      // Set the target directory for creating new items
      setTargetDirectory(itemPath)
    } else {
      // For files, use the current directory
      setTargetDirectory(currentNavFolder)
    }
    window.api.contextMenu.show(itemPath)
  }

  const handleOpenWorkspace = async (): Promise<void> => {
    try {
      const folderPath = await window.api.openFolder()
      if (folderPath) {
        onChangeWorkspaceFolder(folderPath)
      }
    } catch (error) {
      console.error('Error opening folder:', error)
    }
  }

  const handleFolderItemClick = (item: FileSystemItem): void => {
    if (item.isFile) {
      onDocumentClick(item.path)
    }
    // Folder expansion is now handled by TreeView component
  }

  const handleNavigateToFolder = async (
    folderPath: string,
    historyIndex: number
  ): Promise<void> => {
    try {
      const items = await window.api.readDirectory(folderPath)
      setFolderItems(items)
      setCurrentNavFolder(folderPath)
      setFolderHistory((prev) => prev.slice(0, historyIndex + 1))
    } catch (error) {
      console.error('Error navigating to folder:', error)
    }
  }

  const itemsToShow = useMemo(
    () => folderItems.filter((i) => !i.name.startsWith('.')),
    [folderItems]
  )

  const handleAddNote = async (): Promise<void> => {
    if (!workspaceFolder) return

    setIsAddingNewItem(true)
    setNewItemname('')
    setNewItemType('note')
    setTargetDirectory(null) // Reset target directory when using the button

    // Focus the input after a short delay to ensure it's rendered
    setTimeout(() => {
      inputRef.current?.focus()
    }, 100)
  }

  const handleCreateNewItem = async (): Promise<void> => {
    // Use target directory if set, otherwise fall back to workspace folder
    const createInDirectory = targetDirectory || workspaceFolder

    if (!createInDirectory || !newItemName.trim()) {
      setIsAddingNewItem(false)
      setTargetDirectory(null)
      return
    }

    try {
      // Ensure the file has a .md extension
      console.log(newItemName, newItemType)
      if (newItemType === 'note') {
        const fileName = newItemName.endsWith('.md') ? newItemName : `${newItemName}.md`
        const content = `# ${fileName.replace('.md', '')}\n\n`

        const filePath = await window.api.createFile(createInDirectory, fileName, content)

        // Refresh the folder contents
        refresh()

        // Refresh the specific folder in TreeView if it's expanded
        treeViewRef.current?.refreshFolder(createInDirectory)

        // Find the new file and open it
        const newFile = folderItems.find((item) => item.path === filePath)
        if (newFile) {
          onDocumentClick(filePath)
        }
      } else if (newItemType === 'folder') {
        await window.api.createFolder(`${createInDirectory}/${newItemName}`)
        // Refresh the folder contents
        refresh()

        // Refresh the specific folder in TreeView if it's expanded
        treeViewRef.current?.refreshFolder(createInDirectory)
      }

      setIsAddingNewItem(false)
      setNewItemname('')
      setTargetDirectory(null)
    } catch (error) {
      console.error('Error creating file:', error)
      setIsAddingNewItem(false)
      setTargetDirectory(null)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter') {
      void handleCreateNewItem()
    } else if (e.key === 'Escape') {
      setIsAddingNewItem(false)
      setNewItemname('')
    }
  }

  return (
    <aside className="border-r border-gray-200 w-[250px] flex flex-col h-full">
      {/* Open Folder Button */}
      <div className="p-4 border-b flex flex-row border-gray-200 gap-2">
        <Button variant="ghost" onClick={handleAddNote} disabled={!workspaceFolder}>
          <Plus />
          Add note
        </Button>
        <Button onClick={handleOpenWorkspace} variant="ghost">
          <Folder />
          Open
        </Button>
      </div>

      {/* File Creation Input */}
      {isAddingNewItem && (
        <div className="p-4 border-b border-gray-200 bg-blue-50">
          <div className="flex flex-col gap-2">
            <input
              ref={inputRef}
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemname(e.target.value)}
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
              <Button size="sm" onClick={handleCreateNewItem} disabled={!newItemName.trim()}>
                Create
              </Button>
              <Button size="sm" variant="outline" onClick={() => setIsAddingNewItem(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Current Folder Path */}
      {currentNavFolder && (
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            <div className="flex items-center space-x-1 overflow-x-auto">
              {folderHistory.map((path, index) => (
                <React.Fragment key={path}>
                  {index > 0 && <span className="text-gray-400">/</span>}
                  <button
                    onClick={() => handleNavigateToFolder(path, index)}
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
      )}

      <ContextMenu>
        <ContextMenuTrigger className="flex-1">
          <div
            onContextMenu={() => {
              if (!window.WEB_VERSION) {
                window.api.contextMenu.show()
                // Prevent default context menu in Electron
                return false
              }
              return true
            }}
          >
            {/* Folder Contents */}
            {itemsToShow.length > 0 && (
              <div className="flex-1 overflow-y-auto">
                <div className="p-2 text-sm text-gray-500 border-b border-gray-200">
                  {itemsToShow.length} item{itemsToShow.length !== 1 ? 's' : ''}
                </div>
                <TreeView
                  ref={treeViewRef}
                  items={itemsToShow}
                  onItemClick={handleFolderItemClick}
                  onFolderExpand={async (folderPath) => {
                    console.log('expanding', folderPath)
                    const result = await window.api.readDirectory(folderPath)
                    console.log('result', result)
                    return result
                  }}
                  activeFilePath={activeFilePath}
                  onContextMenu={handleTreeViewContextMenu}
                  className="flex-1"
                />
              </div>
            )}
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onClick={handleAddNote}>New note</ContextMenuItem>
          <ContextMenuItem onClick={handleAddFolder}>New folder</ContextMenuItem>
          {/* <ContextMenuItem>Team</ContextMenuItem>
        <ContextMenuItem>Subscription</ContextMenuItem> */}
        </ContextMenuContent>
      </ContextMenu>
    </aside>
  )
}

export default Sidebar
