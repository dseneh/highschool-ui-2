"use client";

import { DialogBox } from "@/components/ui/dialog-box";
import { Button } from "@/components/ui/button";
import { TenantDetail, TenantListItem } from "@/lib/api2/admin-tenant-types";
import { AlertTriangle } from "lucide-react";

interface DeleteTenantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenant: TenantListItem | TenantDetail | null;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
}

export default function DeleteTenantDialog({
  open,
  onOpenChange,
  tenant,
  onConfirm,
  isLoading = false,
}: DeleteTenantDialogProps) {
  if (!tenant) return null;

  const handleConfirm = async () => {
    await onConfirm();
    onOpenChange(false);
  };

  return (
    <DialogBox
      open={open}
      onOpenChange={onOpenChange}
      title="Delete Tenant"
      className="max-w-md"
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/10 p-4">
          <AlertTriangle className="size-5 shrink-0 text-destructive" />
          <div className="space-y-1">
            <p className="text-sm font-medium">Warning: This action cannot be undone</p>
            <p className="text-sm text-muted-foreground">
              Deleting this tenant will perform a soft delete. The tenant data will be
              retained but marked as deleted and will no longer be accessible.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm">
            Are you sure you want to delete <strong>{tenant.name}</strong>?
          </p>
          <div className="rounded-md bg-muted p-3 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <span className="text-muted-foreground">Schema:</span>
              <span className="font-mono">{tenant.schema_name}</span>
              <span className="text-muted-foreground">Short Name:</span>
              <span>{tenant.short_name}</span>
              <span className="text-muted-foreground">Status:</span>
              <span className="capitalize">{tenant.status}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            loading={isLoading}
            loadingText="Deleting..."
          >
            Delete Tenant
          </Button>
        </div>
      </div>
    </DialogBox>
  );
}
