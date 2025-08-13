 

import type React from "react"
import { useState, useRef, useEffect } from "react"

type Align = "start" | "center" | "end"

interface EditableHeaderFooterProps {
  content: string
  onChange: (content: string) => void
  align: Align
  placeholder?: string
  className?: string
}

export const EditableHeaderFooter: React.FC<EditableHeaderFooterProps> = ({
  content,
  onChange,
  align,
  placeholder = "Enter text...",
  className = "",
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(content)
  const inputRef = useRef<HTMLInputElement>(null)

  const alignToClass = (a: Align) => {
    switch (a) {
      case "start":
        return "text-left"
      case "end":
        return "text-right"
      case "center":
        return "text-center"
      default:
        return "text-center"
    }
  }

  useEffect(() => {
    setEditValue(content)
  }, [content])

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleClick = () => {
    setIsEditing(true)
  }

  const handleBlur = () => {
    setIsEditing(false)
    onChange(editValue)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      setIsEditing(false)
      onChange(editValue)
    } else if (e.key === "Escape") {
      e.preventDefault()
      setIsEditing(false)
      setEditValue(content) // Reset to original value
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value)
  }

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={editValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={`w-full bg-transparent border-none outline-none ${alignToClass(align)} ${className}`}
        placeholder={placeholder}
        style={{
          fontSize: "inherit",
          fontFamily: "inherit",
          color: "inherit",
        }}
      />
    )
  }

  return (
    <div
      onClick={handleClick}
      className={`cursor-pointer hover:bg-gray-50 hover:bg-opacity-50 rounded px-2 py-1 transition-colors ${alignToClass(align)} ${className}`}
      dangerouslySetInnerHTML={{ __html: content || placeholder }}
      title="Click to edit"
    />
  )
}
