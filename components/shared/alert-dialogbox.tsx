import React from 'react'
import {AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle} from '@/components/ui/alert-dialog';

type AlertDialogBoxProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string | React.ReactNode;
  description: string | React.ReactNode;
  actionLabel?: string;
  variant?: "default" | "destructive" | any;
  onConfirm: () => Promise<void>;
  loading?: boolean;
    loadingText?: string;
};
export default function AlertDialogBox({
  open,
  onOpenChange,
  title,
  description,
  actionLabel,
  variant = "default",
  onConfirm,
  loading = false,
  loadingText = "Processing...",
}: AlertDialogBoxProps) {
  return (
    <AlertDialog
        open={open}
        onOpenChange={onOpenChange}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>
              {description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant={variant === "destructive" ? "destructive" : "default"}
              loading={loading}
              loadingText={loadingText}
              onClick={async () => {
                try {
                  await onConfirm();
                  onOpenChange(false);
                } catch {
                }
              }}
            >
              {actionLabel || "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
  )
}
