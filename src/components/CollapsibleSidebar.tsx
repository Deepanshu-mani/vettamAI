
import type React from "react"
import { useState } from "react"
import { FileText, List, Search, Eye, PanelRightClose, PanelRightOpen, Sidebar } from "lucide-react"
import { DocumentIndex } from "./DocumentIndex"
import { DocumentSearch } from "./DocumentSearch"

interface CollapsibleSidebarProps {
  isVisible: boolean
  onToggle: () => void
  children: React.ReactNode
  editorElement: HTMLElement | null
  onHeadingClick: (element: HTMLElement) => void
  onSearchResultClick: (element: HTMLElement) => void
}

export const CollapsibleSidebar: React.FC<CollapsibleSidebarProps> = ({
  isVisible,
  onToggle,
  children,
  editorElement,
  onHeadingClick,
  onSearchResultClick,
}) => {
  const [activeTab, setActiveTab] = useState<"preview" | "outline" | "search">("preview")

  const tabClass = (isActive: boolean) =>
    `flex-1 inline-flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
      isActive ? "bg-blue-600 text-white shadow-md" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
    }`

  return (
    <>
      {/* ENHANCED Professional Toggle Button */}
      <div className="fixed right-4 top-1/2 -translate-y-1/2 z-30">
        <div className="flex flex-col items-center gap-2">
          {/* Main Toggle Button */}
          <button
            type="button"
            onClick={onToggle}
            className={`group relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl p-3 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 ${
              isVisible ? "rounded-r-none" : ""
            }`}
            title={isVisible ? "Hide sidebar" : "Show sidebar"}
          >
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-blue-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Icon Container */}
            <div className="relative z-10 flex items-center justify-center">
              {isVisible ? (
                <PanelRightClose size={20} className="transition-transform duration-300 group-hover:scale-110" />
              ) : (
                <PanelRightOpen size={20} className="transition-transform duration-300 group-hover:scale-110" />
              )}
            </div>

            {/* Tooltip */}
            <div
              className={`absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none ${isVisible ? "hidden" : ""}`}
            >
              {isVisible ? "Hide Sidebar" : "Show Sidebar"}
            </div>
          </button>

          {/* Status Indicator */}
          <div
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              isVisible ? "bg-green-400 shadow-lg shadow-green-400/50" : "bg-gray-400"
            }`}
          />

          {/* Quick Access Buttons (when sidebar is hidden) */}
          {!isVisible && (
            <div className="flex flex-col gap-1 mt-2">
              <button
                type="button"
                onClick={() => {
                  onToggle()
                  setTimeout(() => setActiveTab("preview"), 100)
                }}
                className="p-2 bg-white hover:bg-gray-50 text-gray-600 hover:text-blue-600 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200"
                title="Show Preview"
              >
                <Eye size={16} />
              </button>
              <button
                type="button"
                onClick={() => {
                  onToggle()
                  setTimeout(() => setActiveTab("outline"), 100)
                }}
                className="p-2 bg-white hover:bg-gray-50 text-gray-600 hover:text-blue-600 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200"
                title="Show Outline"
              >
                <List size={16} />
              </button>
              <button
                type="button"
                onClick={() => {
                  onToggle()
                  setTimeout(() => setActiveTab("search"), 100)
                }}
                className="p-2 bg-white hover:bg-gray-50 text-gray-600 hover:text-blue-600 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200"
                title="Show Search"
              >
                <Search size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Sidebar */}
      <aside
        className={`fixed right-0 top-0 h-full w-[350px] bg-gradient-to-b from-white to-gray-50 border-l border-gray-200 shadow-2xl transform transition-all duration-300 ease-in-out z-20 ${
          isVisible ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Enhanced Header with Tabs */}
          <div className="p-4 border-b border-gray-200 bg-white">
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Sidebar size={20} className="text-blue-600" />
                <h2 className="text-lg font-bold text-gray-900">Document Navigator</h2>
              </div>
              <p className="text-xs text-gray-500">Navigate and search your document with ease</p>
            </div>

            <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
              <button
                type="button"
                onClick={() => setActiveTab("preview")}
                className={tabClass(activeTab === "preview")}
              >
                <Eye size={16} />
                <span>Preview</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("outline")}
                className={tabClass(activeTab === "outline")}
              >
                <List size={16} />
                <span>Outline</span>
              </button>
              <button type="button" onClick={() => setActiveTab("search")} className={tabClass(activeTab === "search")}>
                <Search size={16} />
                <span>Search</span>
              </button>
            </div>
          </div>

          {/* Enhanced Tab Content */}
          <div className="flex-1 overflow-hidden">
            {activeTab === "preview" && (
              <div className="h-full overflow-auto p-4">
                <div className="mb-3">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Eye size={16} className="text-blue-600" />
                    Page Thumbnails
                  </h3>
                  <p className="text-xs text-gray-500">Click on any page to navigate instantly</p>
                </div>
                {children}
              </div>
            )}
            {activeTab === "outline" && <DocumentIndex editorElement={editorElement} onHeadingClick={onHeadingClick} />}
            {activeTab === "search" && (
              <DocumentSearch editorElement={editorElement} onResultClick={onSearchResultClick} />
            )}
          </div>

          {/* Enhanced Footer */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <FileText size={14} />
                <span>Document Tools</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span>Live</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
