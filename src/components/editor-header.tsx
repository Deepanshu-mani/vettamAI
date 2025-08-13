

import type React from "react"
import type { Editor as TiptapEditor } from "@tiptap/react"
import { Toolbar } from "./Toolbar"
import { PageToolbar } from "./PageToolbar"
import { TabBar } from "./TabBar"
import { EditorActions } from "./editor-actions"

type Align = "start" | "center" | "end"

interface EditorHeaderProps {
  editor: TiptapEditor | null
  wordCount: number
  charCount: number
  pageCount: number
  activeTab: "text" | "page"
  headerEnabled: boolean
  footerEnabled: boolean
  headerAlign: Align
  footerAlign: Align
  showRuler: boolean
  zoom: number
  onTabChange: (tab: "text" | "page") => void
  onHeaderToggle: (enabled: boolean) => void
  onFooterToggle: (enabled: boolean) => void
  onHeaderAlignChange: (align: Align) => void
  onFooterAlignChange: (align: Align) => void
  onRulerToggle: (show: boolean) => void
  onZoomChange: (zoom: number) => void
  onFitToWidth: () => void
  onExport: () => void
  onPrint: () => void
  onPageBreak: () => void
}

export const EditorHeader: React.FC<EditorHeaderProps> = ({
  editor,
  activeTab,
  headerEnabled,
  footerEnabled,
  headerAlign,
  footerAlign,
  showRuler,
  zoom,
  onTabChange,
  onHeaderToggle,
  onFooterToggle,
  onHeaderAlignChange,
  onFooterAlignChange,
  onRulerToggle,
  onZoomChange,
  onFitToWidth,
  onExport,
  onPrint,
  onPageBreak,
}) => {
  return (
    <header className="w-full sticky top-0 z-20">
      <div className=" mx-auto px-2 py-3">
        <div className="rounded-xl bg-white/60 backdrop-blur border border-gray-200 shadow-sm px-3 py-2">
          {/* Single-line header: tabs | toolbar (scrollable) | actions */}
          <div className="flex items-center gap-3">
            {/* Left: Tab Bar */}
            <div className="shrink-0">
              <TabBar activeTab={activeTab} onTabChange={onTabChange} />
            </div>

            {/* Center: Toolbar area with horizontal scroll when needed */}
            <div className="min-w-0 flex-1 overflow-hidden">
              <div className="overflow-x-auto scrollbar-none">
                <div className="min-w-full">
                  {activeTab === "text" ? (
                    <Toolbar editor={editor} />
                  ) : (
                    <PageToolbar
                      headerEnabled={headerEnabled}
                      footerEnabled={footerEnabled}
                      headerAlign={headerAlign}
                      footerAlign={footerAlign}
                      showRuler={showRuler}
                      zoom={zoom}
                      onHeaderToggle={onHeaderToggle}
                      onFooterToggle={onFooterToggle}
                      onHeaderAlignChange={onHeaderAlignChange}
                      onFooterAlignChange={onFooterAlignChange}
                      onRulerToggle={onRulerToggle}
                      onZoomChange={onZoomChange}
                      onFitToWidth={onFitToWidth}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="shrink-0">
              <EditorActions onExport={onExport} onPrint={onPrint} onPageBreak={onPageBreak} />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
