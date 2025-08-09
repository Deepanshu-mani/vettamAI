import React, { useEffect, useState } from "react"
import { Editor } from "@tiptap/react"
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  List, 
  ListOrdered,
  Link as LinkIcon,
  Image as ImageIcon,
  Undo,
  Redo
} from 'lucide-react'

interface ProfessionalToolbarProps {
  editor: Editor | null
}

const FONTS = [
  { label: "Inter", value: "Inter, system-ui, sans-serif" },
  { label: "Times New Roman", value: "Times New Roman, serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Arial", value: "Arial, sans-serif" },
  { label: "Helvetica", value: "Helvetica, sans-serif" },
  { label: "Courier New", value: "Courier New, monospace" },
]

const FONT_SIZES = [
  "8", "9", "10", "11", "12", "14", "16", "18", "20", "24", "28", "32", "36", "48", "72"
]

export const ProfessionalToolbar: React.FC<ProfessionalToolbarProps> = ({ editor }) => {
  const [, forceUpdate] = useState(0)

  useEffect(() => {
    if (!editor) return
    const update = () => forceUpdate(x => x + 1)
    editor.on("selectionUpdate", update)
    editor.on("transaction", update)
    return () => {
      editor.off("selectionUpdate", update)
      editor.off("transaction", update)
    }
  }, [editor])

  if (!editor) return null

  const currentFontFamily = editor.getAttributes("textStyle")?.fontFamily || "Inter, system-ui, sans-serif"
  const currentFontSize = editor.getAttributes("textStyle")?.fontSize || "16px"

  const ToolbarButton: React.FC<{
    onClick: () => void
    isActive?: boolean
    children: React.ReactNode
    title: string
  }> = ({ onClick, isActive = false, children, title }) => (
    <button
      onClick={onClick}
      title={title}
      className={`
        p-1.5 rounded-md transition-all duration-150 hover:bg-gray-100 
        ${isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:text-gray-900'}
      `}
    >
      {children}
    </button>
  )

  const Divider = () => <div className="w-px h-6 bg-gray-200 mx-1" />

  return (
    <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center space-x-1">
            {/* History */}
            <ToolbarButton
              onClick={() => editor.chain().focus().undo().run()}
              title="Undo"
            >
              <Undo size={16} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().redo().run()}
              title="Redo"
            >
              <Redo size={16} />
            </ToolbarButton>

            <Divider />

            {/* Font Family */}
            <select
              value={currentFontFamily}
              onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()}
              className="px-2 py-1 text-sm border border-gray-200 rounded-md bg-white hover:border-gray-300 focus:border-blue-500 focus:outline-none min-w-[140px]"
            >
              {FONTS.map(font => (
                <option key={font.value} value={font.value}>{font.label}</option>
              ))}
            </select>

            {/* Font Size */}
            <select
              value={currentFontSize.replace('px', '')}
              onChange={(e) => editor.chain().focus().setMark("textStyle", { fontSize: `${e.target.value}px` }).run()}
              className="px-2 py-1 text-sm border border-gray-200 rounded-md bg-white hover:border-gray-300 focus:border-blue-500 focus:outline-none w-16"
            >
              {FONT_SIZES.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>

            <Divider />

            {/* Text Formatting */}
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              isActive={editor.isActive('bold')}
              title="Bold"
            >
              <Bold size={16} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              isActive={editor.isActive('italic')}
              title="Italic"
            >
              <Italic size={16} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              isActive={editor.isActive('underline')}
              title="Underline"
            >
              <Underline size={16} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleStrike().run()}
              isActive={editor.isActive('strike')}
              title="Strikethrough"
            >
              <Strikethrough size={16} />
            </ToolbarButton>

            <Divider />

            {/* Alignment */}
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
              isActive={editor.isActive({ textAlign: 'left' })}
              title="Align Left"
            >
              <AlignLeft size={16} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
              isActive={editor.isActive({ textAlign: 'center' })}
              title="Align Center"
            >
              <AlignCenter size={16} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
              isActive={editor.isActive({ textAlign: 'right' })}
              title="Align Right"
            >
              <AlignRight size={16} />
            </ToolbarButton>

            <Divider />

            {/* Lists */}
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              isActive={editor.isActive('bulletList')}
              title="Bullet List"
            >
              <List size={16} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              isActive={editor.isActive('orderedList')}
              title="Numbered List"
            >
              <ListOrdered size={16} />
            </ToolbarButton>

            <Divider />

            {/* Insert */}
            <ToolbarButton
              onClick={() => {
                const url = window.prompt("Enter URL:")
                if (url) editor.chain().focus().setLink({ href: url }).run()
              }}
              title="Insert Link"
            >
              <LinkIcon size={16} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => {
                const url = window.prompt("Enter image URL:")
                if (url) editor.chain().focus().setImage({ src: url }).run()
              }}
              title="Insert Image"
            >
              <ImageIcon size={16} />
            </ToolbarButton>
          </div>

          {/* Document Stats */}
          <div className="hidden md:flex items-center space-x-4 text-sm text-gray-500">
            <span>Words: {editor.storage.characterCount?.words() || 0}</span>
            <span>Characters: {editor.storage.characterCount?.characters() || 0}</span>
          </div>
        </div>
      </div>
    </div>
  )
}