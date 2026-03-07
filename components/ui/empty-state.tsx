import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "./button"
import { Plus } from "lucide-react"

function EmptyState({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty-state"
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed p-10 text-center",
        className
      )}
      {...props}
    />
  )
}

function EmptyStateIcon({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty-state-icon"
      className={cn(
        "flex items-center justify-center rounded-full bg-muted p-3 [&_svg]:size-6 [&_svg]:text-muted-foreground mb-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

function EmptyStateTitle({
  className,
  ...props
}: React.ComponentProps<"h3">) {
  return (
    <h3
      data-slot="empty-state-title"
      className={cn("text-lg font-semibold", className)}
      {...props}
    />
  )
}

function EmptyStateDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="empty-state-description"
      className={cn(
        "mt-1.5 text-sm text-muted-foreground max-w-md",
        className
      )}
      {...props}
    />
  )
}

function EmptyStateAction({
  className,
  ...props
}: React.ComponentProps<"button">) {
  return (
    <Button
      data-slot="empty-state-action"
      icon={<Plus className="size-4" />}
      className={cn("mt-6", className)}
      {...props}
    />
  )
}

export {
  EmptyState,
  EmptyStateIcon,
  EmptyStateTitle,
  EmptyStateDescription,
  EmptyStateAction,
}
