 

import type React from "react"
import { useMemo } from "react"

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
  // Split by page breaks to generate pages if no pages provided
  const processedPages = useMemo(() => {
    if (pages.length > 0) {
      // Filter out empty pages
      return pages.filter((pageContent) => {
        const tempDiv = document.createElement("div")
        tempDiv.innerHTML = pageContent
        const textContent = tempDiv.textContent?.trim() || ""
        return textContent.length > 0
      })
    }

    // Fallback to splitting HTML by page breaks
    const parts = html.split(/<div[^>]*data-type="page-break"[^>]*>[\s\S]*?<\/div>/gi)
    return parts.filter((part) => {
      const tempDiv = document.createElement("div")
      tempDiv.innerHTML = part
      const textContent = tempDiv.textContent?.trim() || ""
      return textContent.length > 0
    })
  }, [pages, html])

  // Calculate exact A4 dimensions for preview
  const previewWidth = 180 // Fixed width for sidebar
  const a4AspectRatio = 297 / 210 // Height / Width ratio for A4
  const previewHeight = previewWidth * a4AspectRatio // Exact A4 proportions

  const formatContent = (content: string, pageNumber: number, totalPages: number) => {
    return content.replace(/\{pageNumber\}/g, pageNumber.toString()).replace(/\{totalPages\}/g, totalPages.toString())
  }

  return (
    <div className="w-full">
      <div className="space-y-6">
        <div className="text-sm font-medium text-gray-700 mb-4">
          Page Thumbnails ({processedPages.length} page{processedPages.length !== 1 ? "s" : ""})
        </div>
        {processedPages.map((content, idx) => (
          <div
            key={idx}
            className="mx-auto cursor-pointer hover:ring-2 hover:ring-blue-300 rounded transition-all"
            style={{ width: `${previewWidth}px` }}
            onClick={() => onPageClick?.(idx)}
          >
            <div
              className="relative bg-white shadow rounded overflow-hidden"
              style={{
                width: `${previewWidth}px`,
                height: `${previewHeight}px`,
              }}
            >
              {/* Scaled content container */}
              <div
                className="absolute inset-0 origin-top-left"
                style={{
                  transform: `scale(${previewWidth / 794})`, // Scale from actual A4 width (794px) to preview width
                  width: "794px", // Actual A4 width
                  height: "1123px", // Actual A4 height
                }}
              >
                {/* Header */}
                {headerEnabled && (
                  <div
                    className={`px-24 pt-12 pb-6 text-sm text-gray-500 border-b border-gray-100 ${alignToClass(headerAlign)}`}
                    style={{ minHeight: "80px" }}
                    dangerouslySetInnerHTML={{
                      __html: formatContent(header || "", idx + 1, processedPages.length),
                    }}
                  />
                )}

                {/* Body */}
                <div
                  className="px-24 py-6"
                  style={{
                    minHeight:
                      headerEnabled && footerEnabled ? "895px" : headerEnabled || footerEnabled ? "971px" : "1047px",
                    fontSize: "12pt",
                    fontFamily: '"Times New Roman", Times, serif',
                    lineHeight: "1.5",
                    color: "#000",
                    wordWrap: "break-word",
                    overflowWrap: "break-word",
                    whiteSpace: "normal",
                  }}
                  dangerouslySetInnerHTML={{ __html: content }}
                />

                {/* Footer */}
                {footerEnabled && (
                  <div
                    className={`px-24 pt-6 pb-12 text-sm text-gray-500 border-t border-gray-100 ${alignToClass(footerAlign)} relative`}
                    style={{ minHeight: "80px" }}
                    dangerouslySetInnerHTML={{
                      __html: formatContent(footer || "", idx + 1, processedPages.length),
                    }}
                  />
                )}

                {/* Page number bottom-right */}
                {showPageNumbers && (
                  <div className="absolute text-xs text-gray-500" style={{ right: "24px", bottom: "24px" }}>
                    Page {idx + 1} of {processedPages.length}
                  </div>
                )}
              </div>
            </div>

            {/* Page label overlay */}
            <div className="mt-2 text-center">
              <span className="inline-block bg-blue-600 text-white text-xs px-2 py-1 rounded font-medium">
                Page {idx + 1}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
