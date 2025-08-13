# VettamAI - Paginated Document Editor

A React + Tiptap-based document editor with advanced pagination, page breaks, and per-page header/footer support. Built for creating print-ready documents with precise A4 page boundaries.

## ✨ Features

### Core Editor
- **Rich Text Editing**: Full-featured Tiptap editor with formatting, tables, images, and more
- **A4 Page Simulation**: Visual page boundaries with accurate dimensions (210mm × 297mm)
- **Real-time Pagination**: Automatic content splitting across pages
- **Zoom Controls**: 30% to 200% zoom with reset functionality

### Pagination & Layout
- **Visual Page Boundaries**: Clear A4 page containers with margin guides
- **Automatic Page Breaks**: Content automatically flows to new pages
- **Manual Page Breaks**: Insert page breaks with `Ctrl/Cmd + Enter`
- **Page Navigation**: Jump between pages with preview thumbnails

### Headers & Footers
- **Per-Page Headers/Footers**: Customizable content for each page
- **Dynamic Variables**: Use `{pageNumber}` and `{totalPages}` placeholders
- **Alignment Options**: Left, center, or right alignment
- **Print/Export Ready**: Headers and footers survive document export

### Document Management
- **Export to HTML**: Clean HTML export with preserved formatting
- **Print Support**: Print-optimized CSS with proper page breaks
- **Document Preview**: Sidebar with page thumbnails and outline
- **Search & Navigation**: Find text and jump to specific locations

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
```bash
git clone <repository-url>
cd VettamAI
npm install
npm run dev
```

### Build for Production
```bash
npm run build
npm run preview
```

## 🏗️ Architecture

### Single Editor + Programmatic Pagination
This project uses a **hybrid approach** that combines the best of both worlds:

1. **Single Tiptap Instance**: One active editor for seamless editing experience
2. **HTML Slicing**: Content is measured and split into page-sized chunks
3. **Preview Rendering**: Additional pages are rendered as read-only HTML previews

### Why This Approach?

**Advantages:**
- ✅ **Seamless Editing**: No content jumping between editor instances
- ✅ **Performance**: Single editor instance, lightweight preview rendering
- ✅ **Consistency**: All content uses the same editor state and formatting
- ✅ **Print/Export Ready**: Clean HTML output with proper page structure

### Editing Behavior
Currently, only the first page is rendered as a fully editable Tiptap instance. Subsequent pages are displayed as read-only previews generated from the live editor’s content. This design keeps performance high and ensures consistent formatting.

In the future, this could be extended to allow multi-page live editing, enabling direct editing across all pages without leaving the paginated view.

**Trade-offs:**
- ⚠️ **Complex Pagination Logic**: Requires custom content measurement and splitting
- ⚠️ **Limited Cross-Page Editing**: Can't edit content across page boundaries
- ⚠️ **Content Reflow**: Adding/removing content requires re-pagination

## 🔧 Technical Implementation

### Core Components

- **`Editor.tsx`**: Main editor container with state management
- **`PaginatedEditor.tsx`**: Handles content measurement and page splitting
- **`PageContainer.tsx`**: Individual page rendering with headers/footers
- **`CollapsibleSidebar.tsx`**: Document navigation and preview
- **`DocumentSearch.tsx`**: Full-text search with highlighting

### Pagination Algorithm

```typescript
// Simplified version of the pagination logic
const updatePagination = () => {
  const tempContainer = document.createElement("div")
  tempContainer.style.width = `${A4_WIDTH_PX * zoom}px`
  tempContainer.innerHTML = editor.getHTML()
  
  const contentHeight = getContentHeight() * zoom
  const newPages: string[] = []
  let currentPageContent = ""
  let currentHeight = 0
  
  // Split content by height into pages
  for (const child of tempContainer.children) {
    const childHeight = (child as HTMLElement).offsetHeight
    
    if (currentHeight + childHeight > contentHeight) {
      newPages.push(currentPageContent)
      currentPageContent = child.outerHTML
      currentHeight = childHeight
    } else {
      currentPageContent += child.outerHTML
      currentHeight += childHeight
    }
  }
  
  if (currentPageContent) {
    newPages.push(currentPageContent)
  }
  
  setPages(newPages)
}
```

### Page Break Handling

- **Automatic**: Content flows naturally when it exceeds page height
- **Manual**: Insert page breaks with keyboard shortcut or toolbar button
- **Drag & Drop**: Delete page breaks by dragging to trash bin

## 🎯 Production Considerations

### Performance Optimizations
- **Debounced Pagination**: Updates are throttled to prevent excessive re-renders
- **Virtual Scrolling**: For very long documents, implement virtual scrolling
- **Lazy Loading**: Load page previews on-demand
- **Memoization**: Cache pagination results and editor state

### Scalability Improvements
- **Web Workers**: Move pagination logic to background threads
- **Incremental Updates**: Only re-paginate changed sections
- **Streaming**: Handle documents with hundreds of pages
- **Caching**: Store pagination results in IndexedDB

### User Experience Enhancements
- **Undo/Redo**: Track pagination changes in editor history
- **Auto-save**: Save document state and pagination
- **Collaboration**: Real-time editing with conflict resolution
- **Version Control**: Track document versions and changes

### Browser Compatibility
- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+
- **Mobile Support**: Responsive design for tablets and phones
- **Progressive Web App**: Offline support and app-like experience

## 🧪 Testing

### Unit Tests
```bash
npm run test
```

### E2E Tests
```bash
npm run test:e2e
```

### Performance Testing
- **Large Documents**: Test with 100+ page documents
- **Memory Usage**: Monitor memory consumption during editing
- **Rendering Performance**: Measure pagination update times

## 📚 API Reference

### Editor Props
```typescript
interface EditorProps {
  content?: string
  onUpdate?: (content: string) => void
  onPageCountChange?: (count: number) => void
}
```

### Page Container Props
```typescript
interface PageContainerProps {
  pageNumber: number
  totalPages: number
  headerContent: string
  footerContent: string
  headerEnabled: boolean
  footerEnabled: boolean
  headerAlign: "start" | "center" | "end"
  footerAlign: "start" | "center" | "end"
  zoom: number
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Tiptap**: The excellent editor framework that makes this possible
- **React**: For the robust component architecture
- **Tailwind CSS**: For the beautiful, utility-first styling
- **Lucide Icons**: For the clean, consistent iconography

---

**Built with ❤️ for creating beautiful, print-ready documents**
