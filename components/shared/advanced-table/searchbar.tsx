// Searchbar component with icon
"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Search, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface SearchbarProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string
  onSearch?: () => void
  onClear?: () => void
  showDirtyIndicator?: boolean
}

export function Searchbar({ className, onSearch, onClear, showDirtyIndicator = false, ...props }: SearchbarProps) {
  const hasValue = typeof props.value === "string" ? props.value.length > 0 : false
  const isDisabled = Boolean(props.disabled)

  return (
    <div className={cn("relative", className)}>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="absolute left-1 size-7 p-0 mt-0.5"
        onClick={() => {
          onClear?.()

          if (!onClear) {
            props.onChange?.({
              target: { value: "" },
              currentTarget: { value: "" },
            } as React.ChangeEvent<HTMLInputElement>)
          }
        }}
        aria-label="Clear search"
        disabled={isDisabled || !hasValue}
      >
        <X className={cn("size-4", hasValue ? "text-muted-foreground" : "text-muted-foreground/40")} />
      </Button>
      {!isDisabled && (showDirtyIndicator || hasValue) && (
        <span className={cn("absolute top-2 mt-1 size-2 rounded-full bg-primary", onSearch ? "right-9" : "right-2")} aria-hidden="true" />
      )}
      <Input
        {...props}
        onKeyDown={(event) => {
          props.onKeyDown?.(event)
          if (event.key === "Enter") {
            event.preventDefault()
            onSearch?.()
          }
        }}
        className={cn("pl-8", onSearch && "pr-10", className)}
      />
      {onSearch && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-1 mt-0.5 size-7 p-0"
          onClick={onSearch}
          aria-label="Search"
          disabled={isDisabled}
        >
          <Search className="size-4" />
        </Button>
      )}
    </div>
  )
}
