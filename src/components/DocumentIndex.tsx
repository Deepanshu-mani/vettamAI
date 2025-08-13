
import type React from "react"
import { useMemo } from "react"
import { Hash, FileText, ChevronRight } from "lucide-react"

interface Heading {
  id: string
  level: number
  text: string
  element: HTMLElement
}

interface DocumentIndexProps {
  editorElement: HTMLElement | null
  onHeadingClick: (element: HTMLElement) => void
}

export const DocumentIndex: React.FC<DocumentIndexProps> = ({ editorElement, onHeadingClick }) => {
  const headings = useMemo(() => {
    if (!editorElement) return []

    const headingElements = editorElement.querySelectorAll("h1, h2, h3, h4, h5, h6")
    const headings: Heading[] = []

    headingElements.forEach((element, index) => {
      const level = Number.parseInt(element.tagName.charAt(1))
      const text = element.textContent?.trim() || ""

      if (text) {
        // Add an ID if it doesn't exist
        if (!element.id) {
          element.id = `heading-${index}`
        }

        headings.push({
          id: element.id,
          level,
          text,
          element: element as HTMLElement,
        })
      }
    })

    return headings
  }, [editorElement])

  if (headings.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center">
          <FileText size={48} className="mx-auto text-gray-300 mb-4" />
          <h4 className="text-sm font-medium text-gray-900 mb-2">No headings found</h4>
          <p className="text-xs text-gray-500">Add headings (H1-H6) to see document structure</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Enhanced Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-2 mb-2">
          <Hash size={18} className="text-blue-600" />
          <h3 className="text-sm font-semibold text-gray-900">Document Outline</h3>
        </div>
        <p className="text-xs text-gray-500">
          {headings.length} heading{headings.length !== 1 ? "s" : ""} found
        </p>
      </div>

      {/* Enhanced Headings List */}
      <div className="flex-1 overflow-auto p-2">
        <div className="space-y-1">
          {headings.map((heading) => (
            <button
              key={heading.id}
              onClick={() => onHeadingClick(heading.element)}
              className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-all duration-200 group border border-transparent hover:border-gray-200"
              style={{ paddingLeft: `${12 + (heading.level - 1) * 16}px` }}
            >
              <div className="flex items-center gap-3">
                {/* Level indicator */}
                <div
                  className={`
                  flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold
                  ${
                    heading.level === 1
                      ? "bg-blue-100 text-blue-700"
                      : heading.level === 2
                        ? "bg-green-100 text-green-700"
                        : heading.level === 3
                          ? "bg-yellow-100 text-yellow-700"
                          : heading.level === 4
                            ? "bg-purple-100 text-purple-700"
                            : heading.level === 5
                              ? "bg-pink-100 text-pink-700"
                              : "bg-gray-100 text-gray-700"
                  }
                `}
                >
                  H{heading.level}
                </div>

                {/* Heading text */}
                <div className="flex-1 min-w-0">
                  <div
                    className={`
                    truncate transition-colors
                    ${
                      heading.level === 1
                        ? "text-sm font-semibold text-gray-900"
                        : heading.level === 2
                          ? "text-sm font-medium text-gray-800"
                          : "text-sm text-gray-700"
                    }
                  `}
                  >
                    {heading.text}
                  </div>
                  {heading.level <= 2 && <div className="text-xs text-gray-500 mt-0.5">Level {heading.level}</div>}
                </div>

                {/* Navigation arrow */}
                <ChevronRight size={14} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Enhanced Footer */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="text-xs text-gray-500 text-center">Click any heading to navigate</div>
      </div>
    </div>
  )
}
