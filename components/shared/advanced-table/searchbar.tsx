// Searchbar component with icon
"use client"

import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils"

interface SearchbarProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string
}

export function Searchbar({ className, ...props }: SearchbarProps) {
  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        {...props}
        className={cn("pl-8", className)}
      />
    </div>
  )
}
