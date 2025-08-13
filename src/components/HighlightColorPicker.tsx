 

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom"
import type { Editor } from "@tiptap/react"
import { Highlighter, X } from "lucide-react"
import { TOOLBAR_BUTTON_CLASS, TOOLBAR_ICON_SIZE } from "./toolbar.config"

interface HighlightColorPickerProps {
  editor: Editor | null
}

// Unique, non-repeating set of highlight colors
const HIGHLIGHT_COLORS = [
  "#fef08a", // yellow-200
  "#fed7aa", // orange-200
  "#fecaca", // red-200
  "#f9a8d4", // pink-200
  "#ddd6fe", // violet-200
  "#c7d2fe", // indigo-200
  "#bfdbfe", // blue-200
  "#a7f3d0", // emerald-200
  "#bbf7d0", // green-200
  "#fde68a", // amber-200
  "#f3e8ff", // purple-200
  "#e0e7ff", // indigo-100
]

export const HighlightColorPicker: React.FC<HighlightColorPickerProps> = ({ editor }) => {
  const [isOpen, setIsOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState<{ top: number; left: number; placement: "top" | "bottom" } | null>(null)

  const btnBase = TOOLBAR_BUTTON_CLASS

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  const updatePosition = () => {
    const btn = buttonRef.current
    if (!btn) return
    const rect = btn.getBoundingClientRect()
    const viewportHeight = window.innerHeight
    const estimatedHeight = 220 // approximate dropdown height
    const spaceBelow = viewportHeight - rect.bottom
    const placement: "top" | "bottom" = spaceBelow < estimatedHeight ? "top" : "bottom"
    const top = placement === "bottom" ? rect.bottom + 8 : rect.top - estimatedHeight - 8
    const left = rect.left + rect.width / 2
    setPosition({ top, left, placement })
  }

  const handleToggle = () => {
    const next = !isOpen
    setIsOpen(next)
    if (!next) return
    // position immediately
    updatePosition()
    // and after rendering to correct height if needed
    setTimeout(updatePosition, 0)
  }

  const handleColorSelect = (color: string) => {
    if (!editor) return
    editor.chain().focus().setHighlight({ color }).run()
    setIsOpen(false)
  }

  const handleClearHighlight = () => {
    if (!editor) return
    editor.chain().focus().unsetHighlight().run()
    setIsOpen(false)
  }

  if (!editor) return null

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        className={btnBase}
        onClick={handleToggle}
        aria-label="Highlight"
        title="Highlight"
        type="button"
      >
        <Highlighter size={TOOLBAR_ICON_SIZE} />
      </button>

      {isOpen &&
        position &&
        createPortal(
          <div
            ref={dropdownRef}
            style={{
              position: "fixed",
              top: position.top,
              left: position.left,
              transform: "translateX(-50%)",
              zIndex: 60,
              minWidth: "240px",
            }}
            className="bg-white border border-gray-200 rounded-lg shadow-xl p-3"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">Highlight Color</span>
              <button
                onClick={handleClearHighlight}
                className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                type="button"
                title="Clear highlight"
              >
                <X
                  size={20}
                  className="text-red-500 border border-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all ease-in-out duration-200 p-[2px]"
                />
              </button>
            </div>
            <div className="grid grid-cols-6 gap-2">
              {HIGHLIGHT_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => handleColorSelect(color)}
                  className="w-8 h-8 rounded-full border border-gray-200 hover:scale-105 transition-transform focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ backgroundColor: color }}
                  title={`Highlight with ${color}`}
                  type="button"
                />
              ))}
            </div>
          </div>,
          document.body,
        )}
    </div>
  )
}
