import { createContext, useState } from 'react'

type DragPayload =
  | { type: 'page-break'; pos: number }
  | null

interface TrashContextShape {
  isDragging: boolean
  setDragging: (v: boolean) => void

  dragPayload: DragPayload
  setDragPayload: (p: DragPayload) => void

  onDropDelete: ((payload: DragPayload) => void) | null
  setOnDropDelete: (fn: ((payload: DragPayload) => void) | null) => void
}

export const TrashContext = createContext<TrashContextShape>({
  isDragging: false,
  setDragging: () => {},
  dragPayload: null,
  setDragPayload: () => {},
  onDropDelete: null,
  setOnDropDelete: () => {},
})

export const TrashProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDragging, setDragging] = useState(false)
  const [dragPayload, setDragPayload] = useState<DragPayload>(null)
  const [onDropDelete, setOnDropDelete] = useState<TrashContextShape['onDropDelete']>(null)

  return (
    <TrashContext.Provider
      value={{
        isDragging,
        setDragging,
        dragPayload,
        setDragPayload,
        onDropDelete,
        setOnDropDelete,
      }}
    >
      {children}
    </TrashContext.Provider>
  )
}
