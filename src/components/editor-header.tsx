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
    <header className="w-full sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left: Document title */}
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-gray-900">Document</h1>
          </div>

          {/* Center: Toolbar */}
          <div className="flex-1 max-w-4xl mx-6">
            <Toolbar editor={editor} />
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-4 text-sm text-gray-500">
              <span>Words: {wordCount}</span>
              <span>Pages: {pageCount}</span>
            </div>
            <EditorActions
              onExport={onExport}
              onPrint={onPrint}
              onPageBreak={onPageBreak}
            />
          </div>
        </div>
        <div className="mt-3 md:hidden">
          <div className="grid grid-cols-[auto,1fr,auto] items-center gap-3">
            {/* Center: Toolbar (wraps to two lines if needed) */}
            <div className="flex justify-center">
              <div className="w-full">
                <Toolbar editor={editor} />
              </div>
            </div>

            <div className="w-px h-6 bg-gray-300 mx-2"></div>

            {/* Right: Actions */}
            <div className="justify-self-end">
              <EditorActions
                onExport={onExport}
                onPrint={onPrint}
                onPageBreak={onPageBreak}
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
