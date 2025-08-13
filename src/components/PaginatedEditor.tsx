

import { forwardRef, useImperativeHandle, useEffect, useState, useCallback, useRef } from "react"
import { type Editor, EditorContent } from "@tiptap/react"
import { PageContainer } from "./PageContainer"

type Align = "start" | "center" | "end"

interface PaginatedEditorProps {
  editor: Editor | null
  zoom: number
  headerEnabled: boolean
  footerEnabled: boolean
  headerContent: string
  footerContent: string
  headerAlign: Align
  footerAlign: Align
  onHeaderChange: (content: string) => void
  onFooterChange: (content: string) => void
  onPageCountChange: (count: number) => void
}

export interface PaginatedEditorRef {
  updatePagination: () => void
  getCleanPages: () => string[]
}

export const PaginatedEditor = forwardRef<PaginatedEditorRef, PaginatedEditorProps>(
  (
    {
      editor,
      zoom,
      headerEnabled,
      footerEnabled,
      headerContent,
      footerContent,
      headerAlign,
      footerAlign,
      onHeaderChange,
      onFooterChange,
      onPageCountChange,
    },
    ref,
  ) => {
    const [pages, setPages] = useState<string[]>([""])
    const containerRef = useRef<HTMLDivElement>(null)
    const editorRef = useRef<HTMLDivElement>(null)

    // A4 dimensions in pixels (at 96 DPI)
    const A4_WIDTH_PX = 210 * 3.78 // 210mm
    const A4_HEIGHT_PX = 297 * 3.78 // 297mm

    // Calculate content area height (excluding header/footer)
    const getContentHeight = useCallback(() => {
      const headerHeight = headerEnabled ? 20 * 3.78 : 0 // 20mm
      const footerHeight = footerEnabled ? 20 * 3.78 : 0 // 20mm
      const padding = 64 * 3.78 // 64mm total vertical padding (increased from 32mm)
      return A4_HEIGHT_PX - headerHeight - footerHeight - padding
    }, [headerEnabled, footerEnabled])

    const updatePagination = useCallback(() => {
      if (!editor || !containerRef.current) return

      const editorElement = editor.view.dom as HTMLElement
      if (!editorElement) return

      // Create a temporary container to measure content
      const tempContainer = document.createElement("div")
      tempContainer.style.position = "absolute"
      tempContainer.style.left = "-9999px"
      tempContainer.style.top = "-9999px"
      tempContainer.style.width = `${(A4_WIDTH_PX - 64 * 3.78) * zoom}px` // Content width minus padding
      tempContainer.style.fontSize = "16px"
      tempContainer.style.lineHeight = "1.6"
      tempContainer.style.padding = "32px" // Add padding to temp container
      tempContainer.innerHTML = editor.getHTML()

      document.body.appendChild(tempContainer)

      const contentHeight = getContentHeight() * zoom
      const newPages: string[] = []

      // Simple pagination based on content height
      const children = Array.from(tempContainer.children)
      let currentPageContent = ""
      let currentHeight = 0

      for (const child of children) {
        const childHeight = (child as HTMLElement).offsetHeight

        if (currentHeight + childHeight > contentHeight && currentPageContent) {
          // Start new page
          newPages.push(currentPageContent)
          currentPageContent = child.outerHTML
          currentHeight = childHeight
        } else {
          currentPageContent += child.outerHTML
          currentHeight += childHeight
        }
      }

      // Add the last page
      if (currentPageContent) {
        newPages.push(currentPageContent)
      }

      // Ensure at least one page
      if (newPages.length === 0) {
        newPages.push(editor.getHTML())
      }

      document.body.removeChild(tempContainer)

      setPages(newPages)
      onPageCountChange(newPages.length)
    }, [editor, zoom, getContentHeight, onPageCountChange])

    // Get clean pages for export/print
    const getCleanPages = useCallback(() => {
      return pages.filter((page) => {
        // Remove empty pages and pages with only whitespace/empty elements
        const tempDiv = document.createElement("div")
        tempDiv.innerHTML = page
        const textContent = tempDiv.textContent || tempDiv.innerText || ""
        return textContent.trim().length > 0
      })
    }, [pages])

    // Expose methods
    useImperativeHandle(
      ref,
      () => ({
        updatePagination,
        getCleanPages,
      }),
      [updatePagination, getCleanPages],
    )

    // Update pagination when dependencies change
    useEffect(() => {
      const timeoutId = setTimeout(updatePagination, 100)
      return () => clearTimeout(timeoutId)
    }, [updatePagination, zoom, headerEnabled, footerEnabled])

    // Update pagination on editor content changes
    useEffect(() => {
      if (!editor) return

      const handleUpdate = () => {
        const timeoutId = setTimeout(updatePagination, 50)
        return () => clearTimeout(timeoutId)
      }

      editor.on("update", handleUpdate)
      editor.on("transaction", handleUpdate)

      return () => {
        editor.off("update", handleUpdate)
        editor.off("transaction", handleUpdate)
      }
    }, [editor, updatePagination])

    if (!editor) return null


    return (
      <div ref={containerRef} className="space-y-6">
        {pages.map((pageContent, index) => (
          <PageContainer
            key={index}
            pageNumber={index + 1}
            totalPages={pages.length}
            headerContent={headerContent}
            footerContent={footerContent}
            headerEnabled={headerEnabled}
            footerEnabled={footerEnabled}
            headerAlign={headerAlign}
            footerAlign={footerAlign}
            onHeaderChange={onHeaderChange}
            onFooterChange={onFooterChange}
            zoom={zoom}
            className="paginated-page"
            htmlContent={index === 0 ? undefined : pageContent}
          >
            {index === 0 ? (
              <div ref={editorRef} className="p-8">
                <EditorContent editor={editor} />
              </div>
            ) : null}
          </PageContainer>
        ))}
      </div>
    )
  },
)
