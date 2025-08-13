 

import type React from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"
import type { Editor } from "@tiptap/react"
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  LinkIcon,
  ImageIcon,
  List,
  ListOrdered,
  ListTodo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Undo,
  Redo,
  Table,
  Type,
  Heading1,
} from "lucide-react"
import { Superscript as SupIcon, Subscript as SubIcon } from "lucide-react"

import { HighlightColorPicker } from "./HighlightColorPicker"
import {
  TOOLBAR_ICON_SIZE,
  TOOLBAR_BUTTON_CLASS,
  TOOLBAR_SELECT_CLASS,
  TOOLBAR_SEPARATOR_CLASS,
  TOOLBAR_ROW_CLASS,
  LIST_DROPDOWN_MENU_CLASS,
  LIST_DROPDOWN_ITEM_CLASS,
} from "./toolbar.config"

interface ToolbarProps {
  editor: Editor | null
}

const FONT_SIZES = [
  { label: "8pt", value: "8pt" },
  { label: "9pt", value: "9pt" },
  { label: "10pt", value: "10pt" },
  { label: "11pt", value: "11pt" },
  { label: "12pt", value: "12pt" },
  { label: "14pt", value: "14pt" },
  { label: "16pt", value: "16pt" },
  { label: "18pt", value: "18pt" },
  { label: "20pt", value: "20pt" },
  { label: "24pt", value: "24pt" },
  { label: "28pt", value: "28pt" },
  { label: "32pt", value: "32pt" },
  { label: "36pt", value: "36pt" },
]

const HEADING_OPTIONS = [
  { label: "Normal", value: "p", icon: Type },
  { label: "Title", value: "h1", icon: Heading1 },
  { label: "Heading 1", value: "h2", icon: Heading1 },
  { label: "Heading 2", value: "h3", icon: Heading1 },
  { label: "Heading 3", value: "h4", icon: Heading1 },
  { label: "Heading 4", value: "h5", icon: Heading1 },
  { label: "Heading 5", value: "h6", icon: Heading1 },
]

