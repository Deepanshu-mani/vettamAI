 

import type React from "react"
import { useContext } from "react"
import { Trash2 } from "lucide-react"
import { TrashContext } from "../context/TextContext"

export const TrashBin: React.FC = () => {
  const { isDragging } = useContext(TrashContext)

  return (
    <div
      id="trash-bin"
      aria-hidden={!isDragging}
      className={`fixed left-1/2 -translate-x-1/2 bottom-6 z-50 transition-all ${
        isDragging ? "opacity-100 translate-y-0" : "opacity-0 pointer-events-none translate-y-2"
      }`}
    >
      <div className="flex items-center gap-2 bg-white border border-gray-200 shadow-xl rounded-full px-4 py-2">
        <Trash2 className="text-red-500" size={18} />
        <span className="text-sm text-gray-700">Drop here to delete</span>
      </div>
    </div>
  )
}
