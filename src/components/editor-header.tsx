import React from "react";
import type { Editor as TiptapEditor } from "@tiptap/react";
import { Toolbar } from "./Toolbar";
import { EditorActions } from "./editor-actions";

interface EditorHeaderProps {
  editor: TiptapEditor | null;
  wordCount: number;
  charCount: number;
  pageCount: number;
  onExport: () => void;
  onPrint: () => void;
  onPageBreak: () => void;
}

export const EditorHeader: React.FC<EditorHeaderProps> = ({
  editor,
  wordCount,
  charCount,
  pageCount,
  onExport,
  onPrint,
  onPageBreak,
}) => {
  return (
    <header className="w-full sticky top-0 z-20 bg-white border-b border-gray-300 shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Document title */}
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900">Legal Document Editor</h1>
            <div className="hidden sm:block w-px h-6 bg-gray-300"></div>
            <div className="hidden sm:flex items-center gap-3 text-sm text-gray-600">
              <span className="font-medium">{wordCount} words</span>
              <span>•</span>
              <span className="font-medium">{pageCount} {pageCount === 1 ? 'page' : 'pages'}</span>
            </div>
          </div>

          {/* Center: Toolbar */}
          <div className="flex-1 max-w-5xl mx-8">
            <Toolbar editor={editor} />
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-4">
            <EditorActions
              onExport={onExport}
              onPrint={onPrint}
              onPageBreak={onPageBreak}
            />
          </div>
        </div>
        
        {/* Mobile layout */}
        <div className="mt-4 lg:hidden">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <span className="font-medium">{wordCount} words</span>
                <span>•</span>
                <span className="font-medium">{pageCount} {pageCount === 1 ? 'page' : 'pages'}</span>
              </div>
              <EditorActions
                onExport={onExport}
                onPrint={onPrint}
                onPageBreak={onPageBreak}
              />
            </div>
            <Toolbar editor={editor} />
          </div>
        </div>
      </div>
    </header>
  );
};
