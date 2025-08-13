
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
  getPages: () => string[]
  getCleanPages: () => string[]
}

interface PageContent {
  content: string
  height: number
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
    const [pages, setPages] = useState<PageContent[]>([{ content: "", height: 0 }])
    const containerRef = useRef<HTMLDivElement>(null)
    const editorRef = useRef<HTMLDivElement>(null)
    const measurementRef = useRef<HTMLDivElement>(null)

    // A4 dimensions in pixels (96 DPI)
    const A4_WIDTH_PX = 794 // 210mm
    const A4_HEIGHT_PX = 1123 // 297mm

    // Calculate available content height per page
    const getContentHeight = useCallback(() => {
      const headerHeight = headerEnabled ? 80 : 0 // Header + padding
      const footerHeight = footerEnabled ? 80 : 0 // Footer + padding
      const topBottomMargins = 192 // 96px top + 96px bottom (1 inch each)

      return A4_HEIGHT_PX - headerHeight - footerHeight - topBottomMargins
    }, [headerEnabled, footerEnabled])

    // Create measurement container for accurate height calculation
    const createMeasurementContainer = useCallback(() => {
      if (measurementRef.current) {
        document.body.removeChild(measurementRef.current)
      }

      const container = document.createElement("div")
      container.style.cssText = `
        position: absolute;
        left: -9999px;
        top: -9999px;
        width: ${A4_WIDTH_PX - 192}px;
        font-family: 'Times New Roman', Times, serif;
        font-size: 12pt;
        line-height: 1.5;
        color: #000;
        visibility: hidden;
        pointer-events: none;
        padding: 0;
        margin: 0;
        border: none;
        background: white;
      `

      // Apply the same styles as the actual editor content
      container.className = "ProseMirror document-content"
      document.body.appendChild(container)
      measurementRef.current = container

      return container
    }, [A4_WIDTH_PX])

    // Split content into pages based on height
    const splitContentIntoPages = useCallback((htmlContent: string): PageContent[] => {
      if (!htmlContent.trim()) {
        return [{ content: "", height: 0 }]
      }

      // Handle manual page breaks first
      const manualBreaks = htmlContent.split(/<div[^>]*data-type="page-break"[^>]*><\/div>/gi)

      if (manualBreaks.length > 1) {
        // Process each manual section
        const allPages: PageContent[] = []

        for (const section of manualBreaks) {
          if (section.trim()) {
            const sectionPages = splitSectionByHeight(section.trim())
            allPages.push(...sectionPages)
          }
        }

        return allPages.length > 0 ? allPages : [{ content: "", height: 0 }]
      } else {
        // No manual breaks, split by height only
        return splitSectionByHeight(htmlContent)
      }
    }, [])

    // Split a section of content by height
    const splitSectionByHeight = useCallback(
      (sectionContent: string): PageContent[] => {
        const maxHeight = getContentHeight()
        const measureContainer = createMeasurementContainer()

        try {
          // Parse the HTML content into elements
          measureContainer.innerHTML = sectionContent
          const elements = Array.from(measureContainer.children)

          if (elements.length === 0) {
            return [{ content: sectionContent, height: 0 }]
          }

          const pages: PageContent[] = []
          let currentPageElements: Element[] = []
          let currentHeight = 0

          for (const element of elements) {
            const elementHeight = (element as HTMLElement).offsetHeight

            // Check if this element would exceed the page height
            if (currentHeight + elementHeight > maxHeight && currentPageElements.length > 0) {
              // Save current page
              const pageContent = currentPageElements.map((el) => el.outerHTML).join("")
              pages.push({ content: pageContent, height: currentHeight })

              // Start new page with current element
              currentPageElements = [element]
              currentHeight = elementHeight
            } else {
              // Add element to current page
              currentPageElements.push(element)
              currentHeight += elementHeight
            }
          }

          // Add the last page if it has content
          if (currentPageElements.length > 0) {
            const pageContent = currentPageElements.map((el) => el.outerHTML).join("")
            pages.push({ content: pageContent, height: currentHeight })
          }

          return pages.length > 0 ? pages : [{ content: sectionContent, height: 0 }]
        } catch (error) {
          console.warn("Error splitting content by height:", error)
          return [{ content: sectionContent, height: 0 }]
        }
      },
      [getContentHeight, createMeasurementContainer],
    )

    // Main pagination update function
    const updatePagination = useCallback(() => {
      if (!editor) return

      const content = editor.getHTML()
      const newPages = splitContentIntoPages(content)

      setPages(newPages)
      onPageCountChange(newPages.length)
    }, [editor, splitContentIntoPages, onPageCountChange])

    // Cleanup measurement container
    useEffect(() => {
      return () => {
        if (measurementRef.current && document.body.contains(measurementRef.current)) {
          document.body.removeChild(measurementRef.current)
        }
      }
    }, [])

    // Expose methods
    useImperativeHandle(
      ref,
      () => ({
        updatePagination,
        getPages: () => pages.map((p) => p.content),
        getCleanPages: () =>
          pages.map((p) => p.content.replace(/<div[^>]*data-type="page-break"[^>]*><\/div>/gi, "").trim()),
      }),
      [updatePagination, pages],
    )

    // Update pagination when dependencies change
    useEffect(() => {
      const timeoutId = setTimeout(updatePagination, 200)
      return () => clearTimeout(timeoutId)
    }, [updatePagination, zoom, headerEnabled, footerEnabled])

    // Update pagination on editor content changes
    useEffect(() => {
      if (!editor) return

      const handleUpdate = () => {
        const timeoutId = setTimeout(updatePagination, 150)
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
      <div ref={containerRef} className="space-y-8">
        {pages.map((page, index) => (
          <PageContainer
            key={`page-${index}`}
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
            htmlContent={index === 0 ? undefined : page.content}
          >
            {index === 0 ? (
              <div ref={editorRef} className="editor-content h-full overflow-hidden">
                <EditorContent editor={editor} />
              </div>
            ) : null}
          </PageContainer>
        ))}
      </div>
    )
  },
)

PaginatedEditor.displayName = "PaginatedEditor"
