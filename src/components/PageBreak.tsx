

import type React from "react"
import { useContext, useId } from "react"
import type { NodeViewWrapperProps } from "@tiptap/react"
import { NodeViewWrapper } from "@tiptap/react"
import { TrashContext } from "../context/TextContext"
import { GripVertical, Trash2 } from "lucide-react"

export const PageBreakComponent = (props: NodeViewWrapperProps) => {
  const { setDragging, setDragPayload } = useContext(TrashContext)
  const id = useId()

  const deleteSelf = () => {
    const pos = typeof props.getPos === "function" ? props.getPos() : null
    if (pos == null || pos < 0) return

    const { state, view } = props.editor
    const from = pos
    const node = state.doc.nodeAt(from)

    if (node && node.type.name === "pageBreak") {
      const to = pos + props.node.nodeSize
      const tr = state.tr.delete(from, to)
      view.dispatch(tr)
    }
  }

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.stopPropagation()
    setDragging(true)
    const pos = typeof props.getPos === "function" ? props.getPos() : -1
    setDragPayload({ type: "page-break", pos })

    // Set drag data
    e.dataTransfer.setData("text/plain", `page-break:${id}`)
    e.dataTransfer.effectAllowed = "move"

    // Create a custom drag image
    const dragImage = document.createElement("div")
    dragImage.textContent = "📄 Page Break"
    dragImage.style.cssText = `
      padding: 8px 16px;
      background: white;
      border: 2px solid #3b82f6;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      color: #3b82f6;
      position: absolute;
      top: -1000px;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    `
    document.body.appendChild(dragImage)

    e.dataTransfer.setDragImage(dragImage, 0, 0)

    // Clean up drag image
    setTimeout(() => {
      if (document.body.contains(dragImage)) {
        document.body.removeChild(dragImage)
      }
    }, 0)
  }

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.stopPropagation()
    setDragging(false)
    setDragPayload(null)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  return (
    <NodeViewWrapper
      className="relative my-10 h-8 flex items-center select-none group cursor-grab active:cursor-grabbing"
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      data-type="page-break"
      title="Page break - Drag to move or click delete to remove"
    >
      {/* Enhanced page break line with better visibility */}
      <div className="w-full relative">
        <div className="w-full border-t-2 border-dashed border-blue-500 bg-gradient-to-r from-transparent via-blue-100 to-transparent h-1" />

        {/* Page break label */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-3 py-0.5 border border-blue-300 rounded-full text-[10px] font-semibold text-blue-600 shadow-sm">
          Page break
        </div>
      </div>

      {/* Enhanced drag handle */}
      <div
        className="absolute -left-10 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-grab active:cursor-grabbing"
        title="Drag to move page break"
        aria-hidden="true"
      >
        <div className="rounded-lg border-2 border-blue-200 bg-white shadow-md p-2 hover:border-blue-400 hover:shadow-lg transition-all">
          <GripVertical size={16} className="text-blue-500" />
        </div>
      </div>

      {/* Enhanced delete button */}
      <button
        type="button"
        onClick={deleteSelf}
        className="absolute -right-10 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 rounded-lg border border-red-200 bg-white shadow p-2 hover:border-red-400 hover:shadow-lg hover:bg-red-50"
        aria-label="Delete page break"
        title="Delete page break"
      >
        <Trash2 size={16} className="text-red-500" />
      </button>
    </NodeViewWrapper>
  )
}