export const Toolbar: React.FC<ToolbarProps> = ({ editor }) => {
  const [listOpen, setListOpen] = useState(false)
  const [listAnchor, setListAnchor] = useState<{ top: number; left: number } | undefined>()
  const listMenuRef = useRef<HTMLDivElement | null>(null)
  const [, force] = useState(0)

  // Force re-render when editor state changes
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

  // Get current heading value - FIXED to update dynamically
  const headingValue = useMemo(() => {
    if (!editor) return "p"
    if (editor.isActive("heading", { level: 1 })) return "h1"
    if (editor.isActive("heading", { level: 2 })) return "h2"
    if (editor.isActive("heading", { level: 3 })) return "h3"
    if (editor.isActive("heading", { level: 4 })) return "h4"
    if (editor.isActive("heading", { level: 5 })) return "h5"
    if (editor.isActive("heading", { level: 6 })) return "h6"
    return "p"
  }, [editor, editor?.state?.selection, editor?.state?.doc])

  // Get current font size - FIXED to update dynamically
  const currentFontSize = useMemo(() => {
    if (!editor) return "12pt"
    const fontSize = (editor.getAttributes("textStyle")?.fontSize as string) || ""
    return fontSize || "12pt" // Default to 12pt
  }, [editor, editor?.state?.selection, editor?.state?.doc])

  // Get current heading/style label for display - FIXED to update dynamically
  const currentStyleLabel = useMemo(() => {
    const option = HEADING_OPTIONS.find((opt) => opt.value === headingValue)
    return option?.label || "Normal"
  }, [headingValue])

  const btnBase = TOOLBAR_BUTTON_CLASS

  const onOpenListMenu = (e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    setListAnchor({
      top: rect.bottom + window.scrollY,
      left: rect.left + rect.width / 2 + window.scrollX,
    })
    setListOpen(true)
  }

  useEffect(() => {
    if (!listOpen) return
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node
      if (listMenuRef.current && listMenuRef.current.contains(target)) return
      setListOpen(false)
    }
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setListOpen(false)
    }
    document.addEventListener("mousedown", onDown)
    document.addEventListener("keydown", onEsc)
    return () => {
      document.removeEventListener("mousedown", onDown)
      document.removeEventListener("keydown", onEsc)
    }
  }, [listOpen])

  const toggleSuperscript = () => {
    if (!editor) return
    editor.chain().focus().unsetMark("subscript").toggleMark("superscript").run()
  }

  const toggleSubscript = () => {
    if (!editor) return
    editor.chain().focus().unsetMark("superscript").toggleMark("subscript").run()
  }

  const ToolbarSeparator = () => <div className={TOOLBAR_SEPARATOR_CLASS} />

  const applyHeading = (value: string) => {
    if (value === "p") {
      editor?.chain().focus().setParagraph().run()
    } else {
      const level = Number.parseInt(value.replace("h", "")) as 1 | 2 | 3 | 4 | 5 | 6
      editor?.chain().focus().setHeading({ level }).run()
    }
  }

  const applyFontSize = (v: string) => {
    if (!v || v === "12pt") {
      editor?.chain().focus().unsetFontSize().run()
    } else {
      editor?.chain().focus().setFontSize(v).run()
    }
  }

  if (!editor) return null

  return (
    <>
      <div className="relative w-full">
        <div className={TOOLBAR_ROW_CLASS} role="toolbar" aria-label="Editor toolbar">
          {/* History */}
          <button
            className={btnBase}
            onClick={() => editor.chain().focus().undo().run()}
            title="Undo (Ctrl+Z)"
            aria-label="Undo"
            type="button"
          >
            <Undo size={TOOLBAR_ICON_SIZE} />
          </button>
          <button
            className={btnBase}
            onClick={() => editor.chain().focus().redo().run()}
            title="Redo (Ctrl+Y)"
            aria-label="Redo"
            type="button"
          >
            <Redo size={TOOLBAR_ICON_SIZE} />
          </button>

          <ToolbarSeparator />

          {/* Enhanced Style Selector with DYNAMIC Current Display */}
          <div className="flex items-center gap-1">
            <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 rounded-md border border-blue-200">
              <Type size={14} className="text-blue-600" />
              <span className="text-xs text-blue-700 font-semibold min-w-[70px] text-center">{currentStyleLabel}</span>
            </div>
            <select
              value={headingValue}
              onChange={(e) => applyHeading(e.target.value)}
              className={`${TOOLBAR_SELECT_CLASS} min-w-[100px]`}
              aria-label="Text style"
            >
              {HEADING_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Enhanced Font Size Selector with DYNAMIC Current Display */}
          <div className="flex items-center gap-1">
            <div className="flex items-center gap-1 px-2 py-1 bg-green-50 rounded-md border border-green-200">
              <span className="text-xs text-green-700 font-bold min-w-[35px] text-center font-mono">
                {currentFontSize}
              </span>
            </div>
            <select
              value={currentFontSize}
              onChange={(e) => applyFontSize(e.target.value)}
              className={`${TOOLBAR_SELECT_CLASS} min-w-[70px]`}
              aria-label="Font size"
              title="Font size"
            >
              {FONT_SIZES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <ToolbarSeparator />

          {/* Lists dropdown */}
          <button className={btnBase} onClick={onOpenListMenu} aria-label="Lists" title="Lists" type="button">
            <List size={TOOLBAR_ICON_SIZE} />
          </button>

          <ToolbarSeparator />

          {/* Inline formatting with proper active states */}
          <button
            className={`${btnBase} ${editor.isActive("bold") ? "bg-blue-100 text-blue-700 border-blue-300" : ""}`}
            onClick={() => editor.chain().focus().toggleBold().run()}
            aria-label="Bold"
            title="Bold (Ctrl+B)"
            type="button"
          >
            <Bold size={TOOLBAR_ICON_SIZE} />
          </button>
          <button
            className={`${btnBase} ${editor.isActive("italic") ? "bg-blue-100 text-blue-700 border-blue-300" : ""}`}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            aria-label="Italic"
            title="Italic (Ctrl+I)"
            type="button"
          >
            <Italic size={TOOLBAR_ICON_SIZE} />
          </button>
          <button
            className={`${btnBase} ${editor.isActive("underline") ? "bg-blue-100 text-blue-700 border-blue-300" : ""}`}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            aria-label="Underline"
            title="Underline (Ctrl+U)"
            type="button"
          >
            <Underline size={TOOLBAR_ICON_SIZE} />
          </button>
          <button
            className={`${btnBase} ${editor.isActive("strike") ? "bg-blue-100 text-blue-700 border-blue-300" : ""}`}
            onClick={() => editor.chain().focus().toggleStrike().run()}
            aria-label="Strikethrough"
            title="Strikethrough"
            type="button"
          >
            <Strikethrough size={TOOLBAR_ICON_SIZE} />
          </button>
          <button
            className={`${btnBase} ${editor.isActive("code") ? "bg-blue-100 text-blue-700 border-blue-300" : ""}`}
            onClick={() => editor.chain().focus().toggleCode().run()}
            aria-label="Inline code"
            title="Inline Code"
            type="button"
          >
            <Code size={TOOLBAR_ICON_SIZE} />
          </button>

          {/* Super/Sub script */}
          <button
            className={`${btnBase} ${editor.isActive("superscript") ? "bg-blue-100 text-blue-700 border-blue-300" : ""}`}
            onClick={toggleSuperscript}
            aria-label="Superscript"
            title="Superscript"
            type="button"
          >
            <SupIcon size={TOOLBAR_ICON_SIZE} />
          </button>
          <button
            className={`${btnBase} ${editor.isActive("subscript") ? "bg-blue-100 text-blue-700 border-blue-300" : ""}`}
            onClick={toggleSubscript}
            aria-label="Subscript"
            title="Subscript"
            type="button"
          >
            <SubIcon size={TOOLBAR_ICON_SIZE} />
          </button>

          <ToolbarSeparator />

          {/* Custom Highlight Color Picker */}
          <HighlightColorPicker editor={editor} />

          <ToolbarSeparator />

          {/* Alignment with proper active states */}
          <button
            className={`${btnBase} ${editor.isActive({ textAlign: "left" }) ? "bg-blue-100 text-blue-700 border-blue-300" : ""}`}
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            aria-label="Align left"
            title="Align Left"
            type="button"
          >
            <AlignLeft size={TOOLBAR_ICON_SIZE} />
          </button>
          <button
            className={`${btnBase} ${editor.isActive({ textAlign: "center" }) ? "bg-blue-100 text-blue-700 border-blue-300" : ""}`}
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            aria-label="Align center"
            title="Align Center"
            type="button"
          >
            <AlignCenter size={TOOLBAR_ICON_SIZE} />
          </button>
          <button
            className={`${btnBase} ${editor.isActive({ textAlign: "right" }) ? "bg-blue-100 text-blue-700 border-blue-300" : ""}`}
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            aria-label="Align right"
            title="Align Right"
            type="button"
          >
            <AlignRight size={TOOLBAR_ICON_SIZE} />
          </button>
          <button
            className={`${btnBase} ${editor.isActive({ textAlign: "justify" }) ? "bg-blue-100 text-blue-700 border-blue-300" : ""}`}
            onClick={() => editor.chain().focus().setTextAlign("justify").run()}
            aria-label="Justify"
            title="Justify"
            type="button"
          >
            <AlignJustify size={TOOLBAR_ICON_SIZE} />
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
            <LinkIcon size={TOOLBAR_ICON_SIZE} />
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
            <ImageIcon size={TOOLBAR_ICON_SIZE} />
          </button>

          <button
            className={btnBase}
            onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
            aria-label="Add table"
            title="Add Table"
            type="button"
          >
            <Table size={TOOLBAR_ICON_SIZE} />
          </button>
        </div>
      </div>

      {/* Lists dropdown menu */}
      {listOpen &&
        listAnchor &&
        createPortal(
          <div
            ref={listMenuRef}
            style={{
              position: "fixed",
              top: listAnchor.top,
              left: listAnchor.left,
              transform: "translateX(-50%)",
              zIndex: 60,
            }}
            className={LIST_DROPDOWN_MENU_CLASS}
          >
            <button
              className={LIST_DROPDOWN_ITEM_CLASS}
              onClick={() => {
                editor?.chain().focus().toggleBulletList().run()
                setListOpen(false)
              }}
              type="button"
            >
              <List size={TOOLBAR_ICON_SIZE} />
              <span>Bullet List</span>
            </button>
            <button
              className={LIST_DROPDOWN_ITEM_CLASS}
              onClick={() => {
                editor?.chain().focus().toggleOrderedList().run()
                setListOpen(false)
              }}
              type="button"
            >
              <ListOrdered size={TOOLBAR_ICON_SIZE} />
              <span>Ordered List</span>
            </button>
            <button
              className={LIST_DROPDOWN_ITEM_CLASS}
              onClick={() => {
                editor?.chain().focus().toggleTaskList().run()
                setListOpen(false)
              }}
              type="button"
            >
              <ListTodo size={TOOLBAR_ICON_SIZE} />
              <span>Task List</span>
            </button>
          </div>,
          document.body,
        )}
    </>
  )
}
