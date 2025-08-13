

import type React from "react"
import { FileText, Layout } from "lucide-react"

interface TabBarProps {
  activeTab: "text" | "page"
  onTabChange: (tab: "text" | "page") => void
}

export const TabBar: React.FC<TabBarProps> = ({ activeTab, onTabChange }) => {
  const tabClass = (isActive: boolean) =>
    `inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
      isActive
        ? "bg-blue-100 text-blue-700 border border-blue-200"
        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
    }`

  return (
    <div className="flex items-center gap-1 bg-white rounded-lg p-1 border border-gray-200">
      <button type="button" onClick={() => onTabChange("text")} className={tabClass(activeTab === "text")}>
        <FileText size={16} />
        Text
      </button>
      <button type="button" onClick={() => onTabChange("page")} className={tabClass(activeTab === "page")}>
        <Layout size={16} />
        Page
      </button>
    </div>
  )
}
