import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { JSX } from "react";
import type { ReactElement } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TextAlign } from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableCell } from "@tiptap/extension-table-cell";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import FontFamily from "@tiptap/extension-font-family";
import CodeBlock from "@tiptap/extension-code-block";
import Blockquote from "@tiptap/extension-blockquote";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { PageBreak } from "../extension/PageBreak";
import { EditorHeader } from "./editor-header";
import { TrashBin } from "./trash-bin";
import { CollapsibleSidebar } from "./CollapsibleSidebar";
import { FooterBar } from "./FooterBar";
import { TrashContext } from "../context/TextContext";
import { PagePreviewPane } from "./page-preview-pane";
import { PageContainer } from "./PageContainer";

type Align = "start" | "center" | "end"

export const Editor = (): ReactElement => {
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  // Header/Footer and preview controls
  const [headerEnabled, setHeaderEnabled] = useState(true)
  const [footerEnabled, setFooterEnabled] = useState(true)
  const [headerAlign, setHeaderAlign] = useState<Align>("center")
  const [footerAlign, setFooterAlign] = useState<Align>("center")
  const [showPageNumbers, setShowPageNumbers] = useState(true)
  
  // New UI state
  const [activeTab, setActiveTab] = useState<'text' | 'page'>('text')
  const [sidebarVisible, setSidebarVisible] = useState(true)
  const [showRuler, setShowRuler] = useState(false)
  const [zoom, setZoom] = useState(1)

  const [headerHtml, setHeaderHtml] = useState("<p>Document Header</p>");
  const [footerHtml, setFooterHtml] = useState("<p>Document Footer</p>");
  const [pages, setPages] = useState<string[]>([]);

  const { setOnDropDelete } = useContext(TrashContext);

  const editorContainerRef = useRef<HTMLDivElement | null>(null);
  const editorElementRef = useRef<HTMLElement | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 underline hover:text-blue-800",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-lg shadow-md",
        },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: "border-collapse border border-gray-300",
        },
      }),
      TableRow.configure({
        HTMLAttributes: {
          class: "border border-gray-300",
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: "border border-gray-300 bg-gray-100 font-bold p-2",
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: "border border-gray-300 p-2",
        },
      }),
      TaskList.configure({
        HTMLAttributes: { class: "task-list not-prose list-none pl-0 my-3 space-y-1" },
      }),
      TaskItem.configure({
        nested: true,
        HTMLAttributes: { class: "task-list-item flex items-center gap-2" },
      }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      FontFamily.configure({ types: ["textStyle"] }),
      CodeBlock.configure({
        HTMLAttributes: {
          class: "bg-gray-100 p-4 rounded-lg font-mono text-sm",
        },
      }),
      Blockquote.configure({
        HTMLAttributes: {
          class: "border-l-4 border-gray-300 pl-4 italic",
        },
      }),
      HorizontalRule.configure({
        HTMLAttributes: {
          class: "my-4 border-gray-300",
        },
      }),
      PageBreak,
    ],
    content: `
      <h1>Getting started</h1>
      <p>Welcome to the Simple Editor template! This template integrates open source UI components and Tiptap extensions licensed under MIT.</p>
      <p>Integrate it by following the <a href="https://tiptap.dev/docs/editor/getting-started/install">Tiptap UI Components docs</a> or using our CLI tool.</p>
      <blockquote>
        <p>A fully responsive rich text editor with built-in support for common formatting and layout tools. Type markdown ** or use keyboard shortcuts ⌘+B for most all common markdown marks. ✓</p>
      </blockquote>
      <ul>
        <li>Bullet list item</li>
        <li>Second item</li>
      </ul>
      <p>Add images, customize alignment, and apply <mark data-color="#fbbf24">advanced formatting</mark> to make your writing more engaging and professional.</p>
    `,
    onUpdate: ({ editor }) => {
      const text = editor.getText();
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      setWordCount(words);
      setCharCount(text.length);
      updatePages();
    },
    editorProps: {
      attributes: {
        class: "ProseMirror-content focus:outline-none max-w-none min-h-full",
      },
    },
  });

  // Update editor element ref when editor changes
  useEffect(() => {
    if (editor?.view?.dom) {
      editorElementRef.current = editor.view.dom as HTMLElement;
    }
  }, [editor]);

  // Keep current HTML for preview
  const currentHtml = useMemo(() => editor?.getHTML() ?? "", [editor?.state])

  // Update pages when content changes
  const updatePages = useCallback(() => {
    if (!editor) return;
    
    const html = editor.getHTML();
    const pageBreaks = html.split(/<div[^>]*data-type="page-break"[^>]*><\/div>/gi);
    setPages(pageBreaks);
    setPageCount(pageBreaks.length);
  }, [editor]);

  useEffect(() => {
    updatePages();
  }, [updatePages, editor?.state]);

  // Provide drag-to-trash deletion behavior
  useEffect(() => {
    if (!editor) return
    setOnDropDelete(() => (payload: { type: string; pos: number }) => {      if (!payload) return
      if (payload.type === 'page-break' && payload.pos >= 0) {
        editor.commands.command(
          ({
            tr,
            state,
          }: {
            tr: import('prosemirror-state').Transaction;
            state: import('prosemirror-state').EditorState;
          }) => {
            const from = payload.pos
            const node = state.doc.nodeAt(from)
            if (!node || node.type.name !== 'pageBreak') return false
            tr.delete(from, from + node.nodeSize)
            return true
          }
        )
      }
    })
    return () => setOnDropDelete(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor])

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    if (!editor) return;

    const html = editor.getHTML();
    const total = pages.length;

    const alignToStyle = (a: Align) =>
      a === "start" ? "text-align:left" : a === "end" ? "text-align:right" : "text-align:center"

    const pageHtml = pages
      .map((content, i) => `
        <div class="page">
          ${headerEnabled ? `<div class="page-header" style="${alignToStyle(headerAlign)}">${headerHtml}</div>` : ""}
          <div class="page-body">${content}</div>
          ${footerEnabled ? `<div class="page-footer" style="${alignToStyle(footerAlign)}">${footerHtml}</div>` : ""}
          <div class="page-num">Page ${i + 1} of ${total}</div>
        </div>
      `)
      .join("");

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Document Export</title>
          <meta charset="utf-8">
          <style>
            :root { --page-w: 210mm; --page-h: 297mm; }
            body { font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; color: #333; background: #f3f4f6; }
            .page { width: var(--page-w); min-height: var(--page-h); margin: 0 auto 1rem; background: white; box-shadow: 0 0 10px rgba(0,0,0,0.1); position: relative; display: flex; flex-direction: column; }
            .page-header, .page-footer { padding: 20mm 32mm; color: #6b7280; }
            .page-header { min-height: 20mm; display: flex; align-items: center; }
            .page-footer { min-height: 20mm; display: flex; align-items: center; }
            .page-body { padding: 0 32mm; flex: 1; }
            .page-num { position: absolute; right: 32mm; bottom: 8mm; color: #6b7280; font-size: 10pt; }
            @media print {
              body { padding: 0; background: white; }
              .page { page-break-after: always; box-shadow: none; margin: 0 auto; }
            }
            h1, h2, h3, h4, h5, h6 { margin-top: 1.5em; margin-bottom: 0.5em; }
            p { margin: 1em 0; }
            ul { list-style: disc; padding-left: 1.5rem; margin: 0.5rem 0; }
            ol { list-style: decimal; padding-left: 1.5rem; margin: 0.5rem 0; }
            li { margin: 0.25rem 0; }
            .task-list-item { list-style: none; }
            blockquote { border-left: 4px solid #e5e7eb; padding-left: 1rem; margin: 1.5em 0; font-style: italic; }
            code { background: #f3f4f6; padding: 0.2em 0.4em; border-radius: 0.25rem; font-size: 0.875em; }
            pre { background: #f3f4f6; padding: 1rem; border-radius: 0.5rem; overflow-x: auto; }
            table { border-collapse: collapse; width: 100%; margin: 1em 0; }
            th, td { border: 1px solid #d1d5db; padding: 0.5rem; text-align: left; }
            th { background: #f9fafb; font-weight: 600; }
            img { max-width: 100%; height: auto; border-radius: 0.5rem; }
          </style>
        </head>
        <body>
          ${pageHtml}
        </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "document.html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleInsertPageBreak = () => {
    if (!editor) return;
    editor.chain().focus().setPageBreak().run();
  };

  const handleFitToWidth = () => {
    // Calculate zoom to fit page width to container
    if (editorContainerRef.current) {
      const container = editorContainerRef.current;
      if (container) {
        const containerWidth = container.clientWidth - 64; // Account for padding
        const pageWidth = 210 * 3.78; // 210mm * 3.78 pixels per mm
        const newZoom = Math.min(1.5, containerWidth / pageWidth);
        setZoom(newZoom);
      }
    }
  };

  const handlePreviousPage = () => {
    setCurrentPage(Math.max(1, currentPage - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(Math.min(pageCount, currentPage + 1));
  };

  const handleHeadingClick = (element: HTMLElement) => {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleSearchResultClick = (element: HTMLElement) => {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handlePageClick = (pageIndex: number) => {
    const pageElements = document.querySelectorAll('.page-container');
    const targetPage = pageElements[pageIndex] as HTMLElement;
    if (targetPage) {
      targetPage.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (!editor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading editor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <EditorHeader
        editor={editor}
        wordCount={wordCount}
        charCount={charCount}
        pageCount={pageCount}
        activeTab={activeTab}
        headerEnabled={headerEnabled}
        footerEnabled={footerEnabled}
        headerAlign={headerAlign}
        footerAlign={footerAlign}
        showRuler={showRuler}
        zoom={zoom}
        onTabChange={setActiveTab}
        onHeaderToggle={setHeaderEnabled}
        onFooterToggle={setFooterEnabled}
        onHeaderAlignChange={setHeaderAlign}
        onFooterAlignChange={setFooterAlign}
        onRulerToggle={setShowRuler}
        onZoomChange={setZoom}
        onFitToWidth={handleFitToWidth}
        onExport={handleExport}
        onPrint={handlePrint}
        onPageBreak={handleInsertPageBreak}
      />

      <div className="flex-1 overflow-hidden bg-soft">
        <div className={`h-full transition-all duration-300 ${sidebarVisible ? 'mr-[300px]' : ''}`}>
          {/* Main editor area */}
          <main className="flex-1 overflow-auto">
            <div ref={editorContainerRef} className="container mx-auto py-6 px-4">
              {/* Ruler */}
              {showRuler && (
                <div 
                  className="mb-4 h-6 bg-white border border-gray-200 rounded relative overflow-hidden mx-auto"
                  style={{ 
                    width: `${210 * 3.78 * zoom}px`,
                    transform: `scale(${zoom})`,
                    transformOrigin: 'center top'
                  }}
                >
                  <div className="absolute inset-0 flex">
                    {Array.from({ length: 21 }, (_, i) => (
                      <div key={i} className="flex-1 border-r border-gray-200 relative">
                        <div className="absolute top-0 left-0 text-xs text-gray-400 px-1">
                          {i * 10}mm
                        </div>
                        <div className="absolute bottom-0 left-1/2 w-px h-2 bg-gray-300"></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pages */}
              <div className="space-y-0">
                {pages.map((pageContent, index) => (
                  <PageContainer
                    key={index}
                    pageNumber={index + 1}
                    totalPages={pages.length}
                    headerContent={headerHtml}
                    footerContent={footerHtml}
                    headerEnabled={headerEnabled}
                    footerEnabled={footerEnabled}
                    headerAlign={headerAlign}
                    footerAlign={footerAlign}
                    onHeaderChange={setHeaderHtml}
                    onFooterChange={setFooterHtml}
                    zoom={zoom}
                  >
                    {index === 0 && <EditorContent editor={editor} />}
                  </PageContainer>
                ))}
              </div>
            </div>
          </main>

        </div>

        {/* Collapsible Sidebar */}
        <CollapsibleSidebar
          isVisible={sidebarVisible}
          onToggle={() => setSidebarVisible(!sidebarVisible)}
          editorElement={editorElementRef.current}
          onHeadingClick={handleHeadingClick}
          onSearchResultClick={handleSearchResultClick}
        >
          <PagePreviewPane
            html={currentHtml}
            header={headerHtml}
            footer={footerHtml}
            headerEnabled={headerEnabled}
            footerEnabled={footerEnabled}
            headerAlign={headerAlign}
            footerAlign={footerAlign}
            showPageNumbers={showPageNumbers}
            onPageClick={handlePageClick}
          />
        </CollapsibleSidebar>
      </div>

      {/* Bottom trash drop target shown during drag */}
      <TrashBin />
<style>{`
  /* Footer bar spacing */
  body {
    padding-bottom: 60px;
  }

  /* Page shadow enhancement */
  .shadow-2xl {
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05);
  }

  @media print {
    body { margin: 0; padding: 0; }
    .container { padding: 0; }
    .fixed, header, aside { display: none !important; }
    .shadow-lg, .shadow-2xl { box-shadow: none !important; }
    @page { size: A4; margin: 20mm; }
    .page-break { page-break-before: always; break-before: page; }
  }

  .ProseMirror { outline: none; line-height: 1.6; }
  .ProseMirror p { margin: 1em 0; }

  /* Headings */
  .ProseMirror h1 { font-size: 2rem; line-height: 1.25; margin: 1.5rem 0 0.5rem; font-weight: 700; }
  .ProseMirror h2 { font-size: 1.75rem; line-height: 1.3; margin: 1.4rem 0 0.5rem; font-weight: 700; }
  .ProseMirror h3 { font-size: 1.5rem; line-height: 1.35; margin: 1.3rem 0 0.5rem; font-weight: 700; }
  .ProseMirror h4 { font-size: 1.25rem; line-height: 1.4; margin: 1.2rem 0 0.5rem; font-weight: 700; }
  .ProseMirror h5 { font-size: 1.125rem; line-height: 1.45; margin: 1.1rem 0 0.5rem; font-weight: 700; }
  .ProseMirror h6 { font-size: 1rem; line-height: 1.5; margin: 1rem 0 0.5rem; font-weight: 700; }

  /* Lists */
  .ProseMirror ul { list-style: disc outside; padding-left: 1.5rem; margin: 0.5rem 0; }
  .ProseMirror ol { list-style: decimal outside; padding-left: 1.5rem; margin: 0.5rem 0; }
  .ProseMirror li { margin: 0.25rem 0; }

  /* Task list */
  .ProseMirror .task-list { list-style: none; padding-left: 0; margin: 0.5rem 0; }
  .ProseMirror .task-list li { display: flex; align-items: center; gap: 0.5rem; margin: 0.35rem 0; }
  .ProseMirror .task-list input[type="checkbox"] {
    margin: 0; vertical-align: middle;
    width: 1rem; height: 1rem; accent-color: #111111;
  }

  /* Code block */
  .ProseMirror pre {
    background: #f6f8fa;
    border-radius: 0.5rem;
    color: #24292e;
    font-family: 'JetBrains Mono', 'Fira Code', Consolas, 'Courier New', monospace;
    margin: 1.5rem 0;
    padding: 0.75rem 1rem;
    white-space: pre;
    overflow-x: auto;
  }

  /* Blockquote */
  .ProseMirror blockquote {
    border-left: 3px solid #d1d5db;
    margin: 1.5rem 0;
    padding-left: 1rem;
    font-style: italic;
  }

  /* Links */
  .ProseMirror a { color: #3b82f6; cursor: pointer; text-decoration: underline; }
  .ProseMirror a:hover { color: #1d4ed8; }

  /* Page break */
  .page-break { position: relative; }

  /* Page container */
  .page-container {
    page-break-after: always;
    break-after: page;
  }

  /* A4 shadow */
  @media screen {
    .page-container {
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
                  0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
  }
`}</style>
      {/* Footer Bar */}
      <FooterBar
        currentPage={currentPage}
        totalPages={pageCount}
        wordCount={wordCount}
        charCount={charCount}
        onPreviousPage={handlePreviousPage}
        onNextPage={handleNextPage}
      />
    </div>
  );
};
