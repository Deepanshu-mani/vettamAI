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
import { TrashContext } from "../context/TextContext";
import { PagePreviewPane } from "./page-preview-pane";
import { AlignLeft, AlignCenter, AlignRight, Eye, EyeOff } from 'lucide-react';

type Align = "start" | "center" | "end"

export const Editor = (): ReactElement => {
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [pageCount, setPageCount] = useState(1);

  // Header/Footer and preview controls
  const [headerEnabled, setHeaderEnabled] = useState(true)
  const [footerEnabled, setFooterEnabled] = useState(true)
  const [headerAlign, setHeaderAlign] = useState<Align>("center")
  const [footerAlign, setFooterAlign] = useState<Align>("center")
  const [showPreview, setShowPreview] = useState(true)
  const [showPageNumbers, setShowPageNumbers] = useState(true)

  const [headerHtml, setHeaderHtml] = useState("Law Firm Document");
  const [footerHtml, setFooterHtml] = useState("Confidential & Privileged");

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
      <h1>Legal Document Template</h1>
      <p>This is a professional document editor designed for legal professionals. The editor provides comprehensive formatting tools and maintains proper document structure for legal documents.</p>
      <h2>Key Features</h2>
      <ul>
        <li>Professional page layout with headers and footers</li>
        <li>Automatic pagination for A4 format</li>
        <li>Print-ready output with proper margins</li>
        <li>Real-time preview with page thumbnails</li>
      </ul>
      <p>Use the toolbar above to format your document. Insert page breaks using <strong>Ctrl+Enter</strong> or the page break button in the toolbar.</p>
      <blockquote>
        <p>This editor maintains professional standards required for legal documentation while providing modern editing capabilities.</p>
      </blockquote>
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
    setOnDropDelete(() => (payload: { type: string; pos: number }) => {
      if (!payload) return
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
    const pageHeightPx = Math.round(11.69 * pxPerInch) - 128; // Account for header/footer

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
          ${showPageNumbers ? `<div class="page-num">Page ${i + 1} of ${total}</div>` : ""}
        </div>
      `)
      .join("");

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Legal Document</title>
          <meta charset="utf-8">
          <style>
            :root { --page-w: 8.27in; --page-h: 11.69in; }
            body { 
              font-family: 'Times New Roman', Times, serif; 
              line-height: 1.6; 
              margin: 0; 
              padding: 20px; 
              color: #000; 
              background: #f3f4f6; 
            }
            .page { 
              width: var(--page-w); 
              min-height: var(--page-h); 
              margin: 0 auto 1rem; 
              background: white; 
              box-shadow: 0 0 10px rgba(0,0,0,0.1); 
              position: relative; 
              display: flex; 
              flex-direction: column; 
            }
            .page-header, .page-footer { 
              padding: 0.75in 1in; 
              color: #333; 
              font-size: 11pt;
            }
            .page-header { 
              min-height: 0.75in; 
              display: flex; 
              align-items: center; 
              border-bottom: 1px solid #e5e7eb;
            }
            .page-footer { 
              min-height: 0.75in; 
              display: flex; 
              align-items: center; 
              border-top: 1px solid #e5e7eb;
              margin-top: auto;
            }
            .page-body { 
              padding: 0 1in; 
              flex: 1; 
              font-size: 12pt;
              line-height: 1.5;
            }
            .page-num { 
              position: absolute; 
              right: 1in; 
              bottom: 0.5in; 
              color: #666; 
              font-size: 10pt; 
            }
            @media print {
              body { padding: 0; background: white; }
              .page { 
                page-break-after: always; 
                box-shadow: none; 
                margin: 0; 
                width: 100%;
                min-height: 100vh;
              }
              .page:last-child { page-break-after: avoid; }
            }
            h1, h2, h3, h4, h5, h6 { 
              margin-top: 1.5em; 
              margin-bottom: 0.5em; 
              font-weight: bold;
            }
            h1 { font-size: 18pt; }
            h2 { font-size: 16pt; }
            h3 { font-size: 14pt; }
            p { margin: 1em 0; }
            ul, ol { margin: 1em 0; padding-left: 1.5em; }
            li { margin: 0.25em 0; }
            blockquote { 
              border-left: 4px solid #ccc; 
              padding-left: 1em; 
              margin: 1.5em 0; 
              font-style: italic; 
            }
            table { 
              border-collapse: collapse; 
              width: 100%; 
              margin: 1em 0; 
            }
            th, td { 
              border: 1px solid #333; 
              padding: 0.5em; 
              text-align: left; 
            }
            th { background: #f5f5f5; font-weight: bold; }
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
    a.download = "legal-document.html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleInsertPageBreak = () => {
    if (!editor) return;
    editor.chain().focus().setPageBreak().run();
  };

  if (!editor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg text-gray-600">Loading document editor...</div>
      </div>
    );
  }

  const alignBtn = (current: Align, value: Align, set: (a: Align) => void, label: string, icon: JSX.Element) => (
    <button
      type="button"
      onClick={() => set(value)}
      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-md border text-sm font-medium transition-all ${
        current === value 
          ? "bg-blue-600 text-white border-blue-600 shadow-sm" 
          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400"
      }`}
      title={label}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <EditorHeader
        editor={editor}
        wordCount={wordCount}
        charCount={charCount}
        pageCount={pageCount}
        onExport={handleExport}
        onPrint={handlePrint}
        onPageBreak={handleInsertPageBreak}
      />

      <div className="flex-1 overflow-hidden bg-gray-50">
        <div className="h-full flex">
          {/* Main editor area */}
          <main className="flex-1 overflow-auto">
            <div className="max-w-5xl mx-auto py-8 px-4">
              {/* Professional Header/Footer controls */}
              <div className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Document Settings</h3>
                
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-4">
                    <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
                      <input
                        type="checkbox"
                        checked={headerEnabled}
                        onChange={(e) => setHeaderEnabled(e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
                      />
                      Document Header
                    </label>
                    <div className="flex items-center gap-2">
                      {alignBtn(headerAlign, "start", setHeaderAlign, "Left", <AlignLeft size={16} />)}
                      {alignBtn(headerAlign, "center", setHeaderAlign, "Center", <AlignCenter size={16} />)}
                      {alignBtn(headerAlign, "end", setHeaderAlign, "Right", <AlignRight size={16} />)}
                    </div>
                    <input
                      value={headerHtml}
                      onChange={(e) => setHeaderHtml(e.target.value)}
                      className="flex-1 min-w-[300px] rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Enter header text"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
                      <input
                        type="checkbox"
                        checked={footerEnabled}
                        onChange={(e) => setFooterEnabled(e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
                      />
                      Document Footer
                    </label>
                    <div className="flex items-center gap-2">
                      {alignBtn(footerAlign, "start", setFooterAlign, "Left", <AlignLeft size={16} />)}
                      {alignBtn(footerAlign, "center", setFooterAlign, "Center", <AlignCenter size={16} />)}
                      {alignBtn(footerAlign, "end", setFooterAlign, "Right", <AlignRight size={16} />)}
                    </div>
                    <input
                      value={footerHtml}
                      onChange={(e) => setFooterHtml(e.target.value)}
                      className="flex-1 min-w-[300px] rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Enter footer text"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => setShowPreview((p) => !p)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                      title={showPreview ? "Hide preview" : "Show preview"}
                    >
                      {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
                      {showPreview ? "Hide Preview" : "Show Preview"}
                    </button>
                    <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
                      <input
                        type="checkbox"
                        checked={showPageNumbers}
                        onChange={(e) => setShowPageNumbers(e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
                      />
                      Show Page Numbers
                    </label>
                  </div>
                </div>
              </div>

              {/* Professional Document Page */}
              <div
                ref={pageShellRef}
                className="mx-auto bg-white shadow-xl rounded-lg overflow-visible border border-gray-300"
                style={{
                  width: "8.27in",
                  minHeight: "11.69in",
                  boxSizing: "border-box",
                }}
              >
                {/* Professional Header */}
                {headerEnabled && (
                  <div
                    className={`px-8 pt-8 pb-4 text-sm text-gray-800 border-b border-gray-200 bg-gray-50 ${
                      headerAlign === "start" ? "text-left" : headerAlign === "end" ? "text-right" : "text-center"
                    }`}
                    style={{ minHeight: "0.75in" }}
                  >
                    <div className="font-medium" dangerouslySetInnerHTML={{ __html: headerHtml }} />
                  </div>
                )}

                <div ref={pageInnerRef} className="p-8" style={{ minHeight: "9.5in" }}>
                  <EditorContent
                    editor={editor}
                    className="min-h-[8.5in] focus-within:outline-none prose prose-lg max-w-none"
                  />
                </div>

                {/* Professional Footer */}
                {footerEnabled && (
                  <div
                    className={`relative px-8 pt-4 pb-8 text-sm text-gray-800 border-t border-gray-200 bg-gray-50 ${
                      footerAlign === "start" ? "text-left" : footerAlign === "end" ? "text-right" : "text-center"
                    }`}
                    style={{ minHeight: "0.75in" }}
                  >
                    <div className="font-medium" dangerouslySetInnerHTML={{ __html: footerHtml }} />
                    {showPageNumbers && (
                      <div className="absolute right-8 bottom-4 text-gray-600 text-xs font-medium">
                        Page 1
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </main>

          {/* Enhanced Preview Pane */}
          {showPreview && (
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
          )}
        </div>
      </div>

      {/* Trash bin for drag operations */}
      <TrashBin />

      {/* Professional Print Styles */}
      <style>{`
        @media print {
          * { -webkit-print-color-adjust: exact !important; color-adjust: exact !important; }
          body { margin: 0; padding: 0; background: white !important; }
          .min-h-screen, header, .sticky, .fixed, aside, .shadow-xl, .shadow-lg { display: none !important; }
          
          .mx-auto.bg-white {
            display: block !important;
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            background: white !important;
          }
          
          .page-break { 
            page-break-before: always !important; 
            break-before: page !important; 
            display: block !important;
            height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          
          @page { 
            size: A4; 
            margin: 0.75in 1in; 
          }
        }

        /* Professional Editor Styles */
        .ProseMirror { 
          outline: none; 
          line-height: 1.6; 
          font-family: 'Times New Roman', Times, serif;
          font-size: 12pt;
          color: #1a1a1a;
        }
        
        .ProseMirror p { margin: 1em 0; }
        .ProseMirror h1 { font-size: 18pt; line-height: 1.3; margin: 1.5em 0 0.5em; font-weight: bold; }
        .ProseMirror h2 { font-size: 16pt; line-height: 1.3; margin: 1.4em 0 0.5em; font-weight: bold; }
        .ProseMirror h3 { font-size: 14pt; line-height: 1.3; margin: 1.3em 0 0.5em; font-weight: bold; }
        .ProseMirror h4 { font-size: 13pt; line-height: 1.3; margin: 1.2em 0 0.5em; font-weight: bold; }
        .ProseMirror h5 { font-size: 12pt; line-height: 1.3; margin: 1.1em 0 0.5em; font-weight: bold; }
        .ProseMirror h6 { font-size: 11pt; line-height: 1.3; margin: 1em 0 0.5em; font-weight: bold; }

        .ProseMirror ul { list-style: disc outside; padding-left: 1.5em; margin: 0.5em 0; }
        .ProseMirror ol { list-style: decimal outside; padding-left: 1.5em; margin: 0.5em 0; }
        .ProseMirror li { margin: 0.25em 0; }

        .ProseMirror .task-list { list-style: none; padding-left: 0; margin: 0.5em 0; }
        .ProseMirror .task-list li { display: flex; align-items: center; gap: 0.5em; margin: 0.35em 0; }
        .ProseMirror .task-list input[type="checkbox"] {
          margin: 0; vertical-align: middle;
          width: 1em; height: 1em; accent-color: #2563eb;
        }

        .ProseMirror pre {
          background: #f8f9fa;
          border: 1px solid #e9ecef;
          border-radius: 0.25em;
          color: #212529;
          font-family: 'Courier New', Courier, monospace;
          margin: 1.5em 0;
          padding: 1em;
          white-space: pre-wrap;
          overflow-x: auto;
        }

        .ProseMirror blockquote {
          border-left: 3px solid #dee2e6;
          margin: 1.5em 0;
          padding-left: 1em;
          font-style: italic;
          color: #6c757d;
        }

        .ProseMirror a { 
          color: #0066cc; 
          cursor: pointer; 
          text-decoration: underline; 
        }
        .ProseMirror a:hover { color: #004499; }

        .page-break { 
          position: relative; 
          margin: 2em 0;
          border-top: 2px dashed #cbd5e1;
          padding-top: 1em;
        }
        
        .page-break::before {
          content: "Page Break";
          position: absolute;
          top: -0.75em;
          left: 50%;
          transform: translateX(-50%);
          background: white;
          padding: 0 0.5em;
          font-size: 0.75em;
          color: #64748b;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
};