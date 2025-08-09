import React, { useState, useCallback, useEffect } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { TextAlign } from "@tiptap/extension-text-align"
import Underline from "@tiptap/extension-underline"
import Link from "@tiptap/extension-link"
import Image from "@tiptap/extension-image"
import { TextStyle } from "@tiptap/extension-text-style"
import FontFamily from "@tiptap/extension-font-family"
import { Color } from "@tiptap/extension-color"
import CharacterCount from "@tiptap/extension-character-count"
import { PageBreak } from "../extension/PageBreak"
import { ProfessionalToolbar } from "./ProfessionalToolbar"
import { ThumbnailSidebar } from "./ThumbnailSidebar"

export const ProfessionalEditor: React.FC = () => {
  const [sidebarVisible, setSidebarVisible] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 underline hover:text-blue-800 cursor-pointer",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-lg shadow-md my-4",
        },
      }),
      TextStyle,
      Color,
      FontFamily.configure({
        types: ["textStyle"],
      }),
      CharacterCount,
      PageBreak,
    ],
    content: `
      <h1>Professional Document Editor</h1>
      <p>Welcome to your new professional document editor. This editor provides a clean, Microsoft Word-like interface with:</p>
      <ul>
        <li>Professional typography with Inter font family</li>
        <li>Centered page layout with proper margins</li>
        <li>Comprehensive formatting toolbar</li>
        <li>Page thumbnail sidebar for navigation</li>
        <li>Responsive design that adapts to different screen sizes</li>
      </ul>
      <p>Start typing to experience the smooth, continuous editing flow. The interface is designed to minimize distractions while providing all the tools you need for professional document creation.</p>
      <h2>Key Features</h2>
      <p>The editor includes advanced formatting options, font selection, alignment controls, and seamless integration with modern web technologies. Everything is built with React, TypeScript, and Tailwind CSS for optimal performance and maintainability.</p>
    `,
    editorProps: {
      attributes: {
        class: "prose prose-lg max-w-none focus:outline-none min-h-[600px] leading-relaxed",
        style: "font-family: Inter, system-ui, sans-serif; line-height: 1.7;",
      },
    },
    onCreate: ({ editor }) => {
      // Set default font
      editor.chain().focus().setFontFamily("Inter, system-ui, sans-serif").run()
    },
  })

  const toggleSidebar = useCallback(() => {
    setSidebarVisible(prev => !prev)
  }, [])

  if (!editor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg text-gray-600">Loading editor...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <ProfessionalToolbar editor={editor} />
      
      <div className="flex-1 relative">
        <ThumbnailSidebar 
          editor={editor}
          isVisible={sidebarVisible}
          onToggle={toggleSidebar}
        />
        
        <main className={`transition-all duration-300 ${sidebarVisible ? 'ml-64' : 'ml-0'}`}>
          <div className="max-w-4xl mx-auto py-8 px-4">
            <div 
              className="bg-white rounded-lg shadow-lg min-h-[11in] mx-auto relative"
              style={{ width: '8.5in', maxWidth: '100%' }}
            >
              <div className="p-16">
                <EditorContent 
                  editor={editor}
                  className="prose prose-lg max-w-none focus:outline-none"
                />
              </div>
            </div>
          </div>
        </main>
      </div>

      <style>{`
        /* Professional typography styles */
        .ProseMirror {
          outline: none;
          font-family: Inter, system-ui, sans-serif;
          line-height: 1.7;
          color: #1f2937;
        }

        .ProseMirror h1 {
          font-size: 2.25rem;
          font-weight: 700;
          line-height: 1.2;
          margin: 2rem 0 1rem 0;
          color: #111827;
        }

        .ProseMirror h2 {
          font-size: 1.875rem;
          font-weight: 600;
          line-height: 1.3;
          margin: 1.75rem 0 0.75rem 0;
          color: #111827;
        }

        .ProseMirror h3 {
          font-size: 1.5rem;
          font-weight: 600;
          line-height: 1.4;
          margin: 1.5rem 0 0.5rem 0;
          color: #111827;
        }

        .ProseMirror p {
          margin: 1rem 0;
          line-height: 1.7;
        }

        .ProseMirror ul, .ProseMirror ol {
          margin: 1rem 0;
          padding-left: 1.5rem;
        }

        .ProseMirror li {
          margin: 0.5rem 0;
          line-height: 1.6;
        }

        .ProseMirror blockquote {
          border-left: 4px solid #e5e7eb;
          margin: 1.5rem 0;
          padding-left: 1rem;
          font-style: italic;
          color: #6b7280;
        }

        .ProseMirror code {
          background-color: #f3f4f6;
          padding: 0.125rem 0.25rem;
          border-radius: 0.25rem;
          font-size: 0.875em;
          font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
        }

        .ProseMirror pre {
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          padding: 1rem;
          margin: 1.5rem 0;
          overflow-x: auto;
        }

        .ProseMirror pre code {
          background: none;
          padding: 0;
          font-size: 0.875rem;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .ProseMirror {
            font-size: 16px;
          }
          
          .ProseMirror h1 {
            font-size: 1.875rem;
          }
          
          .ProseMirror h2 {
            font-size: 1.5rem;
          }
        }

        /* Print styles */
        @media print {
          .ProseMirror {
            font-size: 12pt;
            line-height: 1.5;
          }
        }
      `}</style>
    </div>
  )
}