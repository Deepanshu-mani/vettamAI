import React from 'react';

interface PageProps {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  pageNumber?: number;
  totalPages?: number;
}

export const Page: React.FC<PageProps> = ({ header, footer, children, pageNumber, totalPages }) => {
  return (
    <div
      className="bg-white shadow-lg my-4"
      style={{
        width: '8.27in',
        height: '11.69in',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      {header && (
        <div className="p-8 border-b border-gray-200" style={{ minHeight: '0.75in' }}>
          {header}
        </div>
      )}
      <div className="p-8 flex-1 overflow-hidden">
        {children}
      </div>
      {footer && (
        <div className="p-8 border-t border-gray-200 mt-auto" style={{ minHeight: '0.75in' }}>
          {footer}
        </div>
      )}
      {pageNumber && totalPages && (
        <div className="absolute right-8 bottom-4 text-sm text-gray-500">
          Page {pageNumber} of {totalPages}
        </div>
      )}
    </div>
  );
};
