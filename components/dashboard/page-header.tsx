"use client"

import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface PageHeaderProps {
  title: string | ReactNode
  description?: string | ReactNode
  children?: ReactNode
  className?: string
}

/**
 * Reusable page-level header with title, description, and action slot.
 * Use this inside `<PageContent>` at the top of each page to keep
 * page-specific actions co-located with the page content.
 */
export function PageHeader({ title, description, children, className }: PageHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between gap-2 overflow-hidden", className)}>
      <div className="min-w-0">
        <h2 className="font-semibold truncate">{title}</h2>
        {description && (
          <p className="hidden sm:block mt-0 text-xs text-muted-foreground truncate">{description}</p>
        )}
      </div>
      {children && (
        <div className="flex items-center gap-2 shrink-0 ">
          {children}
        </div>
      )}
    </div>
  )
}
