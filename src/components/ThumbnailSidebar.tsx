import React, { useMemo } from "react"
import { Editor } from "@tiptap/react"

interface ThumbnailSidebarProps {
  editor: Editor | null
  isVisible: boolean
  onToggle: () => void
}

export const ThumbnailSidebar: React.FC<ThumbnailSidebarProps> = ({ 
  editor, 
  isVisible, 
  onToggle 
}) => {
  const pages = useMemo(() => {
    if (!editor) return []
    
    const html = editor.getHTML()
    const parts = html.split(/<div[^>]*data-type="page-break"[^>]*><\/div>/gi)
    return parts.filter(part => part.trim().length > 0)
  }, [editor?.state])

  if (!isVisible) {
    return (
      <button
        onClick={onToggle}
        className="fixed left-4 top-1/2 -translate-y-1/2 z-40 bg-white border border-gray-200 rounded-r-lg p-2 shadow-lg hover:bg-gray-50 transition-colors"
        title="Show page thumbnails"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 3h18v18H3zM9 9h6v6H9z"/>
        </svg>
      </button>
    )
  }

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 shadow-lg z-30 overflow-y-auto">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-900">Pages</h3>
          <button
            onClick={onToggle}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            title="Hide thumbnails"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
        
        <div className="space-y-3">
          {pages.map((content, index) => (
            <div
              key={index}
              className="group cursor-pointer"
              onClick={() => {
                // Scroll to page logic could be implemented here
                console.log(`Navigate to page ${index + 1}`)
              }}
            >
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-2 hover:border-blue-300 transition-colors">
                <div className="aspect-[8.5/11] bg-white rounded shadow-sm overflow-hidden">
                  <div 
                    className="w-full h-full p-2 text-xs leading-tight text-gray-600 overflow-hidden"
                    style={{ 
                      fontSize: '6px',
                      lineHeight: '8px',
                      transform: 'scale(0.8)',
                      transformOrigin: 'top left'
                    }}
                    dangerouslySetInnerHTML={{ __html: content.substring(0, 200) + '...' }}
                  />
                </div>
                <div className="text-xs text-gray-500 text-center mt-1">
                  Page {index + 1}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}