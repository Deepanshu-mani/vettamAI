
import type React from "react"
import { AlignLeft, AlignCenter, AlignRight, Ruler, ZoomIn, ZoomOut, Maximize, Hash, RotateCcw } from "lucide-react"

type Align = "start" | "center" | "end"

interface PageToolbarProps {
  headerEnabled: boolean
  footerEnabled: boolean
  headerAlign: Align
  footerAlign: Align
  showRuler: boolean
  zoom: number
  wordCount: number
  charCount: number
  onHeaderToggle: (enabled: boolean) => void
  onFooterToggle: (enabled: boolean) => void
  onHeaderAlignChange: (align: Align) => void
  onFooterAlignChange: (align: Align) => void
  onRulerToggle: (show: boolean) => void
  onZoomChange: (zoom: number) => void
  onFitToWidth: () => void
}

export const PageToolbar: React.FC<PageToolbarProps> = ({
  headerEnabled,
  footerEnabled,
  headerAlign,
  footerAlign,
  showRuler,
  zoom,
  wordCount,
  charCount,
  onHeaderToggle,
  onFooterToggle,
  onHeaderAlignChange,
  onFooterAlignChange,
  onRulerToggle,
  onZoomChange,
  onFitToWidth,
}) => {
  const btnBase =
    "inline-flex items-center justify-center rounded-lg border border-transparent px-3 py-1.5 text-sm font-medium bg-white hover:bg-gray-50 cursor-pointer transition-colors duration-200 border-gray-200"

  const alignBtn = (current: Align, value: Align, set: (a: Align) => void, label: string, icon: React.ReactNode) => (
    <button
      type="button"
      onClick={() => set(value)}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-sm transition-colors ${
        current === value
          ? "bg-blue-600 text-white border-blue-600 shadow-sm"
          : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
      }`}
      title={label}
    >
      {icon}
    </button>
  )

  const ToolbarSeparator = () => <div className="w-px h-6 bg-gray-200 mx-2" />

  // Predefined zoom levels
  const zoomLevels = [0.3, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2]
  const currentZoomIndex = zoomLevels.findIndex((level) => Math.abs(level - zoom) < 0.05)

  const handleZoomIn = () => {
    if (currentZoomIndex >= 0 && currentZoomIndex < zoomLevels.length - 1) {
      onZoomChange(zoomLevels[currentZoomIndex + 1])
    } else {
      onZoomChange(Math.min(1.2, zoom + 0.1))
    }
  }

  const handleZoomOut = () => {
    if (currentZoomIndex > 0) {
      onZoomChange(zoomLevels[currentZoomIndex - 1])
    } else {
      onZoomChange(Math.max(0.3, zoom - 0.1))
    }
  }

  const handleResetZoom = () => {
    onZoomChange(0.8) // Default zoom for A4
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 p-2 bg-gray-50 rounded-lg">
      {/* Header Controls */}
      <div className="flex items-center gap-2">
        <label className="inline-flex items-center gap-2 text-sm text-gray-700 font-medium">
          <input
            type="checkbox"
            checked={headerEnabled}
            onChange={(e) => onHeaderToggle(e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          Header
        </label>
        <div className="flex items-center gap-1">
          {alignBtn(headerAlign, "start", onHeaderAlignChange, "Header left", <AlignLeft size={16} />)}
          {alignBtn(headerAlign, "center", onHeaderAlignChange, "Header center", <AlignCenter size={16} />)}
          {alignBtn(headerAlign, "end", onHeaderAlignChange, "Header right", <AlignRight size={16} />)}
        </div>
      </div>

      <ToolbarSeparator />

      {/* Footer Controls */}
      <div className="flex items-center gap-2">
        <label className="inline-flex items-center gap-2 text-sm text-gray-700 font-medium">
          <input
            type="checkbox"
            checked={footerEnabled}
            onChange={(e) => onFooterToggle(e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          Footer
        </label>
        <div className="flex items-center gap-1">
          {alignBtn(footerAlign, "start", onFooterAlignChange, "Footer left", <AlignLeft size={16} />)}
          {alignBtn(footerAlign, "center", onFooterAlignChange, "Footer center", <AlignCenter size={16} />)}
          {alignBtn(footerAlign, "end", onFooterAlignChange, "Footer right", <AlignRight size={16} />)}
        </div>
      </div>

      <ToolbarSeparator />

      {/* View Controls */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onRulerToggle(!showRuler)}
          className={`${btnBase} ${showRuler ? "bg-blue-100 text-blue-700 border-blue-200" : ""}`}
          title="Toggle Ruler"
        >
          <Ruler size={16} />
          <span className="ml-1 text-xs">Ruler</span>
        </button>
      </div>

      <ToolbarSeparator />

      {/* Enhanced Zoom Controls */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 bg-white rounded-lg border border-gray-200 p-1">
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={zoom <= 0.3}
            className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Zoom Out"
          >
            <ZoomOut size={16} />
          </button>

          <div className="flex items-center gap-2 px-2">
            <span className="text-sm font-mono font-medium text-gray-700 min-w-[45px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={handleResetZoom}
              className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
              title="Reset to 80%"
            >
              <RotateCcw size={12} />
            </button>
          </div>

          <button
            type="button"
            onClick={handleZoomIn}
            disabled={zoom >= 1.2}
            className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Zoom In"
          >
            <ZoomIn size={16} />
          </button>
        </div>

        <button type="button" onClick={onFitToWidth} className={btnBase} title="Fit to Width">
          <Maximize size={16} />
          <span className="ml-1 text-xs">Fit</span>
        </button>
      </div>

      <ToolbarSeparator />

      {/* Document Stats */}
      <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-gray-200">
        <Hash size={16} className="text-gray-500" />
        <div className="text-sm text-gray-700">
          <span className="font-medium">{wordCount.toLocaleString()}</span>
          <span className="text-gray-500 mx-1">words</span>
          <span className="text-gray-400">•</span>
          <span className="font-medium ml-1">{charCount.toLocaleString()}</span>
          <span className="text-gray-500 ml-1">chars</span>
        </div>
      </div>
    </div>
  )
}
