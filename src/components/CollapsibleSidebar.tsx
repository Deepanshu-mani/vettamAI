import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Image, List, Search } from 'lucide-react';
import { DocumentIndex } from './DocumentIndex';
import { DocumentSearch } from './DocumentSearch';

interface CollapsibleSidebarProps {
  isVisible: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  editorElement: HTMLElement | null;
  onHeadingClick: (element: HTMLElement) => void;
  onSearchResultClick: (element: HTMLElement) => void;
}

export const CollapsibleSidebar: React.FC<CollapsibleSidebarProps> = ({
  isVisible,
  onToggle,
  children,
  editorElement,
  onHeadingClick,
  onSearchResultClick,
}) => {
  const [activeTab, setActiveTab] = useState<'thumbnail' | 'index' | 'search'>('thumbnail');

  const tabClass = (isActive: boolean) =>
    `flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
      isActive
        ? 'bg-blue-100 text-blue-700'
        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
    }`;

  return (
    <>
      {/* Toggle Button */}
      <button
        type="button"
        onClick={onToggle}
        className="fixed right-4 top-1/2 -translate-y-1/2 z-30 bg-white border border-gray-200 rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors"
        title={isVisible ? 'Hide sidebar' : 'Show sidebar'}
      >
        {isVisible ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed right-0 top-0 h-full w-[300px] bg-white border-l border-gray-200 shadow-lg transform transition-transform duration-300 ease-in-out z-20 ${
          isVisible ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Sidebar Tabs */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setActiveTab('thumbnail')}
                className={tabClass(activeTab === 'thumbnail')}
              >
                <Image size={16} />
                <span className="hidden sm:inline">Thumbnail</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('index')}
                className={tabClass(activeTab === 'index')}
              >
                <List size={16} />
                <span className="hidden sm:inline">Index</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('search')}
                className={tabClass(activeTab === 'search')}
              >
                <Search size={16} />
                <span className="hidden sm:inline">Search</span>
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-auto">
            {activeTab === 'thumbnail' && (
              <div className="p-4">
                {children}
              </div>
            )}
            {activeTab === 'index' && (
              <DocumentIndex
                editorElement={editorElement}
                onHeadingClick={onHeadingClick}
              />
            )}
            {activeTab === 'search' && (
              <DocumentSearch
                editorElement={editorElement}
                onResultClick={onSearchResultClick}
              />
            )}
          </div>
        </div>
      </aside>
    </>
  );
};