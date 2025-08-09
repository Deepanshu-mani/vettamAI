import React, { useContext, useId } from 'react'
import type { NodeViewWrapperProps, CommandProps } from '@tiptap/react'
import { NodeViewWrapper } from '@tiptap/react'
import { TrashContext } from '../context/TextContext'
import { GripVertical, Trash2 } from 'lucide-react'

export const PageBreakComponent = (props: NodeViewWrapperProps) => {
  const { isDragging, setDragging, setDragPayload } = useContext(TrashContext)
  const id = useId()

  const deleteSelf = () => {
    const pos = typeof props.getPos === 'function' ? props.getPos() : null
    if (pos == null || pos < 0) return
    props.editor.commands.command(({ tr }: CommandProps) => {      const from = pos
      const to = pos + props.node.nodeSize
      tr.delete(from, to)
      return true
    })
  }

  return (
    <NodeViewWrapper
      className="relative my-6 h-4 flex items-center select-none group"
      draggable
      onDragStart={(e: React.DragEvent<HTMLDivElement>) => {
        setDragging(true)
        const pos = typeof props.getPos === 'function' ? props.getPos() : -1
        setDragPayload({ type: 'page-break', pos })
        e.dataTransfer?.setData('text/plain', `page-break:${id}`)
        e.dataTransfer?.setDragImage?.(document.createElement('div'), 0, 0)
      }}
      onDragEnd={() => {
        setDragging(false)
        setDragPayload(null)
      }}
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

      {/* Floating delete hint while dragging */}
      <div
        className={`absolute -right-10 top-1/2 -translate-y-1/2 transition-opacity ${isDragging ? 'opacity-100' : 'opacity-0'}`}
        aria-hidden={!isDragging}
      >
        <div className="bg-white border border-gray-200 shadow rounded-full p-1">
          <Trash2 className="text-red-500" size={16} />
        </div>
      </div>
    </NodeViewWrapper>
  )
}
