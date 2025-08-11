import React, { useMemo } from 'react';
import { Hash } from 'lucide-react';

interface Heading {
  id: string;
  level: number;
  text: string;
  element: HTMLElement;
}

interface DocumentIndexProps {
  editorElement: HTMLElement | null;
  onHeadingClick: (element: HTMLElement) => void;
}

export const DocumentIndex: React.FC<DocumentIndexProps> = ({
  editorElement,
  onHeadingClick,
}) => {
  const headings = useMemo(() => {
    if (!editorElement) return [];

    const headingElements = editorElement.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const headings: Heading[] = [];

    headingElements.forEach((element, index) => {
      const level = parseInt(element.tagName.charAt(1));
      const text = element.textContent?.trim() || '';
      
      if (text) {
        // Add an ID if it doesn't exist
        if (!element.id) {
          element.id = `heading-${index}`;
        }
        
        headings.push({
          id: element.id,
          level,
          text,
          element: element as HTMLElement,
        });
      }
    });

    return headings;
  }, [editorElement]);

  if (headings.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        <Hash size={24} className="mx-auto mb-2 opacity-50" />
        <p className="text-sm">No headings found</p>
        <p className="text-xs mt-1">Add headings to see document structure</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
        <Hash size={16} />
        Document Index
      </div>
      
      <div className="space-y-1">
        {headings.map((heading) => (
          <button
            key={heading.id}
            onClick={() => onHeadingClick(heading.element)}
            className="w-full text-left px-2 py-1.5 rounded hover:bg-gray-100 transition-colors group"
            style={{ paddingLeft: `${8 + (heading.level - 1) * 12}px` }}
          >
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 font-mono">
                H{heading.level}
              </span>
              <span className="text-sm text-gray-700 group-hover:text-gray-900 truncate">
                {heading.text}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};