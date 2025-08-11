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
import { AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

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

  const [headerHtml, setHeaderHtml] = useState("<div>Header</div>");
  const [footerHtml, setFooterHtml] = useState("<div>Footer</div>");

  const { setOnDropDelete } = useContext(TrashContext);

  const pageShellRef = useRef<HTMLDivElement | null>(null);
  const pageInnerRef = useRef<HTMLDivElement | null>(null);

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
      const estimatedPages = Math.max(1, Math.ceil(words / 350));
      setPageCount(estimatedPages);
      debouncedRepaginateRef.current();
    },
    editorProps: {
      attributes: {
        class: "ProseMirror-content mx-auto focus:outline-none max-w-none",
      },
    },
  });

  // Keep current HTML for preview
  const currentHtml = useMemo(() => editor?.getHTML() ?? "", [editor?.state])

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

  // Simple debounce
  const debounce = (fn: () => void, delay = 150) => {
    let t: number | undefined;
    return () => {
      if (t) window.clearTimeout(t);
      t = window.setTimeout(fn, delay);
    };
  };

  const isPaginatingRef = useRef(false);
  const debouncedRepaginateRef = useRef<() => void>(() => {});

  const repaginate = useCallback(() => {
    if (!editor || !pageInnerRef.current) return;
    if (isPaginatingRef.current) return;
    isPaginatingRef.current = true;

    const view = editor.view;
    const root = view.dom as HTMLElement;

    const pxPerInch = 96;
    const pageHeightPx = Math.round(11.69 * pxPerInch) - 64; // p-8 top and bottom

    // Remove existing auto page breaks
    editor.commands.command(({ state, tr }) => {
      const type = state.schema.nodes["pageBreak"];
      let removed = false;
      state.doc.descendants((node, pos) => {
        if (node.type === type && node.attrs?.auto) {
          tr.delete(pos, pos + node.nodeSize);
          removed = true;
        }
      });
      if (removed) {
        tr.setMeta("addToHistory", false);
        view.dispatch(tr);
      }
      return true;
    });

    // Measure blocks and insert auto breaks
    const children = Array.from(root.children) as HTMLElement[];
    let acc = 0;
    const toInsert: { pos: number }[] = [];

    for (const el of children) {
      if (el.getAttribute("data-type") === "page-break") {
        acc = 0;
        continue;
      }

      const h = el.offsetHeight;
      if (acc + h > pageHeightPx) {
        try {
          const pos = (view as any).posAtDOM(el, 0);
          toInsert.push({ pos });
          acc = h;
        } catch {
          acc += h;
        }
      } else {
        acc += h;
      }
    }

    if (toInsert.length) {
      for (let i = toInsert.length - 1; i >= 0; i--) {
        const { pos } = toInsert[i];
        editor.commands.insertContentAt(
          pos,
          { type: "pageBreak", attrs: { auto: true } },
          { updateSelection: false }
        );
      }
    }

    isPaginatingRef.current = false;
  }, [editor]);

  useEffect(() => {
    debouncedRepaginateRef.current = debounce(repaginate, 200);
  }, [repaginate]);

  useEffect(() => {
    if (!editor) return;
    repaginate();
    const onResize = () => debouncedRepaginateRef.current();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [editor, repaginate]);

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    if (!editor) return;

    const html = editor.getHTML();
    const parts = html.split(/<div[^>]*data-type="page-break"[^>]*><\/div>/gi);
    const total = parts.length;

    const alignToStyle = (a: Align) =>
      a === "start" ? "text-align:left" : a === "end" ? "text-align:right" : "text-align:center"

    const pageHtml = parts
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
            :root { --page-w: 8.27in; --page-h: 11.69in; }
            body { font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; color: #333; background: #f3f4f6; }
            .page { width: var(--page-w); min-height: var(--page-h); margin: 0 auto 1rem; background: white; box-shadow: 0 0 10px rgba(0,0,0,0.1); position: relative; display: flex; flex-direction: column; }
            .page-header, .page-footer { padding: 0.5in 1in; color: #6b7280; }
            .page-header { min-height: 0.6in; display: flex; align-items: center; }
            .page-footer { min-height: 0.6in; display: flex; align-items: center; }
            .page-body { padding: 0 1in; flex: 1; }
            .page-num { position: absolute; right: 0.6in; bottom: 0.35in; color: #6b7280; font-size: 10pt; }
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
    if (pageShellRef.current) {
      const container = pageShellRef.current.parentElement;
      if (container) {
        const containerWidth = container.clientWidth - 64; // Account for padding
        const pageWidth = 8.27 * 96; // 8.27 inches * 96 DPI
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

  if (!editor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading editor...</div>
      </div>
    );
  }

    <button
      type="button"
      onClick={() => set(value)}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-sm ${
        current === value ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-900 border-gray-200 hover:bg-gray-100"
      }`}
      title={label}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>

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
            <div className="container mx-auto py-6 px-4">
              {/* Ruler */}
              {showRuler && (
                <div className="mb-4 h-6 bg-white border border-gray-200 rounded relative overflow-hidden">
                  <div className="absolute inset-0 flex">
                    {Array.from({ length: 20 }, (_, i) => (
                      <div key={i} className="flex-1 border-r border-gray-200 relative">
                        <div className="absolute top-0 left-0 text-xs text-gray-400 px-1">
                          {i + 1}"
                        </div>
                        <div className="absolute bottom-0 left-1/2 w-px h-2 bg-gray-300"></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div
                ref={pageShellRef}
                className="mx-auto bg-white shadow-2xl rounded-lg overflow-visible transition-transform"
                style={{
                  width: "8.27in",
                  minHeight: "11.69in",
                  boxSizing: "border-box",
                  transform: `scale(${zoom})`,
                  transformOrigin: "top center",
                }}
              >
                {/* In-canvas header */}
                {headerEnabled && (
                  <div
                    className={`px-8 pt-6 pb-2 text-sm text-gray-500 ${
                      headerAlign === "start" ? "text-left" : headerAlign === "end" ? "text-right" : "text-center"
                    }`}
                    style={{ minHeight: "0.6in" }}
                    dangerouslySetInnerHTML={{ __html: headerHtml }}
                  />
                )}

                <div ref={pageInnerRef} className="p-8">
                  <EditorContent
                    editor={editor}
                    className="min-h-[9in] focus-within:outline-none"
                  />
                </div>

                {/* In-canvas footer */}
                {footerEnabled && (
                  <div
                    className={`relative px-8 pt-2 pb-6 text-sm text-gray-500 ${
                      footerAlign === "start" ? "text-left" : footerAlign === "end" ? "text-right" : "text-center"
                    }`}
                    style={{ minHeight: "0.6in" }}
                  >
                    <div dangerouslySetInnerHTML={{ __html: footerHtml }} />
                    {showPageNumbers && (
                      <div className="absolute right-8 bottom-2 text-gray-500 text-[10pt]">
                        Page 1
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </main>

        </div>

        {/* Collapsible Sidebar */}
        <CollapsibleSidebar
          isVisible={sidebarVisible}
          onToggle={() => setSidebarVisible(!sidebarVisible)}
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
          />
        </CollapsibleSidebar>
      </div>

      {/* Bottom trash drop target shown during drag */}
      <TrashBin />

      {/* Print Styles and editor visuals */}
      <style>{`
        /* Footer bar spacing */}+        body {
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
          @page { size: A4; margin: 0.5in; }
          .page-break { page-break-before: always; break-before: page; }
        }

        .ProseMirror { outline: none; line-height: 1.6; }
        .ProseMirror p { margin: 1em 0; }

        /* Headings: professional sizing (inline TextStyle font-size overrides) */
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

        /* Task list styling (center checkbox) */
        .ProseMirror .task-list { list-style: none; padding-left: 0; margin: 0.5rem 0; }
        .ProseMirror .task-list li { display: flex; align-items: center; gap: 0.5rem; margin: 0.35rem 0; }
        .ProseMirror .task-list input[type="checkbox"] {
          margin: 0; vertical-align: middle;
          width: 1rem; height: 1rem; accent-color: #111111;
        }

        /* Code block styles */
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

        /* Blockquote styles */
        .ProseMirror blockquote {
          border-left: 3px solid #d1d5db;
          margin: 1.5rem 0;
          padding-left: 1rem;
          font-style: italic;
        }

        /* Link styles */
        .ProseMirror a { color: #3b82f6; cursor: pointer; text-decoration: underline; }
        .ProseMirror a:hover { color: #1d4ed8; }

        /* Page break visual (in-editor) */
        .page-break { position: relative; }
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
