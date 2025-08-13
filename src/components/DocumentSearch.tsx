
import type React from "react"
import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import { Search, ChevronUp, ChevronDown, X, RotateCcw, MapPin } from "lucide-react"

interface SearchResult {
  element: HTMLElement
  text: string
  index: number
  context: string
  position: { start: number; end: number }
  pageNumber?: number
}

interface DocumentSearchProps {
  editorElement: HTMLElement | null
  onResultClick: (element: HTMLElement) => void
}

export const DocumentSearch: React.FC<DocumentSearchProps> = ({ editorElement, onResultClick }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentResultIndex, setCurrentResultIndex] = useState(0)
  const [highlightedElements, setHighlightedElements] = useState<HTMLElement[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [caseSensitive, setCaseSensitive] = useState(false)
  const [wholeWords, setWholeWords] = useState(false)
  const highlightStyleRef = useRef<HTMLStyleElement | null>(null)

  // Create dynamic highlight styles
  useEffect(() => {
    if (!highlightStyleRef.current) {
      highlightStyleRef.current = document.createElement("style")
      document.head.appendChild(highlightStyleRef.current)
    }

    highlightStyleRef.current.textContent = `
      .search-highlight {
        background-color: #fef3c7 !important;
        padding: 1px 2px !important;
        border-radius: 2px !important;
        transition: all 0.2s ease !important;
        box-decoration-break: clone !important;
        -webkit-box-decoration-break: clone !important;
      }
      
      .search-highlight-current {
        background-color: #fbbf24 !important;
        box-shadow: 0 0 0 2px #f59e0b !important;
        font-weight: 500 !important;
        animation: pulse-highlight 1s ease-in-out !important;
      }

      @keyframes pulse-highlight {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
      }

      /* Ensure highlights are visible in print */
      @media print {
        .search-highlight,
        .search-highlight-current {
          background-color: #f3f4f6 !important;
          box-shadow: none !important;
          border: 1px solid #d1d5db !important;
        }
      }
    `

    return () => {
      if (highlightStyleRef.current) {
        document.head.removeChild(highlightStyleRef.current)
        highlightStyleRef.current = null
      }
    }
  }, [])

  // Enhanced search with better text matching and page detection
  const searchResults = useMemo(() => {
    if (!editorElement || !searchTerm.trim()) return []

    setIsSearching(true)
    const results: SearchResult[] = []
    const searchFlags = caseSensitive ? "g" : "gi"
    const pattern = wholeWords
      ? `\\b${searchTerm.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`
      : searchTerm.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

    try {
      const regex = new RegExp(pattern, searchFlags)

      // Find all text nodes in the editor
      const walker = document.createTreeWalker(editorElement, NodeFilter.SHOW_TEXT, {
        acceptNode: (node) => {
          const parent = node.parentElement
          if (!parent) return NodeFilter.FILTER_REJECT

          // Skip script, style, and already highlighted elements
          if (["SCRIPT", "STYLE"].includes(parent.tagName) || parent.classList.contains("search-highlight")) {
            return NodeFilter.FILTER_REJECT
          }

          return NodeFilter.FILTER_ACCEPT
        },
      })

      let node
      let index = 0

      while ((node = walker.nextNode())) {
        const text = node.textContent || ""
        let match

        // Reset regex lastIndex for global search
        regex.lastIndex = 0

        while ((match = regex.exec(text)) !== null) {
          const element = node.parentElement
          if (element) {
            // Find which page this element belongs to
            let pageNumber = 1
            const pageContainer = element.closest(".paginated-page")
            if (pageContainer) {
              const pageAttr = pageContainer.getAttribute("data-page")
              pageNumber = pageAttr ? Number.parseInt(pageAttr) : 1
            }

            // Create context around the match
            const contextStart = Math.max(0, match.index - 50)
            const contextEnd = Math.min(text.length, match.index + match[0].length + 50)
            const context = text.substring(contextStart, contextEnd)

            results.push({
              element,
              text: match[0],
              index: index++,
              context: (contextStart > 0 ? "..." : "") + context + (contextEnd < text.length ? "..." : ""),
              position: { start: match.index, end: match.index + match[0].length },
              pageNumber,
            })
          }

          // Prevent infinite loop with zero-width matches
          if (match[0].length === 0) {
            regex.lastIndex++
          }
        }
      }
    } catch (error) {
      console.warn("Invalid search pattern:", error)
    }

    setIsSearching(false)
    return results
  }, [editorElement, searchTerm, caseSensitive, wholeWords])

  // Clear all highlights
  const clearHighlights = useCallback(() => {
    if (!editorElement) return

    const highlights = editorElement.querySelectorAll(".search-highlight")
    highlights.forEach((highlight) => {
      const parent = highlight.parentNode
      if (parent) {
        // Replace highlight span with its text content
        const textNode = document.createTextNode(highlight.textContent || "")
        parent.replaceChild(textNode, highlight)
      }
    })

    // Normalize text nodes to merge adjacent ones
    const walker = document.createTreeWalker(editorElement, NodeFilter.SHOW_ELEMENT, {
      acceptNode: (node) => {
        return node.nodeType === Node.ELEMENT_NODE ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP
      },
    })

    const elementsToNormalize: Element[] = []
    let element
    while ((element = walker.nextNode())) {
      elementsToNormalize.push(element as Element)
    }

    elementsToNormalize.forEach((el) => {
      if (el.normalize) {
        el.normalize()
      }
    })

    setHighlightedElements([])
  }, [editorElement])

  // Apply highlights to search results
  const applyHighlights = useCallback(() => {
    if (!editorElement || !searchTerm.trim() || searchResults.length === 0) {
      clearHighlights()
      return
    }

    // Clear existing highlights first
    clearHighlights()

    const searchFlags = caseSensitive ? "g" : "gi"
    const pattern = wholeWords
      ? `\\b${searchTerm.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`
      : searchTerm.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

    try {
      const regex = new RegExp(pattern, searchFlags)
      const newHighlightedElements: HTMLElement[] = []

      // Group results by element to avoid conflicts
      const elementResults = new Map<HTMLElement, SearchResult[]>()
      searchResults.forEach((result) => {
        if (!elementResults.has(result.element)) {
          elementResults.set(result.element, [])
        }
        elementResults.get(result.element)!.push(result)
      })

      elementResults.forEach((results, element) => {
        const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
          acceptNode: (node) => {
            const parent = node.parentElement
            return parent && !parent.classList.contains("search-highlight")
              ? NodeFilter.FILTER_ACCEPT
              : NodeFilter.FILTER_REJECT
          },
        })

        const textNodes: Text[] = []
        let textNode
        while ((textNode = walker.nextNode())) {
          textNodes.push(textNode as Text)
        }

        textNodes.forEach((node) => {
          const text = node.textContent || ""
          if (regex.test(text)) {
            // Create highlighted version
            const fragment = document.createDocumentFragment()
            let lastIndex = 0

            regex.lastIndex = 0
            let match
            while ((match = regex.exec(text)) !== null) {
              // Add text before match
              if (match.index > lastIndex) {
                fragment.appendChild(document.createTextNode(text.slice(lastIndex, match.index)))
              }

              // Create highlight span
              const highlight = document.createElement("span")
              const isCurrentResult = results.some((r) => r.index === currentResultIndex)
              highlight.className = isCurrentResult ? "search-highlight search-highlight-current" : "search-highlight"
              highlight.textContent = match[0]
              fragment.appendChild(highlight)

              lastIndex = match.index + match[0].length

              // Prevent infinite loop
              if (match[0].length === 0) {
                regex.lastIndex++
              }
            }

            // Add remaining text
            if (lastIndex < text.length) {
              fragment.appendChild(document.createTextNode(text.slice(lastIndex)))
            }

            // Replace the text node with highlighted version
            const parent = node.parentNode
            if (parent) {
              parent.replaceChild(fragment, node)
            }
          }
        })

        newHighlightedElements.push(element)
      })

      setHighlightedElements(newHighlightedElements)

      // Scroll to current result
      if (searchResults[currentResultIndex]) {
        const currentResult = searchResults[currentResultIndex]
        const currentHighlight = currentResult.element.querySelector(".search-highlight-current")

        if (currentHighlight) {
          currentHighlight.scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "nearest",
          })
        } else {
          currentResult.element.scrollIntoView({
            behavior: "smooth",
            block: "center",
          })
        }
      }
    } catch (error) {
      console.warn("Error applying highlights:", error)
    }
  }, [editorElement, searchTerm, searchResults, currentResultIndex, caseSensitive, wholeWords, clearHighlights])

  // Apply highlights when search results or current index changes
  useEffect(() => {
    const timeoutId = setTimeout(applyHighlights, 100)
    return () => clearTimeout(timeoutId)
  }, [applyHighlights])

  // Clear highlights when component unmounts or search term is cleared
  useEffect(() => {
    return () => {
      clearHighlights()
    }
  }, [clearHighlights])

  const handlePrevious = () => {
    if (searchResults.length > 0) {
      setCurrentResultIndex((prev) => (prev === 0 ? searchResults.length - 1 : prev - 1))
    }
  }

  const handleNext = () => {
    if (searchResults.length > 0) {
      setCurrentResultIndex((prev) => (prev === searchResults.length - 1 ? 0 : prev + 1))
    }
  }

  const handleClear = () => {
    setSearchTerm("")
    setCurrentResultIndex(0)
    clearHighlights()
  }

  const handleResultClick = (result: SearchResult) => {
    const index = searchResults.indexOf(result)
    setCurrentResultIndex(index)
    onResultClick(result.element)
  }

  return (
    <div className="h-full flex flex-col">
      {/* Enhanced Search Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-2 mb-3">
          <Search size={18} className="text-blue-600" />
          <h3 className="text-sm font-semibold text-gray-900">Search Document</h3>
        </div>

        {/* Search Input */}
        <div className="relative mb-3">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentResultIndex(0)
            }}
            placeholder="Search for text..."
            className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          {searchTerm && (
            <button
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Search Options */}
        <div className="flex gap-3 mb-3">
          <label className="inline-flex items-center text-xs text-gray-600">
            <input
              type="checkbox"
              checked={caseSensitive}
              onChange={(e) => setCaseSensitive(e.target.checked)}
              className="mr-1.5 rounded"
            />
            Case sensitive
          </label>
          <label className="inline-flex items-center text-xs text-gray-600">
            <input
              type="checkbox"
              checked={wholeWords}
              onChange={(e) => setWholeWords(e.target.checked)}
              className="mr-1.5 rounded"
            />
            Whole words
          </label>
        </div>

        {/* Search Results Summary */}
        {searchTerm && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {isSearching ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  Searching...
                </span>
              ) : searchResults.length === 0 ? (
                <span className="text-red-600">No results found</span>
              ) : (
                <span className="font-medium">
                  {currentResultIndex + 1} of {searchResults.length} results
                </span>
              )}
            </div>

            {searchResults.length > 0 && (
              <div className="flex items-center gap-1">
                <button
                  onClick={handlePrevious}
                  className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
                  disabled={searchResults.length === 0}
                  title="Previous result"
                >
                  <ChevronUp size={16} />
                </button>
                <button
                  onClick={handleNext}
                  className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
                  disabled={searchResults.length === 0}
                  title="Next result"
                >
                  <ChevronDown size={16} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Enhanced Search Results List */}
      {searchTerm && searchResults.length > 0 && (
        <div className="flex-1 overflow-auto">
          <div className="p-2 space-y-1">
            {searchResults.map((result, index) => (
              <button
                key={`result-${index}`}
                onClick={() => handleResultClick(result)}
                className={`w-full text-left p-3 rounded-lg text-sm transition-all duration-200 border ${
                  index === currentResultIndex
                    ? "bg-blue-50 border-blue-200 shadow-sm"
                    : "hover:bg-gray-50 border-transparent hover:border-gray-200"
                }`}
              >
                <div className="flex items-start gap-2">
                  <MapPin
                    size={14}
                    className={`mt-0.5 flex-shrink-0 ${
                      index === currentResultIndex ? "text-blue-600" : "text-gray-400"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-medium text-gray-900">Match {index + 1}</div>
                      {result.pageNumber && (
                        <div className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                          Page {result.pageNumber}
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-gray-600 leading-relaxed">
                      {result.context
                        .split(
                          new RegExp(
                            `(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
                            caseSensitive ? "g" : "gi",
                          ),
                        )
                        .map((part, i) => (
                          <span
                            key={i}
                            className={
                              part.toLowerCase() === searchTerm.toLowerCase() || (caseSensitive && part === searchTerm)
                                ? "bg-yellow-200 font-medium px-1 rounded"
                                : ""
                            }
                          >
                            {part}
                          </span>
                        ))}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {searchTerm && searchResults.length === 0 && !isSearching && (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <Search size={48} className="mx-auto text-gray-300 mb-4" />
            <h4 className="text-sm font-medium text-gray-900 mb-2">No results found</h4>
            <p className="text-xs text-gray-500 mb-4">Try adjusting your search terms or options</p>
            <button
              onClick={() => {
                setCaseSensitive(false)
                setWholeWords(false)
              }}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-xs text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            >
              <RotateCcw size={14} />
              Reset options
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
