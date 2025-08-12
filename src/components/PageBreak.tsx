import React, { useContext, useId } from 'react'
import type { NodeViewWrapperProps, CommandProps } from '@tiptap/react'
import { NodeViewWrapper } from '@tiptap/react'
import { TrashContext } from '../context/TextContext'
import { GripVertical, Trash2 } from 'lucide-react'

export const PageBreakComponent = (props: NodeViewWrapperProps) => {
  const { setDragging, setDragPayload } = useContext(TrashContext)
  const id = useId()

  const deleteSelf = () => {
    const pos = typeof props.getPos === 'function' ? props.getPos() : null
    if (pos == null || pos < 0) return
    
    // Use a more reliable deletion method
    const { state, view } = props.editor
    const from = pos
    const node = state.doc.nodeAt(from)
    
    if (node && node.type.name === 'pageBreak') {
      const to = pos + props.node.nodeSize
      const tr = state.tr.delete(from, to)
      view.dispatch(tr)
    }
  }

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    setDragging(true)
    const pos = typeof props.getPos === 'function' ? props.getPos() : -1
    setDragPayload({ type: 'page-break', pos })
    
    // Set drag data
    e.dataTransfer?.setData('text/plain', `page-break:${id}`)
    
    // Create a custom drag image
    const dragImage = document.createElement('div')
    dragImage.textContent = 'Page Break'
    dragImage.style.padding = '8px 12px'
    dragImage.style.backgroundColor = 'white'
    dragImage.style.border = '1px solid #ccc'
    dragImage.style.borderRadius = '4px'
    dragImage.style.fontSize = '12px'
    dragImage.style.position = 'absolute'
    dragImage.style.top = '-1000px'
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
      className="relative my-6 h-4 flex items-center select-none group"
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      data-type="page-break"
      title="Page break"
    >
      {/* Simple 1px professional line */}
      <div className="w-full border-t border-gray-300" />

      {/* Subtle drag handle */}
      <div
        className="absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
        title="Drag to move"
        aria-hidden="true"
      >
        <div className="rounded-md border border-gray-200 bg-white shadow-sm p-1">
          <GripVertical size={16} className="text-gray-500" />
        </div>
      </div>

      {/* Inline delete button */}
      <button
        type="button"
        onClick={deleteSelf}
        className="absolute -right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity rounded-md border border-gray-200 bg-white shadow-sm p-1 hover:bg-gray-50"
        aria-label="Delete page break"
        title="Delete"
      >
        <Trash2 size={16} className="text-red-500" />
      </button>
    </NodeViewWrapper>
  )
}
