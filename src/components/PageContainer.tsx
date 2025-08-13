 

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

    // A4 dimensions in pixels (96 DPI: 1mm = 3.779527559px)
    const A4_WIDTH_PX = 794 // 210mm = 794px
    const A4_HEIGHT_PX = 1123 // 297mm = 1123px

    return (
      <div
        ref={ref}
        className={`page-container bg-white mx-auto relative print:shadow-none border border-gray-200 ${className}`}
        style={{
          width: `${A4_WIDTH_PX}px`,
          height: `${A4_HEIGHT_PX}px`,
          minHeight: `${A4_HEIGHT_PX}px`,
          maxWidth: `${A4_WIDTH_PX}px`,
          transform: `scale(${zoom})`,
          transformOrigin: "top center",
          boxShadow: "0 4px 12px -2px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          marginBottom: `${20 / zoom}px`,
          pageBreakAfter: "always",
          pageBreakInside: "avoid",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          position: "relative",
        }}
        data-page={pageNumber}
      >
        {/* Page number indicator (only visible on screen) */}
        <div className="absolute -top-6 right-0 text-xs text-gray-400 font-mono bg-gray-50 px-2 py-1 rounded print:hidden">
          {pageNumber}
        </div>

        {/* A4 visual boundaries */}
        <div className="absolute inset-0 pointer-events-none print:hidden opacity-30">
          {/* Corner markers */}
          <div className="absolute top-2 left-2 w-3 h-3 border-l-2 border-t-2 border-blue-300"></div>
          <div className="absolute top-2 right-2 w-3 h-3 border-r-2 border-t-2 border-blue-300"></div>
          <div className="absolute bottom-2 left-2 w-3 h-3 border-l-2 border-b-2 border-blue-300"></div>
          <div className="absolute bottom-2 right-2 w-3 h-3 border-r-2 border-b-2 border-blue-300"></div>

          {/* Margin guides */}
          <div
            className="absolute border border-dashed border-blue-200"
            style={{
              top: "96px",
              left: "96px",
              right: "96px",
              bottom: "96px",
            }}
          ></div>
        </div>

        {/* Header */}
        {headerEnabled && (
          <div
            className={`page-header px-24 pt-12 pb-6 ${alignToClass(headerAlign)} flex-shrink-0 relative z-10`}
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
          className="page-content flex-1 relative"
          style={{
            padding: "32px 96px", // Increased from 24px to 32px for top/bottom
            fontSize: "12pt",
            lineHeight: "1.5",
            fontFamily: '"Times New Roman", Times, serif',
            color: "#000",
            overflow: "hidden",
            width: "100%",
            maxWidth: "100%",
            boxSizing: "border-box",
            height:
              headerEnabled && footerEnabled
                ? `${A4_HEIGHT_PX - 160}px` // Adjust for increased padding
                : headerEnabled || footerEnabled
                  ? `${A4_HEIGHT_PX - 96}px` // Adjust for increased padding
                  : `${A4_HEIGHT_PX - 64}px`, // Adjust for increased padding
          }}
        >
          {children ? (
            <div
              style={{
                width: "100%",
                maxWidth: "100%",
                wordWrap: "break-word",
                overflowWrap: "break-word",
                whiteSpace: "normal",
                boxSizing: "border-box",
              }}
            >
              {children}
            </div>
          ) : htmlContent ? (
            <div
              dangerouslySetInnerHTML={{ __html: htmlContent }}
              className="document-content h-full overflow-hidden"
              style={{
                width: "100%",
                maxWidth: "100%",
                wordWrap: "break-word",
                overflowWrap: "break-word",
                whiteSpace: "normal",
              }}
            />
          ) : (
            <div className="text-gray-400 text-center py-16">
              
              <div className="flex flex-wrap justify-center gap-3">
                <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-600 transition-colors">
                  📝 To-do List
                </button>
                <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-600 transition-colors">
                  ⚡ Notes
                </button>
                <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-600 transition-colors">
                  📋 Weekly Plan
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {footerEnabled && (
          <div
            className={`page-footer px-24 pt-6 pb-12 ${alignToClass(footerAlign)} relative flex-shrink-0 z-10`}
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
              <div className="absolute bottom-6 right-24 text-xs text-gray-400 font-mono">{pageNumber}</div>
            )}
          </div>
        )}
      </div>
    )
  },
)

PageContainer.displayName = "PageContainer"
