 

interface FooterBarProps {
  currentPage: number
  totalPages: number
  wordCount: number
  charCount: number
  sidebarVisible?: boolean
}

export const FooterBar: React.FC<FooterBarProps> = ({ currentPage, totalPages, wordCount, charCount, sidebarVisible }) => {
  return (
    <footer
      className="fixed bottom-0 left-0 bg-white border-t border-gray-200 px-4 py-2 z-10"
      style={{ right: sidebarVisible ? 350 : 0 }}
    >
      <div className="flex items-center justify-between">
        {/* Left: Page Info */}
        <div className="text-sm text-gray-600">Page {currentPage} of {totalPages}</div>

        {/* Right: Stats */}
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>{wordCount} words</span>
          <span>{charCount} characters</span>
        </div>
      </div>
    </footer>
  )
}
