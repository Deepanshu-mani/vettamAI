 

import { Node, mergeAttributes } from "@tiptap/core"
import { ReactNodeViewRenderer } from "@tiptap/react"
import type React from "react"
import { useContext, useId } from "react"
import type { NodeViewWrapperProps } from "@tiptap/react"
import { NodeViewWrapper } from "@tiptap/react"
import { TrashContext } from "../context/TextContext"
import { Trash2 } from "lucide-react"

// Type augmentation so Editor chain recognizes the custom command
declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    pageBreak: {
      setPageBreak: () => ReturnType
    }
  }
}

// Export the component so it can be imported elsewhere
export const PageBreakComponent = (props: NodeViewWrapperProps) => {
  const { setDragging, setDragPayload } = useContext(TrashContext)
  const id = useId()

  const deleteSelf = () => {
    const pos = typeof props.getPos === "function" ? props.getPos() : null
    if (pos == null || pos < 0) return

    // Use a more reliable deletion method
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
    setDragging(true)
    const pos = typeof props.getPos === "function" ? props.getPos() : -1
    setDragPayload({ type: "page-break", pos })

    // Set drag data
    e.dataTransfer?.setData("text/plain", `page-break:${id}`)

    // Create a custom drag image
    const dragImage = document.createElement("div")
    dragImage.textContent = "Page Break"
    dragImage.style.padding = "8px 12px"
    dragImage.style.backgroundColor = "white"
    dragImage.style.border = "1px solid #ccc"
    dragImage.style.borderRadius = "4px"
    dragImage.style.fontSize = "12px"
    dragImage.style.position = "absolute"
    dragImage.style.top = "-1000px"
    document.body.appendChild(dragImage)

    e.dataTransfer?.setDragImage(dragImage, 0, 0)

    // Clean up drag image after drag starts
    setTimeout(() => {
      document.body.removeChild(dragImage)
    }, 0)
  }

  const handleDragEnd = () => {
    setDragging(false)
    setDragPayload(null)
  }

  return (
    <NodeViewWrapper
      className="relative my-4 flex items-center select-none group cursor-pointer"
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      data-type="page-break"
      title="Page break - Drag to move or click delete to remove"
    >
      {/* Simple gray horizontal line */}
      <div className="flex-1 h-px bg-gray-400 relative">
        {/* Center label */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 py-1 text-xs text-gray-500 font-medium border border-gray-300 rounded opacity-0 group-hover:opacity-100 transition-opacity">
          Page Break
        </div>
      </div>

      {/* Delete button on hover */}
      <button
        type="button"
        onClick={deleteSelf}
        className="absolute -right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity rounded-full bg-white border border-gray-300 p-1.5 hover:bg-red-50 hover:border-red-300 shadow-sm"
        aria-label="Delete page break"
        title="Delete page break"
      >
        <Trash2 size={14} className="text-red-500" />
      </button>
    </NodeViewWrapper>
  )
}

export const PageBreak = Node.create({
  name: "pageBreak",
  group: "block",
  atom: true,
  selectable: false,
  draggable: true,

  addAttributes() {
    return {
      id: {
        default: null,
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="page-break"]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "page-break" })]
  },

  addNodeView() {
    return ReactNodeViewRenderer(PageBreakComponent)
  },

  addCommands() {
    return {
      setPageBreak:
        () =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              id: Math.random().toString(36).substr(2, 9),
            },
          })
        },
    }
  },

  addKeyboardShortcuts() {
    return {
      "Mod-Enter": () => this.editor.commands.setPageBreak(),
    }
  },
})
