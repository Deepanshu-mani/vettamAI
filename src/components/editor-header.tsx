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
  onExport,
  onPrint,
  onPageBreak,
}) => {
  return (
    <header className="w-full sticky top-0 z-20">
      <div className=" mx-auto px-2 py-3">
        <div className="rounded-xl  bg-white/60 backdrop-blur border border-gray-200 shadow-sm px-3 py-2">
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
