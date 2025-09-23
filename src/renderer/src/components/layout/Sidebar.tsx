import React, { useState } from 'react'
import { Navigator } from '../../features/navigator'

type SidebarTabType = 'navigator' | 'search' | 'outline' | 'bookmarks'

export default function Sidebar(): React.ReactElement {
  const [activeTab, setActiveTab] = useState<SidebarTabType>('navigator') // Will be used when tabs are enabled

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'navigator':
        return <Navigator />
      case 'search':
        return <div className="p-4">Search Explorer (Coming Soon)</div>
      case 'outline':
        return <div className="p-4">Outline Explorer (Coming Soon)</div>
      case 'bookmarks':
        return <div className="p-4">Bookmarks Explorer (Coming Soon)</div>
      default:
        return <Navigator />
    }
  }

  return (
    <div className="flex h-full">
      <aside className="border-r border-gray-200 w-[250px] flex flex-col h-full">
        {/* Explorer Content */}
        <div className="flex-1 overflow-hidden">{renderActiveTab()}</div>
      </aside>
    </div>
  )
}
