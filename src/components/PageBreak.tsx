 

import type React from "react"
import { useContext, useId, useState } from "react"
import type { NodeViewWrapperProps } from "@tiptap/react"
import { NodeViewWrapper } from "@tiptap/react"
import { TrashContext } from "../context/TextContext"
import { GripVertical, Trash2, Move } from "lucide-react"

export const PageBreakComponent = (props: NodeViewWrapperProps) => {
  const { setDragging, setDragPayload } = useContext(TrashContext)
  const [isHovered, setIsHovered] = useState(false)
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
    dragImage.innerHTML = `
      <div style="
        padding: 8px 16px;
        background: white;
        border: 2px solid #3b82f6;
        border-radius: 8px;
        font-size: 12px;
        font-weight: 600;
        color: #3b82f6;
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        display: flex;
        align-items: center;
        gap: 8px;
      ">
        <span>📄</span>
        <span>Page Break</span>
      </div>
    `
    dragImage.style.position = "absolute"
    dragImage.style.top = "-1000px"
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
      className="page-break-wrapper group my-6 select-none"
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-type="page-break"
      title="Page break - Drag to move or hover to see controls"
      style={{
        position: "relative",
        cursor: "grab",
        userSelect: "none",
      }}
    >
      {/* Always visible page break line */}
      <div
        className="page-break-line"
        style={{
          width: "100%",
          height: "2px",
          background: "linear-gradient(90deg, transparent 0%, #3b82f6 20%, #3b82f6 80%, transparent 100%)",
          borderRadius: "1px",
          position: "relative",
          transition: "all 0.2s ease",
        }}
      />

      {/* Hover-visible label */}
      <div
        className="page-break-label"
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          background: "white",
          color: "#3b82f6",
          fontSize: "10px",
          fontWeight: "600",
          padding: "2px 8px",
          border: "1px solid #3b82f6",
          borderRadius: "12px",
          whiteSpace: "nowrap",
          opacity: isHovered ? 1 : 0,
          transition: "opacity 0.2s ease",
          pointerEvents: "none",
        }}
      >
        Page Break
      </div>

      {/* Hover-visible controls */}
      <div
        className="page-break-controls"
        style={{
          position: "absolute",
          right: "-120px",
          top: "50%",
          transform: "translateY(-50%)",
          display: "flex",
          alignItems: "center",
          gap: "4px",
          background: "white",
          border: "1px solid #e5e7eb",
          borderRadius: "20px",
          padding: "4px 8px",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          opacity: isHovered ? 1 : 0,
          transition: "opacity 0.2s ease",
          pointerEvents: isHovered ? "all" : "none",
        }}
      >
        {/* Drag handle */}
        <div
          className="page-break-control"
          title="Drag to move page break"
          style={{
            width: "20px",
            height: "20px",
            borderRadius: "4px",
            border: "1px solid #d1d5db",
            background: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "grab",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#3b82f6"
            e.currentTarget.style.background = "#f3f4f6"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#d1d5db"
            e.currentTarget.style.background = "white"
          }}
        >
          <GripVertical size={12} className="text-gray-500" />
        </div>

        {/* Move indicator */}
        <div
          className="page-break-control"
          title="Drag anywhere on the line to move"
          style={{
            width: "20px",
            height: "20px",
            borderRadius: "4px",
            border: "1px solid #d1d5db",
            background: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#3b82f6"
            e.currentTarget.style.background = "#f3f4f6"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#d1d5db"
            e.currentTarget.style.background = "white"
          }}
        >
          <Move size={12} className="text-gray-500" />
        </div>

        {/* Delete button */}
        <button
          type="button"
          onClick={deleteSelf}
          className="page-break-control delete"
          aria-label="Delete page break"
          title="Delete page break"
          style={{
            width: "20px",
            height: "20px",
            borderRadius: "4px",
            border: "1px solid #d1d5db",
            background: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#ef4444"
            e.currentTarget.style.background = "#fef2f2"
            e.currentTarget.style.color = "#ef4444"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#d1d5db"
            e.currentTarget.style.background = "white"
            e.currentTarget.style.color = "inherit"
          }}
        >
          <Trash2 size={12} />
        </button>
      </div>

      <style>{`
        .page-break-wrapper:hover .page-break-line {
          background: linear-gradient(90deg, transparent 0%, #2563eb 20%, #2563eb 80%, transparent 100%) !important;
        }
        
        .page-break-wrapper:active {
          cursor: grabbing !important;
        }
      `}</style>
    </NodeViewWrapper>
  )
}
