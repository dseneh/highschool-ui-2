import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

interface TimelineProps {
  children: ReactNode
  className?: string
}

interface TimelineItemProps {
  children: ReactNode
  className?: string
  marker?: ReactNode
}

export function Timeline({ children, className }: TimelineProps) {
  return (
    <ol className={cn("relative ml-5", className)}>
      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary/30 -translate-x-1/2" />
      {children}
    </ol>
  )
}

export function TimelineItem({ children, className, marker }: TimelineItemProps) {
  return (
    <li className={cn("relative pl-6 pb-3 last:pb-0", className)}>
      <span className="absolute left-0 top-0 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full border-2 border-background bg-card shadow-sm z-10">
        <span className="absolute inset-0 flex items-center justify-center">
          {marker || <span className="h-3 w-3 rounded-full bg-primary" />}
        </span>
      </span>
      {children}
    </li>
  )
}
