import React, { useEffect, useMemo, useState, useRef } from 'react'
import { Button } from './ui/button'
import { Folder, Plus } from 'lucide-react'

interface FileSystemItem {
  name: string
  path: string
  isDirectory: boolean
  isFile: boolean
}

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
  const [isCreatingFile, setIsCreatingFile] = useState(false)
  const [newFileName, setNewFileName] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

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

  const handleFolderItemClick = async (item: FileSystemItem): Promise<void> => {
    if (item.isDirectory) {
      try {
        const items = await window.api.readDirectory(item.path)
        setFolderItems(items)
        setCurrentNavFolder(item.path)
        setFolderHistory((prev) => [...prev, item.path])
      } catch (error) {
        console.error('Error reading directory:', error)
      }
    } else if (item.isFile) {
      // TODO: Handle file opening
      onDocumentClick(item.path)
    }
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

    setIsCreatingFile(true)
    setNewFileName('')

    // Focus the input after a short delay to ensure it's rendered
    setTimeout(() => {
      inputRef.current?.focus()
    }, 100)
  }

  const handleCreateFile = async (): Promise<void> => {
    if (!workspaceFolder || !newFileName.trim()) {
      setIsCreatingFile(false)
      return
    }

    try {
      // Ensure the file has a .md extension
      const fileName = newFileName.endsWith('.md') ? newFileName : `${newFileName}.md`
      const content = `# ${fileName.replace('.md', '')}\n\n`

      const filePath = await window.api.createFile(workspaceFolder, fileName, content)

      // Refresh the folder contents
      const items = await window.api.readDirectory(workspaceFolder)
      setFolderItems(items)

      // Find the new file and open it
      const newFile = items.find((item) => item.path === filePath)
      if (newFile) {
        onDocumentClick(filePath)
      }

      setIsCreatingFile(false)
      setNewFileName('')
    } catch (error) {
      console.error('Error creating file:', error)
      setIsCreatingFile(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter') {
      void handleCreateFile()
    } else if (e.key === 'Escape') {
      setIsCreatingFile(false)
      setNewFileName('')
    }
  }

  return (
    <aside
      className="border-r border-gray-200 w-[250px] flex flex-col"
      onContextMenu={() => {
        window.api.contextMenu.show()
      }}
    >
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
      {isCreatingFile && (
        <div className="p-4 border-b border-gray-200 bg-blue-50">
          <div className="flex flex-col gap-2">
            <input
              ref={inputRef}
              type="text"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter file name..."
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleCreateFile} disabled={!newFileName.trim()}>
                Create
              </Button>
              <Button size="sm" variant="outline" onClick={() => setIsCreatingFile(false)}>
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

      {/* Folder Contents */}
      {itemsToShow.length > 0 && (
        <div className="flex-1 overflow-y-auto">
          <div className="p-2 text-sm text-gray-500 border-b border-gray-200">
            {itemsToShow.length} item{itemsToShow.length !== 1 ? 's' : ''}
          </div>
          <ul>
            {itemsToShow
              .sort((a, b) => {
                // Sort directories first, then files, both alphabetically
                if (a.isDirectory && !b.isDirectory) return -1
                if (!a.isDirectory && b.isDirectory) return 1
                return a.name.localeCompare(b.name)
              })
              .map((item, idx) => (
                <li
                  key={`${item.path}-${idx}`}
                  onClick={() => handleFolderItemClick(item)}
                  className={`p-2 hover:bg-gray-100 cursor-pointer flex items-center ${
                    activeFilePath === item.path ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                  }`}
                >
                  <span className="mr-2">{item.isDirectory ? '📁' : '📄'}</span>
                  <span
                    className={`truncate ${activeFilePath === item.path ? 'font-medium text-blue-700' : ''}`}
                  >
                    {item.name}
                  </span>
                </li>
              ))}
          </ul>
        </div>
      )}
    </aside>
  )
}

export default Sidebar
