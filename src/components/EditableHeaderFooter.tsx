
import type React from "react"
import { useEffect } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { TextAlign } from "@tiptap/extension-text-align"
import { TextStyle } from "@tiptap/extension-text-style"

type Align = "start" | "center" | "end"

interface EditableHeaderFooterProps {
  content: string
  onChange: (content: string) => void
  align: Align
  placeholder: string
  className?: string
}

export const EditableHeaderFooter: React.FC<EditableHeaderFooterProps> = ({
  content,
  onChange,
  align,
  placeholder,
  className = "",
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
        listItem: false,
        bulletList: false,
        orderedList: false,
      }),
      TextAlign.configure({
        types: ["paragraph"],
      }),
      TextStyle,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: `focus:outline-none text-sm ${className}`,
      },
    },
  })

  useEffect(() => {
    if (editor && editor.getHTML() !== content) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  useEffect(() => {
    if (editor) {
      editor.chain().focus().setTextAlign(align).run()
    }
  }, [align, editor])

  if (!editor) return null

  return (
    <div className={`min-h-[40px] ${className}`}>
      <EditorContent editor={editor} className="h-full" placeholder={placeholder} />
    </div>
  )
}
