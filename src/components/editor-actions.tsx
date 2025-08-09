
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
  }> = ({ onClick, title, icon, label }) => (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-gray-100 transition-colors text-gray-700 hover:text-gray-900 border border-transparent hover:border-gray-200"
      title={title}
      aria-label={title}
      type="button"
    >
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </button>
  )

  return (
    <div className="flex items-center gap-2">
      <ActionButton
        onClick={onExport}
        title="Export as HTML"
        icon={<FileDown size={16} className="text-gray-900" />}
        label="Export"
      />
      <ActionButton
        onClick={onPrint}
        title="Print"
        icon={<Printer size={16} className="text-gray-900" />}
        label="Print"
      />
      <ActionButton
        onClick={onPageBreak}
        title="Insert Page Break"
        icon={<Plus size={16} className="text-gray-900" />}
        label="Page break"
      />
    </div>
  )
}
