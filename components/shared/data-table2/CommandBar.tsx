// Source: https://github.com/tremorlabs/template-dashboard
// Simplified CommandBar implementation for bulk editing
"use client"

import React from "react"
import { cn } from "@/lib/utils"

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
    <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 shadow-lg dark:border-gray-800 dark:bg-gray-950">
      {children}
    </div>
  )
}

interface CommandBarValueProps {
  children: React.ReactNode
}

export function CommandBarValue({ children }: CommandBarValueProps) {
  return (
    <span className="text-sm font-medium text-gray-900 dark:text-gray-50">
      {children}
    </span>
  )
}

export function CommandBarSeperator() {
  return (
    <div className="mx-2 h-4 w-px bg-gray-300 dark:bg-gray-700" />
  )
}

interface CommandBarCommandProps {
  label: string
  action: () => void
  shortcut?: {
    shortcut: string
    label?: string
  }
}

export function CommandBarCommand({ label, action, shortcut }: CommandBarCommandProps) {
  React.useEffect(() => {
    if (!shortcut) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === shortcut.shortcut || e.key.toLowerCase() === shortcut.shortcut.toLowerCase()) {
        e.preventDefault()
        action()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [shortcut, action])

  return (
    <button
      onClick={action}
      className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
    >
      <span>{label}</span>
      {shortcut && (
        <kbd className="rounded border border-gray-300 bg-gray-100 px-1.5 py-0.5 text-xs font-mono dark:border-gray-700 dark:bg-gray-800">
          {shortcut.label || shortcut.shortcut}
        </kbd>
      )}
    </button>
  )
}
