import React, { useMemo } from "react"

type Align = "start" | "center" | "end"

interface PagePreviewPaneProps {
  html: string
  header: string
  footer: string
  headerEnabled: boolean
  footerEnabled: boolean
  headerAlign: Align
  footerAlign: Align
  showPageNumbers?: boolean
}

const alignToClass = (a: Align) =>
  a === "start" ? "text-left" : a === "end" ? "text-right" : "text-center"

export const PagePreviewPane: React.FC<PagePreviewPaneProps> = ({
  html,
  header,
  footer,
  headerEnabled,
  footerEnabled,
  headerAlign,
  footerAlign,
  showPageNumbers = true,
}) => {
  // Split by page breaks to generate pages
  const pages = useMemo(() => {
    const parts = html.split(/<div[^>]*data-type="page-break"[^>]*><\/div>/gi)
    return parts.filter(part => part.trim().length > 0)
  }, [html])

  return (
    <aside className="hidden xl:block w-[320px] shrink-0 border-l border-gray-200 bg-white shadow-sm">
      <div className="sticky top-0 h-screen overflow-auto p-6 space-y-4">
        <div className="flex items-center justify-between mb-4">
          <div className="text-base font-semibold text-gray-900">Document Preview</div>
          <div className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">{pages.length} {pages.length === 1 ? 'page' : 'pages'}</div>
        </div>
        
        <div className="space-y-4">
          {pages.map((content, idx) => (
            <div key={idx} className="group cursor-pointer">
              <div
                className="relative bg-white shadow-md rounded border border-gray-200 hover:shadow-lg transition-all duration-200 overflow-hidden"
                style={{
                  width: "100%",
                  aspectRatio: "8.27 / 11.69",
                  fontSize: "3px",
                  lineHeight: "1.2",
                }}
              >
                {/* Header */}
                {headerEnabled && (
                  <div
                    className={`px-2 pt-2 pb-1 text-gray-600 border-b border-gray-100 bg-gray-50 ${alignToClass(headerAlign)}`}
                    style={{ minHeight: "8%" }}
                  >
                    <div className="font-medium text-[3px] leading-tight" dangerouslySetInnerHTML={{ __html: header || "" }} />
                  </div>
                )}

                {/* Body */}
                <div 
                  className="px-2 py-1 text-[2.5px] leading-tight overflow-hidden" 
                  style={{ 
                    minHeight: headerEnabled && footerEnabled ? "76%" : headerEnabled || footerEnabled ? "84%" : "92%",
                    fontSize: "2.5px",
                    lineHeight: "1.1"
                  }}
                  dangerouslySetInnerHTML={{ __html: content }} 
                />

                {/* Footer */}
                {footerEnabled && (
                  <div
                    className={`absolute bottom-0 left-0 right-0 px-2 pt-1 pb-2 text-gray-600 border-t border-gray-100 bg-gray-50 ${alignToClass(footerAlign)}`}
                    style={{ minHeight: "8%" }}
                  >
                    <div className="font-medium text-[3px] leading-tight" dangerouslySetInnerHTML={{ __html: footer || "" }} />
                  </div>
                )}

                {/* Page number */}
                {showPageNumbers && (
                  <div
                    className="absolute text-gray-500 text-[2px] font-medium"
                    style={{ right: "6px", bottom: "4px" }}
                  >
                    Page {idx + 1} of {pages.length}
                  </div>
                )}
              </div>
              
              <div className="text-xs text-gray-600 text-center mt-2 opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                Page {idx + 1}
              </div>
            </div>
          ))}
        </div>
        
        {pages.length === 0 && (
            <div
              className="relative bg-white shadow-sm rounded border border-gray-200 hover:shadow-md transition-shadow"
              style={{
                width: "8.27in",
                minHeight: "11.69in",
            className="flex items-center justify-center h-32 text-gray-500 text-sm border-2 border-dashed border-gray-300 rounded-lg"
                transform: "scale(0.25)",
              aspectRatio: "8.27 / 11.69",
                <div
        )}
      </div>
    </aside>
  )
}
