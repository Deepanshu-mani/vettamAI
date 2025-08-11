import React, { forwardRef } from 'react';
import { EditableHeaderFooter } from './EditableHeaderFooter';

type Align = "start" | "center" | "end";

interface PageContainerProps {
  children: React.ReactNode;
  pageNumber: number;
  totalPages: number;
  headerContent: string;
  footerContent: string;
  headerEnabled: boolean;
  footerEnabled: boolean;
  headerAlign: Align;
  footerAlign: Align;
  onHeaderChange: (content: string) => void;
  onFooterChange: (content: string) => void;
  zoom: number;
  className?: string;
}

export const PageContainer = forwardRef<HTMLDivElement, PageContainerProps>(({
  children,
  pageNumber,
  totalPages,
  headerContent,
  footerContent,
  headerEnabled,
  footerEnabled,
  headerAlign,
  footerAlign,
  onHeaderChange,
  onFooterChange,
  zoom,
  className = "",
}, ref) => {
  const alignToClass = (align: Align) => {
    switch (align) {
      case 'start': return 'text-left';
      case 'end': return 'text-right';
      case 'center': return 'text-center';
      default: return 'text-center';
    }
  };

  return (
    <div
      ref={ref}
      className={`page-container bg-white shadow-lg mx-auto mb-6 ${className}`}
      style={{
        width: '210mm',
        minHeight: '297mm',
        transform: `scale(${zoom})`,
        transformOrigin: 'top center',
      }}
      data-page={pageNumber}
    >
      {/* Header */}
      {headerEnabled && (
        <div 
          className={`page-header px-8 pt-6 pb-2 border-b border-gray-100 ${alignToClass(headerAlign)}`}
          style={{ minHeight: '20mm' }}
        >
          <EditableHeaderFooter
            content={headerContent}
            onChange={onHeaderChange}
            align={headerAlign}
            placeholder="Enter header text..."
            className="text-gray-600"
          />
        </div>
      )}

      {/* Main Content */}
      <div 
        className="page-content px-8 py-4"
        style={{ 
          minHeight: headerEnabled && footerEnabled ? '237mm' : 
                     headerEnabled || footerEnabled ? '257mm' : '277mm'
        }}
      >
        {children}
      </div>

      {/* Footer */}
      {footerEnabled && (
        <div 
          className={`page-footer px-8 pt-2 pb-6 border-t border-gray-100 ${alignToClass(footerAlign)} relative`}
          style={{ minHeight: '20mm' }}
        >
          <EditableHeaderFooter
            content={footerContent}
            onChange={onFooterChange}
            align={footerAlign}
            placeholder="Enter footer text..."
            className="text-gray-600"
          />
          
          {/* Page Number */}
          <div className="absolute bottom-2 right-8 text-xs text-gray-500">
            Page {pageNumber} of {totalPages}
          </div>
        </div>
      )}
    </div>
  );
});