 

import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import type { ReactElement } from "react"
import { useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { TextAlign } from "@tiptap/extension-text-align"
import Underline from "@tiptap/extension-underline"
import Link from "@tiptap/extension-link"
import Image from "@tiptap/extension-image"
import { Table } from "@tiptap/extension-table"
import { TableRow } from "@tiptap/extension-table-row"
import { TableHeader } from "@tiptap/extension-table-header"
import { TableCell } from "@tiptap/extension-table-cell"
import { TextStyle } from "@tiptap/extension-text-style"
import Color from "@tiptap/extension-color"
import Highlight from "@tiptap/extension-highlight"
import FontFamily from "@tiptap/extension-font-family"
import CodeBlock from "@tiptap/extension-code-block"
import Blockquote from "@tiptap/extension-blockquote"
import HorizontalRule from "@tiptap/extension-horizontal-rule"
import TaskList from "@tiptap/extension-task-list"
import TaskItem from "@tiptap/extension-task-item"
import Superscript from "@tiptap/extension-superscript"
import Subscript from "@tiptap/extension-subscript"
import Placeholder from "@tiptap/extension-placeholder"
import { FontSize } from "../extension/FontSize"
import { PageBreak } from "../extension/PageBreak"
import { EditorHeader } from "./editor-header"
import { TrashBin } from "./trash-bin"
import { CollapsibleSidebar } from "./CollapsibleSidebar"
import { FooterBar } from "./FooterBar"
import { TrashContext } from "../context/TextContext"
import { PagePreviewPane } from "./page-preview-pane"
import { PaginatedEditor, type PaginatedEditorRef } from "./PaginatedEditor"

type Align = "start" | "center" | "end"

export const Editor = (): ReactElement => {
  const [wordCount, setWordCount] = useState(0)
  const [charCount, setCharCount] = useState(0)
  const [pageCount, setPageCount] = useState(1)
  const [currentPage, _setCurrentPage] = useState(1)

  // Header/Footer and preview controls
  const [headerEnabled, setHeaderEnabled] = useState(true)
  const [footerEnabled, setFooterEnabled] = useState(true)
  const [headerAlign, setHeaderAlign] = useState<Align>("center")
  const [footerAlign, setFooterAlign] = useState<Align>("center")
  const [showPageNumbers, _setShowPageNumbers] = useState(true)

  // New UI state
  const [activeTab, setActiveTab] = useState<"text" | "page">("text")
  const [sidebarVisible, setSidebarVisible] = useState(true)
  const [showRuler, setShowRuler] = useState(false)
  const [zoom, setZoom] = useState(0.8)

  const [headerHtml, setHeaderHtml] = useState("Document Header - Page {pageNumber} of {totalPages}")
  const [footerHtml, setFooterHtml] = useState("© 2024 Document Footer • Page {pageNumber}")

  const { setOnDropDelete, dragPayload, onDropDelete } = useContext(TrashContext)

  const editorContainerRef = useRef<HTMLDivElement | null>(null)
  const editorElementRef = useRef<HTMLElement | null>(null)
  const paginatedEditorRef = useRef<PaginatedEditorRef | null>(null)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        hardBreak: {
          keepMarks: false,
        },
        paragraph: {
          HTMLAttributes: {
            style: "margin: 12px 0; word-wrap: break-word; overflow-wrap: break-word; white-space: normal;",
          },
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 underline hover:text-blue-800",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-lg shadow-md",
        },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: "border-collapse border border-gray-300",
        },
      }),
      TableRow.configure({
        HTMLAttributes: {
          class: "border border-gray-300",
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: "border border-gray-300 bg-gray-100 font-bold p-2",
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: "border border-gray-300 p-2",
        },
      }),
      TaskList.configure({
        HTMLAttributes: { class: "task-list not-prose list-none pl-0 my-3 space-y-1" },
      }),
      TaskItem.configure({
        nested: true,
        HTMLAttributes: { class: "task-list-item flex items-center gap-2" },
      }),
      TextStyle,
      FontSize,
      Superscript,
      Subscript,
      Color,
      Highlight.configure({
        multicolor: true,
        HTMLAttributes: {
          class: "highlight-mark",
        },
      }),
      FontFamily.configure({ types: ["textStyle"] }),
      CodeBlock.configure({
        HTMLAttributes: {
          class: "bg-gray-100 p-4 rounded-lg font-mono text-sm",
        },
      }),
      Blockquote.configure({
        HTMLAttributes: {
          class: "border-l-4 border-gray-300 pl-4 italic",
        },
      }),
      HorizontalRule.configure({
        HTMLAttributes: {
          class: "my-4 border-gray-300",
        },
      }),
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === "heading") {
            return "What's the title?"
          }
          return "Start typing here..."
        },
        includeChildren: true,
      }),
      PageBreak,
    ],
    content: "",
    onUpdate: ({ editor }) => {
      const text = editor.getText()
      const words = text.trim() ? text.trim().split(/\s+/).length : 0
      setWordCount(words)
      setCharCount(text.length)

      // Trigger pagination update
      if (paginatedEditorRef.current) {
        setTimeout(() => {
          paginatedEditorRef.current?.updatePagination()
        }, 100)
      }
    },
    editorProps: {
      attributes: {
        class: "ProseMirror-content focus:outline-none max-w-none min-h-full prose prose-lg max-w-none",
        placeholder: "Start typing your document here...",
      },
      handleKeyDown: (_view, event) => {
        // Handle Ctrl/Cmd + Enter for page breaks
        if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
          event.preventDefault()
          editor?.chain().focus().setPageBreak().run()
          return true
        }
        return false
      },
      handleDrop: (_view, _event, _slice, moved) => {
        if (moved) {
          return false
        }
        return false
      },
    },
  })

  // Update editor element ref when editor changes
  useEffect(() => {
    if (editor?.view?.dom) {
      editorElementRef.current = editor.view.dom as HTMLElement
    }
  }, [editor])

  // Keep current HTML for preview
  const currentHtml = useMemo(() => editor?.getHTML() ?? "", [editor?.state])

  // Get current pages for preview
  const currentPages = useMemo(() => {
    return paginatedEditorRef.current?.getCleanPages() ?? []
  }, [editor?.state])

  // Handle page count updates from PaginatedEditor
  const handlePageCountChange = useCallback((count: number) => {
    setPageCount(count)
  }, [])

  // Enhanced drag-to-trash deletion behavior
  useEffect(() => {
    if (!editor) return

    setOnDropDelete(() => (payload: { type: string; pos: number }) => {
      if (!payload) return

      if (payload.type === "page-break" && payload.pos >= 0) {
        const { state, view } = editor
        const from = payload.pos
        const node = state.doc.nodeAt(from)

        if (node && node.type.name === "pageBreak") {
          const tr = state.tr.delete(from, from + node.nodeSize)
          view.dispatch(tr)

          // Force pagination update after deletion
          setTimeout(() => {
            paginatedEditorRef.current?.updatePagination()
          }, 100)
        }
      }
    })

    return () => setOnDropDelete(null)
  }, [editor, setOnDropDelete])

  // Enhanced trash drop handling
  useEffect(() => {
    const trashBin = document.getElementById("trash-bin")
    if (!trashBin) return

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault()
      e.dataTransfer!.dropEffect = "move"
    }

    const handleDrop = (e: DragEvent) => {
      e.preventDefault()
      if (onDropDelete && dragPayload) {
        onDropDelete(dragPayload)
      }
    }

    trashBin.addEventListener("dragover", handleDragOver)
    trashBin.addEventListener("drop", handleDrop)

    return () => {
      trashBin.removeEventListener("dragover", handleDragOver)
      trashBin.removeEventListener("drop", handleDrop)
    }
  }, [onDropDelete, dragPayload])

  // Prevent scroll jumping after page breaks
  useEffect(() => {
    if (!editor) return

    const handleTransaction = ({ transaction }: any) => {
      // Check if a page break was inserted
      if (transaction.docChanged) {
        const steps = transaction.steps
        for (const step of steps) {
          if (step.slice && step.slice.content.toString().includes("pageBreak")) {
            // Prevent automatic scrolling to bottom
            setTimeout(() => {
              const editorElement = editor.view.dom
              const currentScrollTop = editorElement.scrollTop
              editorElement.scrollTop = currentScrollTop
            }, 0)
            break
          }
        }
      }
    }

    editor.on("transaction", handleTransaction)
    return () => {
      editor.off("transaction", handleTransaction)
    }
  }, [editor])

  const handlePrint = () => {
    if (!editor) return

    // Get clean pages without empty content - FIXED
    const cleanPages = paginatedEditorRef.current?.getCleanPages() ?? []

    // Double filter to ensure no empty pages
    const nonEmptyPages = cleanPages.filter((content) => {
      if (!content || !content.trim()) return false

      const tempDiv = document.createElement("div")
      tempDiv.innerHTML = content
      const textContent = tempDiv.textContent?.trim() || ""

      // Must have actual text content (not just whitespace or HTML tags)
      return textContent.length > 0
    })

    if (nonEmptyPages.length === 0) {
      alert("No content to print")
      return
    }

    const alignToStyle = (a: Align) =>
      a === "start" ? "text-align: left;" : a === "end" ? "text-align: right;" : "text-align: center;"

    const printContent = nonEmptyPages
      .map((content, i) => {
        const pageNum = i + 1
        const totalPages = nonEmptyPages.length

        return `
        <div class="print-page">
          ${
            headerEnabled
              ? `
            <div class="print-header" style="${alignToStyle(headerAlign)}">
              ${headerHtml
                .replace(/\{pageNumber\}/g, pageNum.toString())
                .replace(/\{totalPages\}/g, totalPages.toString())}
            </div>
          `
              : ""
          }
          
          <div class="print-content">${content}</div>
          
          ${
            footerEnabled
              ? `
            <div class="print-footer" style="${alignToStyle(footerAlign)}">
              ${footerHtml
                .replace(/\{pageNumber\}/g, pageNum.toString())
                .replace(/\{totalPages\}/g, totalPages.toString())}
            </div>
          `
              : ""
          }
        </div>
        `
      })
      .join("")

    const printStyles = `
      <style>
        @page {
          size: A4;
          margin: 25.4mm;
        }
        
        * {
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Times New Roman', Times, serif !important;
          font-size: 12pt !important;
          line-height: 1.5 !important;
          color: #000 !important;
          margin: 0 !important;
          padding: 0 !important;
          background: white !important;
        }
        
        .print-page {
          page-break-after: always !important;
          page-break-inside: avoid !important;
          break-after: page !important;
          break-inside: avoid !important;
          min-height: 100vh !important;
          display: flex !important;
          flex-direction: column !important;
          position: relative !important;
        }
        
        .print-page:last-child {
          page-break-after: auto !important;
          break-after: auto !important;
        }
        
        .print-header {
          padding-bottom: 6mm !important;
          border-bottom: 1px solid #e5e7eb !important;
          margin-bottom: 6mm !important;
          flex-shrink: 0 !important;
        }
        
        .print-content {
          flex: 1 !important;
          text-align: justify !important;
        }
        
        .print-footer {
          padding-top: 6mm !important;
          border-top: 1px solid #e5e7eb !important;
          margin-top: 6mm !important;
          flex-shrink: 0 !important;
        }
        
        h1 { 
          font-size: 24pt !important; 
          margin: 1.5em 0 1em !important; 
          page-break-after: avoid !important; 
          text-align: center !important; 
          border-bottom: 2px solid #333 !important; 
          padding-bottom: 0.5em !important; 
        }
        h2 { 
          font-size: 18pt !important; 
          margin: 1.3em 0 0.8em !important; 
          page-break-after: avoid !important; 
          border-bottom: 1px solid #666 !important; 
          padding-bottom: 0.3em !important; 
        }
        h3 { font-size: 16pt !important; margin: 1.2em 0 0.6em !important; page-break-after: avoid !important; }
        h4 { font-size: 14pt !important; margin: 1.1em 0 0.5em !important; }
        h5 { font-size: 13pt !important; margin: 1em 0 0.4em !important; }
        h6 { font-size: 12pt !important; margin: 0.9em 0 0.3em !important; font-style: italic !important; }
        
        p { 
          margin: 1em 0 !important; 
          text-align: justify !important; 
          orphans: 2 !important; 
          widows: 2 !important; 
        }
        
        ul, ol { margin: 1em 0 !important; padding-left: 1.5em !important; }
        li { margin: 0.25em 0 !important; }
        
        blockquote {
          border-left: 4px solid #3b82f6 !important;
          padding: 1em 1.5em !important;
          margin: 1.5em 0 !important;
          font-style: italic !important;
          background: #f8fafc !important;
          border-radius: 0 0.375rem 0.375rem 0 !important;
          page-break-inside: avoid !important;
        }
        
        table {
          border-collapse: collapse !important;
          width: 100% !important;
          margin: 1em 0 !important;
          page-break-inside: avoid !important;
          font-size: 11pt !important;
        }
        
        th, td {
          border: 1px solid #d1d5db !important;
          padding: 0.75em !important;
          text-align: left !important;
        }
        
        th {
          background: #f9fafb !important;
          font-weight: 600 !important;
        }
        
        tbody tr:nth-child(even) {
          background: #f9fafb !important;
        }
        
        pre {
          background: #f8f9fa !important;
          padding: 1em !important;
          border-radius: 0.25em !important;
          overflow-x: auto !important;
          page-break-inside: avoid !important;
        }
        
        code {
          background: #f1f5f9 !important;
          padding: 0.2em 0.4em !important;
          border-radius: 0.25em !important;
          font-size: 0.9em !important;
        }
        
        img {
          max-width: 100% !important;
          height: auto !important;
        }
        
        .highlight-mark {
          background-color: #fef3c7 !important;
          padding: 1px 2px !important;
          border-radius: 2px !important;
        }
        
        [data-type="page-break"],
        .page-break {
          display: none !important;
        }
        
        /* Hide empty elements */
        p:empty, div:empty {
          display: none !important;
        }
      </style>
    `

    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Document Print</title>
            <meta charset="utf-8">
            ${printStyles}
          </head>
          <body>
            ${printContent}
          </body>
        </html>
      `)
      printWindow.document.close()

      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print()
          printWindow.close()
        }, 500)
      }
    }
  }

  const handleExport = () => {
    if (!editor) return

    const cleanPages = paginatedEditorRef.current?.getCleanPages() ?? []

    const nonEmptyPages = cleanPages.filter((content) => {
      if (!content || !content.trim()) return false

      const tempDiv = document.createElement("div")
      tempDiv.innerHTML = content
      const textContent = tempDiv.textContent?.trim() || ""
      return textContent.length > 0
    })

    if (nonEmptyPages.length === 0) {
      alert("No content to export")
      return
    }

    const alignToStyle = (a: Align) =>
      a === "start" ? "text-align: left;" : a === "end" ? "text-align: right;" : "text-align: center;"

    const pageHtml = nonEmptyPages
      .map(
        (content, i) => `
        <div class="page">
          ${headerEnabled ? `<div class="page-header" style="${alignToStyle(headerAlign)}">${headerHtml.replace(/\{pageNumber\}/g, (i + 1).toString()).replace(/\{totalPages\}/g, nonEmptyPages.length.toString())}</div>` : ""}
          <div class="page-body">${content}</div>
          ${footerEnabled ? `<div class="page-footer" style="${alignToStyle(footerAlign)}">${footerHtml.replace(/\{pageNumber\}/g, (i + 1).toString()).replace(/\{totalPages\}/g, nonEmptyPages.length.toString())}</div>` : ""}
        </div>
      `,
      )
      .join("")

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Document Export</title>
          <meta charset="utf-8">
          <style>
            @page { size: A4; margin: 25.4mm; }
            
            body {
              font-family: 'Times New Roman', Times, serif;
              font-size: 12pt;
              line-height: 1.5;
              margin: 0;
              padding: 20px;
              color: #000;
              background: #f3f4f6;
            }
            
            .page {
              width: 210mm;
              min-height: 297mm;
              margin: 0 auto 20mm;
              background: white;
              box-shadow: 0 0 10px rgba(0,0,0,0.1);
              position: relative;
              display: flex;
              flex-direction: column;
              page-break-after: always;
              page-break-inside: avoid;
            }
            
            .page:last-child {
              page-break-after: auto;
            }
            
            .page-header {
              padding: 15.9mm 25.4mm 6mm;
              color: #6b7280;
              min-height: 15.9mm;
              display: flex;
              align-items: center;
              border-bottom: 1px solid #e5e7eb;
            }
            
            .page-body {
              padding: 6mm 25.4mm;
              flex: 1;
            }
            
            .page-footer {
              padding: 6mm 25.4mm 15.9mm;
              color: #6b7280;
              min-height: 15.9mm;
              display: flex;
              align-items: center;
              border-top: 1px solid #e5e7eb;
              position: relative;
            }
            
            @media print {
              body { padding: 0; background: white; }
              .page { box-shadow: none; margin: 0; }
            }
            
            h1 { font-size: 24pt; margin: 2em 0 1em; font-weight: 700; page-break-after: avoid; text-align: center; border-bottom: 2px solid #333; padding-bottom: 0.5em; }
            h2 { font-size: 18pt; margin: 1.8em 0 0.8em; font-weight: 700; page-break-after: avoid; border-bottom: 1px solid #666; padding-bottom: 0.3em; }
            h3 { font-size: 16pt; margin: 1.6em 0 0.6em; font-weight: 700; page-break-after: avoid; }
            h4 { font-size: 14pt; margin: 1.4em 0 0.5em; font-weight: 700; }
            h5 { font-size: 13pt; margin: 1.2em 0 0.4em; font-weight: 700; }
            h6 { font-size: 12pt; margin: 1em 0 0.3em; font-weight: 600; font-style: italic; }
            
            p { margin: 1em 0; text-align: justify; orphans: 2; widows: 2; }
            
            ul, ol { list-style-position: outside; padding-left: 1.5em; margin: 1em 0; }
            li { margin: 0.25em 0; }
            
            .task-list { list-style: none; padding-left: 0; }
            .task-list-item { list-style: none; }
            
            blockquote {
              border-left: 4px solid #3b82f6;
              padding: 1em 1.5em;
              margin: 1.5em 0;
              font-style: italic;
              background: #f8fafc;
              border-radius: 0 0.375rem 0.375rem 0;
              page-break-inside: avoid;
            }
            
            code {
              background: #f1f5f9;
              padding: 0.2em 0.4em;
              border-radius: 0.25em;
              font-size: 0.9em;
              font-family: 'Courier New', monospace;
            }
            
            pre {
              background: #f8f9fa;
              padding: 1em;
              border-radius: 0.5em;
              overflow-x: auto;
              page-break-inside: avoid;
              font-family: 'Courier New', monospace;
            }
            
            table {
              border-collapse: collapse;
              width: 100%;
              margin: 1em 0;
              page-break-inside: avoid;
              font-size: 11pt;
            }
            
            th, td {
              border: 1px solid #d1d5db;
              padding: 0.75em;
              text-align: left;
            }
            
            th {
              background: #f9fafb;
              font-weight: 600;
            }
            
            tbody tr:nth-child(even) {
              background: #f9fafb;
            }
            
            img {
              max-width: 100%;
              height: auto;
              border-radius: 0.5em;
            }
            
            .highlight-mark {
              background-color: #fef3c7;
              padding: 1px 2px;
              border-radius: 2px;
            }
          </style>
        </head>
        <body>
          ${pageHtml}
        </body>
      </html>
    `

    const blob = new Blob([htmlContent], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "document.html"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleInsertPageBreak = () => {
    if (!editor) return
    editor.chain().focus().setPageBreak().run()
  }

  const handleFitToWidth = () => {
    if (editorContainerRef.current) {
      const container = editorContainerRef.current
      const containerWidth = container.clientWidth - 64
      const pageWidth = 794
      const newZoom = Math.min(1.2, Math.max(0.3, containerWidth / pageWidth))
      setZoom(newZoom)
    }
  }


  const handleHeadingClick = (element: HTMLElement) => {
    element.scrollIntoView({ behavior: "smooth", block: "center" })
  }

  const handleSearchResultClick = (element: HTMLElement) => {
    element.scrollIntoView({ behavior: "smooth", block: "center" })
  }

  const handlePageClick = (pageIndex: number) => {
    const pageElements = document.querySelectorAll(".paginated-page")
    const targetPage = pageElements[pageIndex] as HTMLElement
    if (targetPage) {
      targetPage.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  if (!editor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading editor...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <EditorHeader
        editor={editor}
        wordCount={wordCount}
        charCount={charCount}
        pageCount={pageCount}
        activeTab={activeTab}
        headerEnabled={headerEnabled}
        footerEnabled={footerEnabled}
        headerAlign={headerAlign}
        footerAlign={footerAlign}
        showRuler={showRuler}
        zoom={zoom}
        onTabChange={setActiveTab}
        onHeaderToggle={setHeaderEnabled}
        onFooterToggle={setFooterEnabled}
        onHeaderAlignChange={setHeaderAlign}
        onFooterAlignChange={setFooterAlign}
        onRulerToggle={setShowRuler}
        onZoomChange={setZoom}
        onFitToWidth={handleFitToWidth}
        onExport={handleExport}
        onPrint={handlePrint}
        onPageBreak={handleInsertPageBreak}
      />

      <div className="flex-1 overflow-hidden">
        <div className={`h-full transition-all duration-300 ${sidebarVisible ? "mr-[350px]" : ""}`}>
          <main className="flex-1 overflow-auto bg-gray-100">
            <div ref={editorContainerRef} className="container mx-auto py-8 px-4">
              {showRuler && (
                <div
                  className="mb-6 h-10 bg-white border border-gray-300 rounded-lg relative overflow-hidden mx-auto shadow-sm"
                  style={{
                    width: `${794 * zoom}px`,
                    transform: `scale(${zoom})`,
                    transformOrigin: "center top",
                  }}
                >
                  <div className="absolute inset-0 flex border-b border-gray-200">
                    {Array.from({ length: 21 }, (_, i) => (
                      <div key={i} className="flex-1 border-r border-gray-300 relative">
                        <div className="absolute top-1 left-1 text-xs text-gray-500 font-mono">{i * 10}mm</div>
                        <div className="absolute bottom-0 left-1/2 w-px h-4 bg-gray-400"></div>
                        <div className="absolute bottom-0 left-1/4 w-px h-2 bg-gray-300"></div>
                        <div className="absolute bottom-0 left-3/4 w-px h-2 bg-gray-300"></div>
                      </div>
                    ))}
                  </div>
                  <div className="absolute right-0 top-0 w-8 h-full bg-gray-50 border-l border-gray-300 flex flex-col justify-between text-xs text-gray-500 font-mono py-1">
                    <span>0</span>
                    <span className="transform -rotate-90 origin-center">mm</span>
                    <span>297</span>
                  </div>
                </div>
              )}

              <PaginatedEditor
                ref={paginatedEditorRef}
                editor={editor}
                zoom={zoom}
                headerEnabled={headerEnabled}
                footerEnabled={footerEnabled}
                headerContent={headerHtml}
                footerContent={footerHtml}
                headerAlign={headerAlign}
                footerAlign={footerAlign}
                onHeaderChange={setHeaderHtml}
                onFooterChange={setFooterHtml}
                onPageCountChange={handlePageCountChange}
              />
            </div>
          </main>
        </div>

        <CollapsibleSidebar
          isVisible={sidebarVisible}
          onToggle={() => setSidebarVisible(!sidebarVisible)}
          editorElement={editorElementRef.current}
          onHeadingClick={handleHeadingClick}
          onSearchResultClick={handleSearchResultClick}
        >
          <PagePreviewPane
            html={currentHtml}
            header={headerHtml}
            footer={footerHtml}
            headerEnabled={headerEnabled}
            footerEnabled={footerEnabled}
            headerAlign={headerAlign}
            footerAlign={footerAlign}
            showPageNumbers={showPageNumbers}
            onPageClick={handlePageClick}
            pages={currentPages}
          />
        </CollapsibleSidebar>
      </div>

      <TrashBin />

      <style>{`
        /* Blinking cursor animation */
        .ProseMirror .ProseMirror-cursor-wrapper {
          position: relative;
        }
        
        .ProseMirror .ProseMirror-cursor {
          position: absolute;
          border-left: 1px solid #000;
          border-right: 1px solid #000;
          margin-left: -1px;
          margin-right: -1px;
          pointer-events: none;
          animation: cursor-blink 1.2s infinite;
        }
        
        @keyframes cursor-blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        
        /* Enhanced placeholder styling */
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #9ca3af;
          pointer-events: none;
          height: 0;
          font-style: italic;
        }
        
        .ProseMirror .is-empty::before {
          content: attr(data-placeholder);
          float: left;
          color: #9ca3af;
          pointer-events: none;
          height: 0;
          font-style: italic;
        }
        
        /* Focus styles */
        .ProseMirror:focus {
          outline: none;
        }
        
        .ProseMirror-focused {
          outline: none;
        }
        
        /* Smooth scrolling */
        .overflow-auto {
          scroll-behavior: smooth;
        }
      `}</style>

      <FooterBar
        currentPage={currentPage}
        totalPages={pageCount}
        wordCount={wordCount}
        charCount={charCount}
        sidebarVisible={sidebarVisible}
      />
    </div>
  )
}
