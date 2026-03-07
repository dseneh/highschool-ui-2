"use client"

import * as React from "react"
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader } from "lucide-react"
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 rounded-md border border-transparent bg-clip-padding text-sm font-medium focus-visible:ring-3 aria-invalid:ring-3 shadow-sm [&_svg:not([class*='size-'])]:size-4 inline-flex items-center justify-center whitespace-nowrap transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none shrink-0 [&_svg]:shrink-0 outline-none group/button select-none active:translate-y-[1px]",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-md",
        outline: "border-border/70 bg-background/70 hover:bg-muted/70 hover:text-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 aria-expanded:bg-muted aria-expanded:text-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90 hover:shadow-md aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ghost: "shadow-none hover:bg-muted/60 hover:text-foreground dark:hover:bg-muted/50 aria-expanded:bg-muted aria-expanded:text-foreground",
        destructive: "bg-destructive/10 hover:bg-destructive/20 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/20 text-destructive focus-visible:border-destructive/40 dark:hover:bg-destructive/30",
        "destructive-outline": "border-destructive/30 hover:border-destructive/50 hover:bg-destructive/10 text-destructive dark:border-destructive/40 dark:hover:bg-destructive/20",
        success: "bg-emerald-500/10 hover:bg-emerald-500/20 focus-visible:ring-emerald-500/20 dark:focus-visible:ring-emerald-500/40 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 focus-visible:border-emerald-500/40 dark:hover:bg-emerald-500/30",
        "success-outline": "border-emerald-500/30 hover:border-emerald-500/50 hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 dark:border-emerald-500/40 dark:hover:bg-emerald-500/20",
        warning: "bg-amber-500/10 hover:bg-amber-500/20 focus-visible:ring-amber-500/20 dark:focus-visible:ring-amber-500/40 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 focus-visible:border-amber-500/40 dark:hover:bg-amber-500/30",
        "warning-outline": "border-amber-500/30 hover:border-amber-500/50 hover:bg-amber-500/10 text-amber-600 dark:text-amber-400 dark:border-amber-500/40 dark:hover:bg-amber-500/20",
        info: "bg-blue-500/10 hover:bg-blue-500/20 focus-visible:ring-blue-500/20 dark:focus-visible:ring-blue-500/40 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 focus-visible:border-blue-500/40 dark:hover:bg-blue-500/30",
        "info-outline": "border-blue-500/30 hover:border-blue-500/50 hover:bg-blue-500/10 text-blue-600 dark:text-blue-400 dark:border-blue-500/40 dark:hover:bg-blue-500/20",
        link: "shadow-none text-primary/90 underline-offset-4 hover:text-primary hover:underline",
      },
      size: {
        default: "h-9 gap-1.5 px-2.5 in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "h-6 gap-1 rounded-[min(var(--radius-md),8px)] px-2 text-xs in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1 rounded-[min(var(--radius-md),10px)] px-2.5 in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5",
        lg: "h-10 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        icon: "size-9",
        "icon-xs": "size-6 rounded-[min(var(--radius-md),8px)] in-data-[slot=button-group]:rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-md",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const LoadingSpinner = ({ className }: { className?: string }) => (
  <Loader className={cn("animate-spin", className)} />
)

export interface ButtonProps extends ButtonPrimitive.Props, VariantProps<typeof buttonVariants> {
  /** Icon rendered at the default position (left) */
  icon?: React.ReactNode
  /** Icon rendered at the start (left) */
  iconLeft?: React.ReactNode
  /** Icon rendered at the end (right) */
  iconRight?: React.ReactNode
  /** @deprecated Use iconLeft / iconRight instead */
  iconPosition?: "left" | "right"
  /** Show loading spinner and disable the button */
  loading?: boolean
  /** Text shown while loading (replaces children) */
  loadingText?: string
  /** Wrap with a Tooltip */
  tooltip?: string
  /** Tooltip placement */
  tooltipSide?: "top" | "bottom" | "left" | "right"
}

function Button({
  className,
  variant = "default",
  size = "default",
  icon,
  iconLeft,
  iconRight,
  iconPosition,
  loading = false,
  loadingText,
  tooltip,
  tooltipSide = "top",
  disabled,
  children,
  ...props
}: ButtonProps) {
  // Resolve leading / trailing icons
  const leadIcon = iconLeft ?? (iconPosition === "right" ? undefined : icon)
  const trailIcon = iconRight ?? (iconPosition === "right" ? icon : undefined)

  const content = loading ? (
    <>
      <LoadingSpinner />
      {loadingText ?? children}
    </>
  ) : (
    <>
      {leadIcon && <span data-icon="inline-start">{leadIcon}</span>}
      {children}
      {trailIcon && <span data-icon="inline-end">{trailIcon}</span>}
    </>
  )

  const button = (
    <ButtonPrimitive
      data-slot="button"
      disabled={disabled || loading}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {content}
    </ButtonPrimitive>
  )

  if (tooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger render={button} />
          <TooltipContent side={tooltipSide}>{tooltip}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return button
}

export { Button, buttonVariants }
