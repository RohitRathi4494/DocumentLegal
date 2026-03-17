import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface SelectProps {
  label?: string
  options: string[] | { label: string; value: string }[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  error?: string
}

export const Select = ({
  label,
  options,
  value,
  onChange,
  placeholder = "Select...",
  className,
  error
}: SelectProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Normalize options to { label, value }
  const normalizedOptions = options.map(opt => 
    typeof opt === 'string' ? { label: opt, value: opt } : opt
  )

  const selectedOption = normalizedOptions.find(opt => opt.value === value)

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="w-full relative" ref={dropdownRef}>
      {label && (
        <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">
          {label}
        </label>
      )}
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground ring-offset-background transition-colors hover:border-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
          error && "border-red-500 focus:ring-red-500",
          !selectedOption && "text-muted-foreground",
          className
        )}
      >
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown 
          className={cn(
            "h-4 w-4 opacity-50 transition-transform duration-200",
            isOpen && "transform rotate-180"
          )} 
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 top-full left-0 right-0 mt-2 max-h-60 overflow-auto rounded-xl border border-border bg-slate-950 p-1 shadow-2xl shadow-black/60">
          {(!normalizedOptions || normalizedOptions.length === 0) ? (
            <div className="p-2 text-sm text-muted-foreground text-center">No options available</div>
          ) : (
            normalizedOptions.map((opt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  onChange(opt.value)
                  setIsOpen(false)
                }}
                className={cn(
                  "relative flex w-full cursor-pointer select-none items-center rounded-lg py-2 pl-8 pr-2 text-sm outline-none transition-colors hover:bg-primary/20 focus:bg-primary/20 text-foreground",
                  opt.value === value && "bg-primary/10 text-primary font-medium"
                )}
              >
                {opt.value === value && (
                  <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                    <Check className="h-4 w-4" />
                  </span>
                )}
                {opt.label || "\u00A0"}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
