import React, { useEffect, useRef } from "react"

interface ColorPopoverProps {
  open: boolean
  onClose: () => void
  onSelect: (color: string | null) => void
  anchor?: { top: number; left: number }
  title?: string
  colors?: string[]
}

export const ColorPopover: React.FC<ColorPopoverProps> = ({
  open,
  onClose,
  onSelect,
  anchor,
  title = "Highlight",
  colors = ["#fde68a", "#c7d2fe", "#fbcfe8", "#bbf7d0", "#bfdbfe", "#fef08a"]
}) => {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!ref.current) return
      if (!ref.current.contains(e.target as Node)) onClose()
    }
    if (open) document.addEventListener("mousedown", onDocClick)
    return () => document.removeEventListener("mousedown", onDocClick)
  }, [open, onClose])

  if (!open || !anchor) return null

  return (
    <div
      ref={ref}
      className="absolute z-50 shadow-lg rounded-2xl bg-white border border-gray-200 p-3"
      style={{
        top: anchor.top + 8,
        left: anchor.left - 120,
        width: 240,
      }}
      role="dialog"
      aria-label={title}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-500">{title}</span>
        <button
          onClick={() => onSelect(null)}
          className="text-xs text-gray-500 hover:text-gray-700"
          type="button"
          aria-label="Clear highlight"
          title="Clear"
        >
          ⃠
        </button>
      </div>
      <div className="flex items-center gap-3">
        {colors.map((c) => (
          <button
            key={c}
            onClick={() => onSelect(c)}
            className="h-6 w-6 rounded-full border border-gray-200 hover:scale-105 transition-transform"
            style={{ backgroundColor: c }}
            aria-label={`Select ${c}`}
            type="button"
          />
        ))}
      </div>
    </div>
  )
}
