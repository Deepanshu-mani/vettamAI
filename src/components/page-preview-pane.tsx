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
    return parts
  }, [html])

  return (
    <aside className="hidden xl:block w-[280px] shrink-0 border-l border-gray-200 bg-white shadow-sm">
      <div className="sticky top-0 h-screen overflow-auto p-4 space-y-6">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-gray-900">Page Preview</div>
          <div className="text-xs text-gray-500">{pages.length} pages</div>
        </div>
        {pages.map((content, idx) => (
          <div key={idx} className="group cursor-pointer">
            <div
              className="relative bg-white shadow-sm rounded border border-gray-200 hover:shadow-md transition-shadow"
              style={{
                width: "8.27in",
                minHeight: "11.69in",
                boxSizing: "border-box",
                transform: "scale(0.25)",
                transformOrigin: "top left",
              }}
            >
              {/* Header */}
              {headerEnabled && (
                <div
                  className={`px-8 pt-6 pb-2 text-sm text-gray-500 ${alignToClass(headerAlign)}`}
                  style={{ minHeight: "0.6in" }}
                  dangerouslySetInnerHTML={{ __html: header || "" }}
                />
              )}

              {/* Body */}
              <div className="px-8" dangerouslySetInnerHTML={{ __html: content }} />

              {/* Footer */}
              {footerEnabled && (
                <div
                  className={`px-8 pt-2 pb-6 text-sm text-gray-500 ${alignToClass(footerAlign)}`}
                  style={{ minHeight: "0.6in" }}
                  dangerouslySetInnerHTML={{ __html: footer || "" }}
                />
              )}

              {/* Page number bottom-right */}
              {showPageNumbers && (
                <div
                  className="absolute text-[10pt] text-gray-500"
                  style={{ right: "0.6in", bottom: "0.35in" }}
                >
                  Page {idx + 1} of {pages.length}
                </div>
              )}
            </div>
            <div className="text-xs text-gray-500 text-center mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
              Page {idx + 1}
            </div>
          </div>
        ))}
      </div>
    </aside>
  )
}
