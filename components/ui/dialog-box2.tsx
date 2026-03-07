"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";


interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  onSubmit?: (data: any) => Promise<void>;
  submitProps?: any;
  cancelProps?: any;
  onCancel?: () => void;
  loading?: boolean;
  rest?: React.ComponentPropsWithoutRef<"div">;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  formId?: string;
  submitLabel?: string;
  cancelLabel?: string;
}

export function DialogBox2({
  open,
  onOpenChange,
  title,
  description,
  children,
  onSubmit,
  submitProps,
  cancelProps,
  onCancel,
  loading,
  size = "md",
  formId,
  submitLabel = "Submit",
  cancelLabel = "Cancel",
  ...rest
}: ModalProps) {
  
  const sizeClasses = {
    sm: "h-full max-h-[90vh] w-full md:max-w-[30vw] ",
    md: "h-full md:max-h-[60vh] w-full md:max-w-[40vw]",
    lg: "h-full max-h-[90vh] w-full md:max-w-[90vw]",
    xl: "h-full max-h-[90vh] md:max-w-[98vw] w-full",
    full: "w-full max-w-full h-full max-h-[100vh] rounded-none",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} {...rest}>
      <DialogContent
        className={cn("flex flex-col gap-0 overflow-hidden p-0", sizeClasses[size])}
        showCloseButton
      >
        <div className="border-b px-5 pt-4 pb-3 space-y-4">
          <DialogHeader>
            <DialogTitle className="text-lg">
              {title}
            </DialogTitle>
            {description && (
              <DialogDescription className="text-sm -mt-1">
                {description}
              </DialogDescription>
            )}
          </DialogHeader>
        </div>

        <ScrollArea className="min-h-0 flex-1 h-0 p-3">
          {children}
        </ScrollArea>

        <DialogFooter className="border-t px-6 py-4 sm:justify-end">
          <Button
            variant="outline"
            onClick={() => onCancel ? onCancel() : onOpenChange(false)}
            {...cancelProps}
          >
            {cancelLabel}
          </Button>
          {(onSubmit || formId) && (
            <Button
              type={formId ? "submit" : "button"}
              form={formId ? formId : undefined}
              loading={loading}
              {...submitProps}
            >
              {submitLabel}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
