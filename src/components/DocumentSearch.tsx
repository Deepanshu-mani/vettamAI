import React, { useState, useEffect, useMemo } from 'react';
import { Search, ChevronUp, ChevronDown, X } from 'lucide-react';

interface SearchResult {
  element: HTMLElement;
  text: string;
  index: number;
}

interface DocumentSearchProps {
  editorElement: HTMLElement | null;
  onResultClick: (element: HTMLElement) => void;
}

export const DocumentSearch: React.FC<DocumentSearchProps> = ({
  editorElement,
  onResultClick,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentResultIndex, setCurrentResultIndex] = useState(0);
  const [highlightedElements, setHighlightedElements] = useState<HTMLElement[]>([]);

  const searchResults = useMemo(() => {
    if (!editorElement || !searchTerm.trim()) return [];

    const results: SearchResult[] = [];
    const walker = document.createTreeWalker(
      editorElement,
      NodeFilter.SHOW_TEXT,
      null
    );

    let node;
    let index = 0;
    while ((node = walker.nextNode())) {
      const text = node.textContent || '';
      const regex = new RegExp(searchTerm.trim(), 'gi');
      let match;
      
      while ((match = regex.exec(text)) !== null) {
        const element = node.parentElement;
        if (element) {
          results.push({
            element,
            text: text.substring(Math.max(0, match.index - 20), match.index + match[0].length + 20),
            index: index++,
          });
        }
      }
    }

    return results;
  }, [editorElement, searchTerm]);

  // Highlight search results
  useEffect(() => {
    // Clear previous highlights
    highlightedElements.forEach(el => {
      el.style.backgroundColor = '';
    });

    if (!searchTerm.trim() || searchResults.length === 0) {
      setHighlightedElements([]);
      return;
    }

    const newHighlightedElements: HTMLElement[] = [];
    
    searchResults.forEach((result, index) => {
      const element = result.element;
      const isCurrentResult = index === currentResultIndex;
      
      element.style.backgroundColor = isCurrentResult ? '#fbbf24' : '#fef3c7';
      newHighlightedElements.push(element);
    });

    setHighlightedElements(newHighlightedElements);

    // Scroll to current result
    if (searchResults[currentResultIndex]) {
      searchResults[currentResultIndex].element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [searchTerm, searchResults, currentResultIndex]);

  const handlePrevious = () => {
    if (searchResults.length > 0) {
      setCurrentResultIndex((prev) => 
        prev === 0 ? searchResults.length - 1 : prev - 1
      );
    }
  };

  const handleNext = () => {
    if (searchResults.length > 0) {
      setCurrentResultIndex((prev) => 
        prev === searchResults.length - 1 ? 0 : prev + 1
      );
    }
  };

  const handleClear = () => {
    setSearchTerm('');
    setCurrentResultIndex(0);
  };

  const handleResultClick = (result: SearchResult) => {
    onResultClick(result.element);
  };

  return (
    <div className="p-4">
      <div className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
        <Search size={16} />
        Search Document
      </div>

      {/* Search Input */}
      <div className="relative mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentResultIndex(0);
          }}
          placeholder="Search in document..."
          className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {searchTerm && (
          <button
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Search Results Summary */}
      {searchTerm && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>
              {searchResults.length === 0 
                ? 'No results found' 
                : `${currentResultIndex + 1} of ${searchResults.length} results`
              }
            </span>
            {searchResults.length > 0 && (
              <div className="flex items-center gap-1">
                <button
                  onClick={handlePrevious}
                  className="p-1 rounded hover:bg-gray-100"
                  disabled={searchResults.length === 0}
                >
                  <ChevronUp size={14} />
                </button>
                <button
                  onClick={handleNext}
                  className="p-1 rounded hover:bg-gray-100"
                  disabled={searchResults.length === 0}
                >
                  <ChevronDown size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Search Results List */}
      {searchTerm && searchResults.length > 0 && (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {searchResults.map((result, index) => (
            <button
              key={index}
              onClick={() => handleResultClick(result)}
              className={`w-full text-left p-2 rounded text-sm transition-colors ${
                index === currentResultIndex 
                  ? 'bg-yellow-100 border border-yellow-300' 
                  : 'hover:bg-gray-100 border border-transparent'
              }`}
            >
              <div className="truncate">
                {result.text.replace(new RegExp(`(${searchTerm})`, 'gi'), '**$1**')}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};