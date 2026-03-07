"use client"

import * as React from "react"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { AuthButton } from "../auth/auth-button"

interface DialogBoxProps
  extends Omit<DialogPrimitive.Popup.Props, "title" | "children"> {
  /** Controls dialog visibility */
  open: boolean
  /** Called when visibility changes (close via overlay, escape, etc.) */
  onOpenChange: (open: boolean) => void
  /** Dialog title text */
  title: React.ReactNode
  /** Optional description shown below the title */
  description?: React.ReactNode
  /** Dialog body content */
  children?: React.ReactNode
  /** Footer actions — pass custom JSX, `null` to hide, or omit to use built-in action props */
  footer?: React.ReactNode | null
  /** Whether to show the close (X) button. Defaults to true. */
  showCloseButton?: boolean

  /* ---- built-in footer action shorthand ---- */

  /** Label for the cancel / secondary button. Defaults to "Cancel". Set to `false` to hide. */
  cancelLabel?: string | false
  /** Called when Cancel is clicked. Falls back to `onOpenChange(false)`. */
  onCancel?: () => void
  /** Disables the cancel button */
  cancelDisabled?: boolean

  /** Label for the primary action button */
  actionLabel?: string
  /** Called when the primary action button is clicked */
  onAction?: () => void
  /** Variant for the primary action button */
  actionVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  /** Shows a loading spinner on the primary action button */
  actionLoading?: boolean
  /** Text shown on the primary action button while loading */
  actionLoadingText?: string
  /** Icon to show on the primary action button */
  actionIcon?: React.ReactNode
  /** Disables the primary action button */
  actionDisabled?: boolean
  actionProps?: React.ComponentPropsWithoutRef<typeof Button>
  
  /** Optional form ID to associate the primary action button with a form */
  formId?: string 
  roles?: string[]
}

function DialogBox({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  className,
  showCloseButton,
  cancelLabel = "Cancel",
  onCancel,
  cancelDisabled = false,
  actionLabel,
  onAction,
  actionVariant = "default",
  actionLoading = false,
  actionLoadingText,
  actionIcon,
  actionDisabled = false,
  actionProps,
  roles,
  formId,
  ...contentProps
}: DialogBoxProps) {
  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    } else {
      onOpenChange(false)
    }
  }

  const hasBuiltInFooter = cancelLabel !== false || actionLabel
  const showFooter = footer !== null && (footer !== undefined || hasBuiltInFooter)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(className, "gap-2")}
        showCloseButton={showCloseButton}
        {...contentProps}
      >
        <DialogHeader className="gap-0">
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        {children && (
          <div className="p-1 overflow-y-auto min-h-0 flex-1 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent [scrollbar-width:thin] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/40">
            {children}
          </div>
        )}

        {showFooter &&
          (footer ?? (
            <DialogFooter>
              {cancelLabel !== false && (
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={cancelDisabled || actionLoading}
                >
                  {cancelLabel}
                </Button>
              )}
              {actionLabel &&
                (roles ? (
                  <AuthButton
                    roles={roles}
                    variant={actionVariant}
                    onClick={onAction}
                    loading={actionLoading}
                    loadingText={actionLoadingText}
                    icon={actionIcon}
                    disabled={actionDisabled}
                    type={formId ? "submit" : "button"}
                    form={formId ? formId : undefined}
                    {...actionProps}
                  >
                    {actionLabel}
                  </AuthButton>
                ) : (
                  <Button
                    variant={actionVariant}
                    onClick={onAction}
                    loading={actionLoading}
                    loadingText={actionLoadingText}
                    icon={actionIcon}
                    disabled={actionDisabled}
                    type={formId ? "submit" : "button"}
                    form={formId ? formId : undefined}
                    {...actionProps}
                  >
                    {actionLabel}
                  </Button>
                ))}
            </DialogFooter>
          ))}
      </DialogContent>
    </Dialog>
  );
}

export { DialogBox }
export type { DialogBoxProps }
