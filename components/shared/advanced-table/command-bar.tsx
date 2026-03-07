// Command Bar for bulk actions with keyboard shortcuts
"use client"

import React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface CommandBarProps {
  open: boolean
  children: React.ReactNode
}

export function CommandBar({ open, children }: CommandBarProps) {
  if (!open) return null

  return (
    <div
      className={cn(
        "fixed bottom-4 left-1/2 z-50 -translate-x-1/2 transform",
        "animate-in slide-in-from-bottom-2 duration-200",
      )}
    >
      {children}
    </div>
  )
}

interface CommandBarBarProps {
  children: React.ReactNode
}

export function CommandBarBar({ children }: CommandBarBarProps) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 shadow-lg">
      {children}
    </div>
  )
}

interface CommandBarValueProps {
  children: React.ReactNode
}

export function CommandBarValue({ children }: CommandBarValueProps) {
  return (
    <span className="text-sm font-medium text-foreground">
      {children}
    </span>
  )
}

export function CommandBarSeparator() {
  return (
    <div className="mx-2 h-4 w-px bg-border" />
  )
}

interface CommandBarCommandProps {
  label: string
  action: () => void
  shortcut?: {
    shortcut: string
    label?: string
  }
  disabled?: boolean
}

export function CommandBarCommand({ 
  label, 
  action, 
  shortcut,
  disabled = false 
}: CommandBarCommandProps) {
  React.useEffect(() => {
    if (!shortcut || disabled) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === shortcut.shortcut || e.key.toLowerCase() === shortcut.shortcut.toLowerCase()) {
        e.preventDefault()
        action()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [shortcut, action, disabled])

  return (
    <Button
      onClick={action}
      disabled={disabled}
      variant={'outline'}
      size="sm"
      className={cn(
        "flex items-center gap-2 text-sm transition-colors",
        disabled
          ? "text-muted-foreground cursor-not-allowed"
          : "text-foreground hover:text-primary"
      )}
    >
      <span>{label}</span>
      {shortcut && (
        <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-xs font-mono">
          {shortcut.label || shortcut.shortcut}
        </kbd>
      )}
    </Button>
  )
}
