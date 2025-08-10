import React from 'react';

type Align = "start" | "center" | "end"

interface PagePreviewPaneProps {
  html: string;
  header: string;
  footer: string;
  headerEnabled: boolean;
  footerEnabled: boolean;
  headerAlign: Align;
  footerAlign: Align;
  showPageNumbers: boolean;
}

export const PagePreviewPane: React.FC<PagePreviewPaneProps> = ({
  html,
  header,
  footer,
  headerEnabled,
  footerEnabled,
  headerAlign,
  footerAlign,
  showPageNumbers,
}) => {
  const parts = html.split(/<div[^>]*data-type="page-break"[^>]*><\/div>/gi);
  const totalPages = parts.length > 0 ? parts.length : 1;

  const alignToClass = (align: Align) => {
    if (align === 'start') return 'text-left';
    if (align === 'end') return 'text-right';
    return 'text-center';
  };

  return (
    <aside className="w-80 bg-gray-100 border-l border-gray-300 overflow-y-auto p-4 hidden lg:block">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 text-center mb-4">Page Preview</h3>
        {(parts.length > 0 ? parts : ['<p></p>']).map((content, i) => (
          <div key={i} className="bg-white shadow-md rounded-lg p-2 border border-gray-200 aspect-[8.27/11.69] overflow-hidden">
            <div
              className="transform scale-[0.2] origin-top-left"
              style={{ width: '8.27in', height: '11.69in', backgroundColor: 'white', display: 'flex', flexDirection: 'column', position: 'relative' }}
            >
              {headerEnabled && (
                <div
                  className={`p-8 border-b border-gray-200 ${alignToClass(headerAlign)}`}
                  style={{ minHeight: '0.75in' }}
                  dangerouslySetInnerHTML={{ __html: header }}
                />
              )}
              <div
                className="p-8 flex-1 prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: content }}
              />
              {footerEnabled && (
                <div
                  className={`p-8 border-t border-gray-200 mt-auto ${alignToClass(footerAlign)}`}
                  style={{ minHeight: '0.75in' }}
                  dangerouslySetInnerHTML={{ __html: footer }}
                />
              )}
              {showPageNumbers && (
                <div className="absolute right-8 bottom-4 text-xs text-gray-500">
                  Page {i + 1} of {totalPages}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default PagePreviewPane;
