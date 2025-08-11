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
  onPageClick?: (pageIndex: number) => void
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
  onPageClick,
}) => {
  // Split by page breaks to generate pages
  const pages = useMemo(() => {
    const parts = html.split(/<div[^>]*data-type="page-break"[^>]*><\/div>/gi)
    return parts
  }, [html])

  return (
    <div className="w-full">
      <div className="space-y-6">
        <div className="text-sm font-medium text-gray-700">Preview</div>
        {pages.map((content, idx) => (
          <div 
            key={idx} 
            className="mx-auto w-[220px] cursor-pointer hover:ring-2 hover:ring-blue-300 rounded transition-all"
            onClick={() => onPageClick?.(idx)}
          >
            <div
              className="relative bg-white shadow rounded"
              style={{
                width: "210mm",
                minHeight: "297mm",
                boxSizing: "border-box",
                transform: "scale(0.15)",
                transformOrigin: "top left",
              }}
            >
              {/* Header */}
              {headerEnabled && (
                <div
                  className={`px-8 pt-6 pb-2 text-sm text-gray-500 border-b border-gray-100 ${alignToClass(headerAlign)}`}
                  style={{ minHeight: "20mm" }}
                  dangerouslySetInnerHTML={{ __html: header || "" }}
                />
              )}

              {/* Body */}
              <div 
                className="px-8 py-4" 
                style={{ 
                  minHeight: headerEnabled && footerEnabled ? '237mm' : 
                             headerEnabled || footerEnabled ? '257mm' : '277mm'
                }}
                dangerouslySetInnerHTML={{ __html: content }} 
              />

              {/* Footer */}
              {footerEnabled && (
                <div
                  className={`px-8 pt-2 pb-6 text-sm text-gray-500 border-t border-gray-100 ${alignToClass(footerAlign)} relative`}
                  style={{ minHeight: "20mm" }}
                  dangerouslySetInnerHTML={{ __html: footer || "" }}
                />
              )}

              {/* Page number bottom-right */}
              {showPageNumbers && (
                <div
                  className="absolute text-xs text-gray-500"
                  style={{ right: "8mm", bottom: "8mm" }}
                >
                  Page {idx + 1} of {pages.length}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
