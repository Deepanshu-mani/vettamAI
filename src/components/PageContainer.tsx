

import type React from "react"
import { forwardRef } from "react"
import { EditableHeaderFooter } from "./EditableHeaderFooter"

type Align = "start" | "center" | "end"

interface PageContainerProps {
  children: React.ReactNode
  pageNumber: number
  totalPages: number
  headerContent: string
  footerContent: string
  headerEnabled: boolean
  footerEnabled: boolean
  headerAlign: Align
  footerAlign: Align
  onHeaderChange: (content: string) => void
  onFooterChange: (content: string) => void
  zoom: number
  className?: string
  htmlContent?: string
}

export const PageContainer = forwardRef<HTMLDivElement, PageContainerProps>(
  (
    {
      children,
      pageNumber,
      totalPages,
      headerContent,
      footerContent,
      headerEnabled,
      footerEnabled,
      headerAlign,
      footerAlign,
      onHeaderChange,
      onFooterChange,
      zoom,
      className = "",
      htmlContent,
    },
    ref,
  ) => {
    const alignToClass = (align: Align) => {
      switch (align) {
        case "start":
          return "text-left"
        case "end":
          return "text-right"
        case "center":
          return "text-center"
        default:
          return "text-center"
      }
    }

    // A4 dimensions in pixels (96 DPI: 1 inch = 96px, 1mm = 3.779527559px)
    const A4_WIDTH_PX = 794 // 210mm = 794px
    const A4_HEIGHT_PX = 1123 // 297mm = 1123px

    return (
      <div
        ref={ref}
        className={`page-container bg-white mx-auto relative print:shadow-none border border-gray-300 ${className}`}
        style={{
          width: `${A4_WIDTH_PX}px`,
          height: `${A4_HEIGHT_PX}px`,
          minHeight: `${A4_HEIGHT_PX}px`,
          maxWidth: `${A4_WIDTH_PX}px`,
          transform: `scale(${zoom})`,
          transformOrigin: "top center",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.1)",
          marginBottom: `${20 / zoom}px`,
          pageBreakAfter: "always",
          pageBreakInside: "avoid",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden", // Prevent content overflow
        }}
        data-page={pageNumber}
      >
        {/* Page number indicator (only visible on screen) */}
        <div className="absolute -top-8 right-0 text-xs text-gray-500 font-mono bg-white px-3 py-1 rounded border border-gray-200 print:hidden shadow-sm">
          Page {pageNumber} of {totalPages}
        </div>

        {/* Header */}
        {headerEnabled && (
          <div
            className={`page-header px-12 pt-8 pb-4 border-b border-gray-200 print:border-gray-400 ${alignToClass(headerAlign)} flex-shrink-0`}
            style={{ minHeight: "80px" }}
          >
            <EditableHeaderFooter
              content={headerContent
                .replace(/\{pageNumber\}/g, pageNumber.toString())
                .replace(/\{totalPages\}/g, totalPages.toString())}
              onChange={onHeaderChange}
              align={headerAlign}
              placeholder="Enter header text... Use {pageNumber} and {totalPages} for dynamic values"
              className="text-gray-600 text-sm"
            />
          </div>
        )}

        {/* Main Content Area */}
        <div
          className="page-content flex-1"
          style={{
            padding: "24px 96px", // 1 inch side margins, smaller top/bottom
            fontSize: "12pt",
            lineHeight: "1.5",
            fontFamily: '"Times New Roman", Times, serif',
            color: "#000",
            overflow: "hidden", // Prevent content overflow
            height:
              headerEnabled && footerEnabled
                ? `${A4_HEIGHT_PX - 160}px` // Both header and footer
                : headerEnabled || footerEnabled
                  ? `${A4_HEIGHT_PX - 80}px` // One header or footer
                  : `${A4_HEIGHT_PX - 48}px`, // No header/footer
          }}
        >
          {children ? (
            children
          ) : htmlContent ? (
            <div
              dangerouslySetInnerHTML={{ __html: htmlContent }}
              className="document-content h-full overflow-hidden"
            />
          ) : (
            <div className="text-gray-400 text-center py-8">
              <p>Empty page</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {footerEnabled && (
          <div
            className={`page-footer px-12 pt-4 pb-8 border-t border-gray-200 print:border-gray-400 ${alignToClass(footerAlign)} relative flex-shrink-0`}
            style={{ minHeight: "80px" }}
          >
            <EditableHeaderFooter
              content={footerContent
                .replace(/\{pageNumber\}/g, pageNumber.toString())
                .replace(/\{totalPages\}/g, totalPages.toString())}
              onChange={onFooterChange}
              align={footerAlign}
              placeholder="Enter footer text... Use {pageNumber} and {totalPages} for dynamic values"
              className="text-gray-600 text-sm"
            />

            {/* Default page number if no footer content */}
            {!footerContent && (
              <div className="absolute bottom-4 right-12 text-xs text-gray-500 font-mono">{pageNumber}</div>
            )}
          </div>
        )}
      </div>
    )
  },
)

PageContainer.displayName = "PageContainer"
