
import React from "react"
import { FileDown, Printer, Plus } from "lucide-react"

interface EditorActionsProps {
  onExport: () => void
  onPrint: () => void
  onPageBreak: () => void
}

export const EditorActions: React.FC<EditorActionsProps> = ({
  onExport,
  onPrint,
  onPageBreak,
}) => {
  const ActionButton: React.FC<{
    onClick: () => void
    title: string
    icon: React.ReactNode
    label: string
    variant?: 'default' | 'primary'
  }> = ({ onClick, title, icon, label, variant = 'default' }) => (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-md transition-all font-medium text-sm ${
        variant === 'primary' 
          ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm' 
          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 hover:border-gray-400 shadow-sm'
      }`}
      title={title}
      aria-label={title}
      type="button"
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  )

  return (
    <div className="flex items-center gap-3">
      <ActionButton
        onClick={onExport}
        title="Export as HTML"
        icon={<FileDown size={16} />}
        label="Export"
      />
      <ActionButton
        onClick={onPrint}
        title="Print"
        icon={<Printer size={16} />}
        label="Print"
        variant="primary"
      />
      <ActionButton
        onClick={onPageBreak}
        title="Insert Page Break"
        icon={<Plus size={16} />}
        label="Page Break"
      />
    </div>
  )
}
