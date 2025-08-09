import React from "react"
import { EditorContent, Editor } from "@tiptap/react"

interface PageContainerProps {
  editor: Editor | null
}

export const PageContainer: React.FC<PageContainerProps> = ({ editor }) => {
  if (!editor) return null

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-lg min-h-[11in] p-16 mx-auto" style={{ width: '8.5in' }}>
          <EditorContent 
            editor={editor}
            className="prose prose-lg max-w-none focus:outline-none"
          />
        </div>
      </div>
    </div>
  )
}