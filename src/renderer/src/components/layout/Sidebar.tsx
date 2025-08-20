import React, { useState } from 'react'
import { FileExplorer } from '../../features/file-explorer'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '../ui'

type SidebarTabType = 'file' | 'search' | 'outline' | 'bookmarks'

interface SidebarProps {
  onDocumentClick: (path: string) => void
}

export default function Sidebar({ onDocumentClick }: SidebarProps): React.ReactElement {
  const [isOpen, setIsOpen] = useState(true)
  const [activeTab, setActiveTab] = useState<SidebarTabType>('file') // Will be used when tabs are enabled

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  const renderExplorer = () => {
    switch (activeTab) {
      case 'file':
        return <FileExplorer onDocumentClick={onDocumentClick} />
      case 'search':
        return <div className="p-4">Search Explorer (Coming Soon)</div>
      case 'outline':
        return <div className="p-4">Outline Explorer (Coming Soon)</div>
      case 'bookmarks':
        return <div className="p-4">Bookmarks Explorer (Coming Soon)</div>
      default:
        return <FileExplorer onDocumentClick={onDocumentClick} />
    }
  }

  return (
    <div className="flex h-full">
      {isOpen && (
        <aside className="border-r border-gray-200 w-[250px] flex flex-col h-full">
          {/* Explorer Tabs - Future feature */}
          <div className="flex border-b border-gray-200">
            <button
              className={`px-3 py-2 text-sm ${activeTab === 'file' ? 'bg-blue-50 text-blue-600' : 'text-gray-600'}`}
              onClick={() => setActiveTab('file')}
            >
              Files
            </button>
            <button
              className={`px-3 py-2 text-sm ${activeTab === 'search' ? 'bg-blue-50 text-blue-600' : 'text-gray-600'}`}
              onClick={() => setActiveTab('search')}
            >
              Search
            </button>
          </div>

          {/* Explorer Content */}
          <div className="flex-1 overflow-hidden">{renderExplorer()}</div>
        </aside>
      )}

      {/* Toggle Button */}
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className="h-8 w-4 p-0 border-l border-gray-200 rounded-none hover:bg-gray-50"
          title={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {isOpen ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
        </Button>
      </div>
    </div>
  )
}
