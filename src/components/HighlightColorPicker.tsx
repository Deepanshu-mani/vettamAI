import React, { useState, useRef, useEffect } from 'react';
import { Editor } from '@tiptap/react';
import { Highlighter, X } from 'lucide-react';

interface HighlightColorPickerProps {
  editor: Editor | null;
}

// Unique, non-repeating set of highlight colors
const HIGHLIGHT_COLORS = [
  '#fef08a', // yellow-200
  '#fed7aa', // orange-200
  '#fecaca', // red-200
  '#f9a8d4', // pink-200
  '#ddd6fe', // violet-200
  '#c7d2fe', // indigo-200
  '#bfdbfe', // blue-200
  '#a7f3d0', // emerald-200
  '#bbf7d0', // green-200
  '#fde68a', // amber-200
  '#f3e8ff', // purple-200
  '#e0e7ff', // indigo-100
];

export const HighlightColorPicker: React.FC<HighlightColorPickerProps> = ({ editor }) => {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const btnBase = "inline-flex items-center justify-center rounded-lg border border-transparent px-3 py-1.5 text-base font-medium bg-[#f9f9f9] cursor-pointer transition-colors duration-200 hover:bg-gray-100";

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleColorSelect = (color: string) => {
    if (!editor) return;
    editor.chain().focus().setHighlight({ color }).run();
    setIsOpen(false);
  };

  const handleClearHighlight = () => {
    if (!editor) return;
    editor.chain().focus().unsetHighlight().run();
    setIsOpen(false);
  };

  if (!editor) return null;

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        className={btnBase}
        onClick={handleToggle}
        aria-label="Highlight"
        title="Highlight"
        type="button"
      >
        <Highlighter size={18} />
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-50"
          style={{ minWidth: '240px' }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700">Highlight Color</span>
            <button
              onClick={handleClearHighlight}
              className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
              type="button"
              title="Clear highlight"
            >
              <X size={12} />
              Clear
            </button>
          </div>
          
          <div className="grid grid-cols-6 gap-2">
            {HIGHLIGHT_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => handleColorSelect(color)}
                className="w-8 h-8 rounded-md border border-gray-200 hover:scale-105 transition-transform focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ backgroundColor: color }}
                title={`Highlight with ${color}`}
                type="button"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};