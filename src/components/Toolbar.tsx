import React, { useEffect, useMemo, useState } from "react"
import { Editor } from "@tiptap/react"
import { Bold, Italic, Underline, Strikethrough, Code, LinkIcon, ImageIcon, List, ListOrdered, ListTodo, AlignLeft, AlignCenter, AlignRight, AlignJustify, Undo, Redo, Highlighter, Table } from 'lucide-react'
import { ColorPopover } from "./color-popover"

interface ToolbarProps {
  editor: Editor | null
}

const FONT_SIZES = [
  { label: "12", value: "12px" },
  { label: "14", value: "14px" },
  { label: "16", value: "16px" },
  { label: "18", value: "18px" },
  { label: "20", value: "20px" },
  { label: "24", value: "24px" },
  { label: "30", value: "30px" },
  { label: "36", value: "36px" },
]

export const Toolbar: React.FC<ToolbarProps> = ({ editor }) => {
  const [highlightOpen, setHighlightOpen] = useState(false)
  const [anchor, setAnchor] = useState<{ top: number; left: number } | undefined>()
  const [, force] = useState(0)

  // Re-render on selection/transaction so dropdowns reflect current selection
  useEffect(() => {
    if (!editor) return
    const update = () => force((x) => x + 1)
    editor.on("selectionUpdate", update)
    editor.on("transaction", update)
    editor.on("update", update)
    return () => {
      editor.off("selectionUpdate", update)
      editor.off("transaction", update)
      editor.off("update", update)
    }
  }, [editor])

  const btnBase =
    "inline-flex items-center justify-center rounded-lg border border-transparent px-3 py-1.5 text-base font-medium bg-[#f9f9f9] cursor-pointer transition-colors duration-200 hover:bg-gray-100"

  const onOpenHighlight = (e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    setAnchor({
      top: rect.bottom + window.scrollY,
      left: rect.left + rect.width / 2 + window.scrollX,
    })
    setHighlightOpen(true)
  }

  if (!editor) return null

  const headingValue = useMemo(() => {
    if (editor.isActive("heading", { level: 1 })) return "h1"
    if (editor.isActive("heading", { level: 2 })) return "h2"
    if (editor.isActive("heading", { level: 3 })) return "h3"
    if (editor.isActive("heading", { level: 4 })) return "h4"
    if (editor.isActive("heading", { level: 5 })) return "h5"
    if (editor.isActive("heading", { level: 6 })) return "h6"
    return "p"
  }, [editor?.state])

  const currentFontSize = (editor.getAttributes("textStyle")?.fontSize as string) || ""

  const applyHeading = (value: string) => {
    if (value === "p") {
      editor.chain().focus().setParagraph().run()
    } else {
      const level = parseInt(value.replace("h", "")) as 1 | 2 | 3 | 4 | 5 | 6
      editor.chain().focus().setHeading({ level }).run()
    }
  }

  const applyFontSize = (v: string) => {
    if (!v) {
      // Clear only the font-size mark
      editor.chain().focus().unsetMark("textStyle").run()
    } else {
      editor.chain().focus().setMark("textStyle", { fontSize: v }).run()
    }
  }

  const applyHighlight = (color: string | null) => {
    if (!editor) return
    if (color) editor.chain().focus().setHighlight({ color }).run()
    else editor.chain().focus().unsetHighlight().run()
    setHighlightOpen(false)
  }

  const ToolbarSeparator = () => (
    <div className="w-px h-6 bg-gray-200 mx-1 hidden md:block" />
  )

  return (
  
    <div className="relative w-full">
      <div
        className="flex flex-wrap items-center justify-center gap-2 p-1 bg-white rounded-lg"
        role="toolbar"
        aria-label="Editor toolbar"
      >
        {/* History */}
        <button className={btnBase} onClick={() => editor.chain().focus().undo().run()} title="Undo (Ctrl+Z)" aria-label="Undo" type="button">
          <Undo size={18} />
        </button>
        <button className={btnBase} onClick={() => editor.chain().focus().redo().run()} title="Redo (Ctrl+Y)" aria-label="Redo" type="button">
          <Redo size={18} />
        </button>

        <ToolbarSeparator />

        {/* Headings */}
        <select
          value={headingValue}
          onChange={(e) => applyHeading(e.target.value)}
          className="h-9 px-2.5 border border-gray-300 rounded-md bg-white text-sm text-gray-900"
          aria-label="Text style"
        >
          <option value="p">P</option>
          <option value="h1">H1</option>
          <option value="h2">H2</option>
          <option value="h3">H3</option>
          <option value="h4">H4</option>
          <option value="h5">H5</option>
          <option value="h6">H6</option>
        </select>

        {/* Font size */}
        <select
          value={currentFontSize}
          onChange={(e) => applyFontSize(e.target.value)}
          className="h-9 px-2.5 border border-gray-300 rounded-md bg-white text-sm text-gray-900"
          aria-label="Font size"
          title="Font size"
        >
          <option value="">Size</option>
          {FONT_SIZES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        <ToolbarSeparator />

        {/* Lists */}
        <button className={btnBase} onClick={() => editor.chain().focus().toggleBulletList().run()} aria-label="Bullet list" title="Bullet List" type="button">
          <List size={18} />
        </button>
        <button className={btnBase} onClick={() => editor.chain().focus().toggleOrderedList().run()} aria-label="Numbered list" title="Numbered List" type="button">
          <ListOrdered size={18} />
        </button>
        <button className={btnBase} onClick={() => editor.chain().focus().toggleTaskList().run()} aria-label="Task list" title="Task List" type="button">
          <ListTodo size={18} />
        </button>

        <ToolbarSeparator />

        {/* Inline formatting */}
        <button className={btnBase} onClick={() => editor.chain().focus().toggleBold().run()} aria-label="Bold" title="Bold (Ctrl+B)" type="button">
          <Bold size={18} />
        </button>
        <button className={btnBase} onClick={() => editor.chain().focus().toggleItalic().run()} aria-label="Italic" title="Italic (Ctrl+I)" type="button">
          <Italic size={18} />
        </button>
        <button className={btnBase} onClick={() => editor.chain().focus().toggleUnderline().run()} aria-label="Underline" title="Underline (Ctrl+U)" type="button">
          <Underline size={18} />
        </button>
        <button className={btnBase} onClick={() => editor.chain().focus().toggleStrike().run()} aria-label="Strikethrough" title="Strikethrough" type="button">
          <Strikethrough size={18} />
        </button>
        <button className={btnBase} onClick={() => editor.chain().focus().toggleCode().run()} aria-label="Inline code" title="Inline Code" type="button">
          <Code size={18} />
        </button>

        <ToolbarSeparator />

        {/* Highlight palette */}
        <button className={btnBase} onClick={onOpenHighlight} aria-label="Highlight" title="Highlight" type="button">
          <Highlighter size={18} />
        </button>

        <ToolbarSeparator />

        {/* Alignment */}
        <button className={btnBase} onClick={() => editor.chain().focus().setTextAlign("left").run()} aria-label="Align left" title="Align Left" type="button">
          <AlignLeft size={18} />
        </button>
        <button className={btnBase} onClick={() => editor.chain().focus().setTextAlign("center").run()} aria-label="Align center" title="Align Center" type="button">
          <AlignCenter size={18} />
        </button>
        <button className={btnBase} onClick={() => editor.chain().focus().setTextAlign("right").run()} aria-label="Align right" title="Align Right" type="button">
          <AlignRight size={18} />
        </button>
        <button className={btnBase} onClick={() => editor.chain().focus().setTextAlign("justify").run()} aria-label="Justify" title="Justify" type="button">
          <AlignJustify size={18} />
        </button>

        <ToolbarSeparator />

        {/* Insert */}
        <button
          className={btnBase}
          onClick={() => {
            const url = window.prompt("Enter URL:")
            if (url) editor.chain().focus().setLink({ href: url }).run()
          }}
          aria-label="Add link"
          title="Add Link"
          type="button"
        >
          <LinkIcon size={18} />
        </button>

        <button
          className={btnBase}
          onClick={() => {
            const url = window.prompt("Enter image URL:")
            if (url) editor.chain().focus().setImage({ src: url }).run()
          }}
          aria-label="Add image"
          title="Add Image"
          type="button"
        >
          <ImageIcon size={18} />
        </button>

        <button
          className={btnBase}
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
          aria-label="Add table"
          title="Add Table"
          type="button"
        >
          <Table size={18} />
        </button>
      </div>

      <ColorPopover
        open={highlightOpen}
        onClose={() => setHighlightOpen(false)}
        onSelect={applyHighlight}
        anchor={anchor}
        title="Highlight"
      />
    </div>
  )
}
