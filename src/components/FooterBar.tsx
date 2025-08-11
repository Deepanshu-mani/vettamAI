import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface FooterBarProps {
  currentPage: number;
  totalPages: number;
  wordCount: number;
  charCount: number;
  onPreviousPage: () => void;
  onNextPage: () => void;
}

export const FooterBar: React.FC<FooterBarProps> = ({
  currentPage,
  totalPages,
  wordCount,
  charCount,
  onPreviousPage,
  onNextPage,
}) => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-10">
      <div className="flex items-center justify-between">
        {/* Left: Page Navigation */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onPreviousPage}
            disabled={currentPage <= 1}
            className="inline-flex items-center gap-1 px-2 py-1 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Previous Page"
          >
            <ChevronLeft size={16} />
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            onClick={onNextPage}
            disabled={currentPage >= totalPages}
            className="inline-flex items-center gap-1 px-2 py-1 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Next Page"
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Right: Stats */}
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>{wordCount} words</span>
          <span>{charCount} characters</span>
        </div>
      </div>
    </footer>
  );
};