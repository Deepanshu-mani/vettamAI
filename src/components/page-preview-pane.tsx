

import type React from "react"
import { useMemo } from "react"
import { FileText, Eye } from "lucide-react"

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
  pages?: string[]
}

const alignToClass = (a: Align) => (a === "start" ? "text-left" : a === "end" ? "text-right" : "text-center")

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
  pages = [],
}) => {
  // Use provided pages or split by page breaks
  const pageContents = useMemo(() => {
    if (pages.length > 0) return pages

    // Fallback: split by page breaks
    const parts = html.split(/<div[^>]*data-type="page-break"[^>]*><\/div>/gi)
    return parts.filter((part) => part.trim())
  }, [html, pages])

  if (pageContents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <FileText size={48} className="mb-4 opacity-50" />
        <p className="text-sm">No content to preview</p>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="space-y-6">
        {/* Enhanced Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Eye size={18} className="text-blue-600" />
            <div>
              <h4 className="text-sm font-semibold text-gray-900">Page Preview</h4>
              <p className="text-xs text-gray-500 mt-0.5">
                {pageContents.length} page{pageContents.length !== 1 ? "s" : ""} • Click to navigate
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced Page Grid */}
        <div className="grid gap-4">
          {pageContents.map((content, idx) => (
            <div
              key={`preview-${idx}`}
              className="group cursor-pointer transition-all duration-200 hover:scale-[1.02]"
              onClick={() => onPageClick?.(idx)}
            >
              {/* Page preview container with proper A4 aspect ratio */}
              <div
                className="relative bg-white shadow-md rounded-xl overflow-hidden border border-gray-200 group-hover:shadow-xl group-hover:border-blue-200 transition-all duration-200"
                style={{
                  width: "220px",
                  height: "311px", // Maintains A4 aspect ratio (794:1123 = 220:311)
                  margin: "0 auto",
                }}
              >
                {/* Enhanced Page Label */}
                <div className="absolute top-3 left-3 z-10">
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs px-3 py-1.5 rounded-full font-semibold shadow-lg">
                    Page {idx + 1}
                  </div>
                </div>

                {/* Page Number Badge */}
                {showPageNumbers && (
                  <div className="absolute top-3 right-3 z-10">
                    <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded-full font-mono">{idx + 1}</div>
                  </div>
                )}

                {/* Miniature page content with better scaling */}
                <div
                  className="absolute inset-0 overflow-hidden bg-white"
                  style={{
                    fontSize: "2px",
                    lineHeight: "1.2",
                    transform: "scale(0.28)",
                    transformOrigin: "top left",
                    width: "785px",
                    height: "1110px",
                  }}
                >
                  {/* Header */}
                  {headerEnabled && (
                    <div
                      className={`px-12 pt-8 pb-4 text-gray-600 border-b border-gray-200 ${alignToClass(headerAlign)}`}
                      style={{ minHeight: "80px", fontSize: "14px" }}
                      dangerouslySetInnerHTML={{
                        __html: (header || "Header")
                          .replace(/\{pageNumber\}/g, (idx + 1).toString())
                          .replace(/\{totalPages\}/g, pageContents.length.toString()),
                      }}
                    />
                  )}

                  {/* Body */}
                  <div
                    className="px-24 py-6 text-gray-800"
                    style={{
                      minHeight:
                        headerEnabled && footerEnabled ? "950px" : headerEnabled || footerEnabled ? "1010px" : "1070px",
                      fontSize: "14px",
                      lineHeight: "1.4",
                    }}
                    dangerouslySetInnerHTML={{ __html: content }}
                  />

                  {/* Footer */}
                  {footerEnabled && (
                    <div
                      className={`px-12 pt-4 pb-8 text-gray-600 border-t border-gray-200 ${alignToClass(footerAlign)} relative`}
                      style={{ minHeight: "80px", fontSize: "14px" }}
                      dangerouslySetInnerHTML={{
                        __html: (footer || "Footer")
                          .replace(/\{pageNumber\}/g, (idx + 1).toString())
                          .replace(/\{totalPages\}/g, pageContents.length.toString()),
                      }}
                    />
                  )}
                </div>

                {/* Enhanced Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />

                {/* Click indicator */}
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-300 rounded-xl transition-colors duration-200" />
              </div>

              {/* Enhanced Page Info */}
              <div className="mt-3 text-center">
                <div className="text-sm font-semibold text-gray-900">Page {idx + 1}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {content.length > 100 ? `${Math.round(content.length / 100)} KB` : "< 1 KB"}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Enhanced Footer Info */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>Document Preview</span>
            <span>{pageContents.length} total pages</span>
          </div>
        </div>
      </div>
    </div>
  )
}
