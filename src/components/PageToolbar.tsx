
import type React from "react"
import { AlignLeft, AlignCenter, AlignRight, Ruler, ZoomIn, ZoomOut, Maximize, Droplets, Hash } from "lucide-react"

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
    "inline-flex items-center justify-center rounded-lg border border-transparent px-3 py-1.5 text-base font-medium bg-[#f9f9f9] cursor-pointer transition-colors duration-200 hover:bg-gray-100"

  const alignBtn = (current: Align, value: Align, set: (a: Align) => void, label: string, icon: React.ReactNode) => (
    <button
      type="button"
      onClick={() => set(value)}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-sm ${
        current === value
          ? "bg-gray-900 text-white border-gray-900"
          : "bg-white text-gray-900 border-gray-200 hover:bg-gray-100"
      }`}
      title={label}
    >
      {icon}
    </button>
  )

  const ToolbarSeparator = () => <div className="w-px h-6 bg-gray-200 mx-1 hidden md:block" />

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 p-1 bg-white rounded-lg">
      {/* Header & Footer Controls */}
      <div className="flex items-center gap-2">
        <label className="inline-flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={headerEnabled} onChange={(e) => onHeaderToggle(e.target.checked)} />
          Header
        </label>
        <div className="flex items-center gap-1">
          {alignBtn(headerAlign, "start", onHeaderAlignChange, "Header left", <AlignLeft size={16} />)}
          {alignBtn(headerAlign, "center", onHeaderAlignChange, "Header center", <AlignCenter size={16} />)}
          {alignBtn(headerAlign, "end", onHeaderAlignChange, "Header right", <AlignRight size={16} />)}
        </div>
      </div>

      <ToolbarSeparator />

      <div className="flex items-center gap-2">
        <label className="inline-flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={footerEnabled} onChange={(e) => onFooterToggle(e.target.checked)} />
          Footer
        </label>
        <div className="flex items-center gap-1">
          {alignBtn(footerAlign, "start", onFooterAlignChange, "Footer left", <AlignLeft size={16} />)}
          {alignBtn(footerAlign, "center", onFooterAlignChange, "Footer center", <AlignCenter size={16} />)}
          {alignBtn(footerAlign, "end", onFooterAlignChange, "Footer right", <AlignRight size={16} />)}
        </div>
      </div>

      <ToolbarSeparator />

      {/* Ruler Toggle */}
      <button
        type="button"
        onClick={() => onRulerToggle(!showRuler)}
        className={`${btnBase} ${showRuler ? "bg-blue-100 text-blue-700" : ""}`}
        title="Toggle Ruler"
      >
        <Ruler size={18} />
      </button>

      <ToolbarSeparator />

      {/* Zoom Controls */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onZoomChange(Math.max(0.5, zoom - 0.1))}
          className={btnBase}
          title="Zoom Out"
        >
          <ZoomOut size={18} />
        </button>
        <span className="px-2 py-1 text-sm text-gray-600 min-w-[60px] text-center">{Math.round(zoom * 100)}%</span>
        <button type="button" onClick={() => onZoomChange(Math.min(2, zoom + 0.1))} className={btnBase} title="Zoom In">
          <ZoomIn size={18} />
        </button>
        <button type="button" onClick={onFitToWidth} className={btnBase} title="Fit to Width">
          <Maximize size={18} />
        </button>
      </div>

      <ToolbarSeparator />

      {/* Watermark Button */}
      {/* <button
        type="button"
        className={btnBase}
        title="Add Watermark"
        onClick={() => alert("Watermark feature coming soon!")}
      >
        <Droplets size={18} />
      </button> */}

      <ToolbarSeparator />

      {/* Character Count */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg">
        <Hash size={16} className="text-gray-500" />
        <span className="text-sm text-gray-600">
          {wordCount} words, {charCount} chars
        </span>
      </div>
    </div>
  )
}
