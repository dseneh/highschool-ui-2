"use client";

import { useState } from "react";
import { DialogBox } from "@/components/ui/dialog-box";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import TenantStatusBadge from "@/components/admin/tenant-status-badge";
import type { TenantDetail, TenantListItem } from "@/lib/api2/admin-tenant-types";

const STATUS_OPTIONS = [
  { value: "active", label: "Active", hint: "Fully operational" },
  { value: "inactive", label: "Inactive", hint: "Temporarily paused" },
  { value: "suspended", label: "Suspended", hint: "Restricted access" },
  { value: "trial", label: "Trial", hint: "Trial experience" },
] as const;

interface TenantStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenant: TenantListItem | TenantDetail | null;
  loading?: boolean;
  onSubmit: (payload: { status: string; is_active: boolean }) => Promise<void>;
}

export default function TenantStatusDialog({
  open,
  onOpenChange,
  tenant,
  loading = false,
  onSubmit,
}: TenantStatusDialogProps) {
  const [status, setStatus] = useState(tenant?.status || "inactive");
  const [isActive, setIsActive] = useState(Boolean(tenant?.is_active ?? tenant?.active));

  if (!tenant) return null;

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setStatus(tenant.status || "inactive");
      setIsActive(Boolean(tenant.is_active ?? tenant.active));
    }
    onOpenChange(nextOpen);
  };

  const handleSubmit = async () => {
    await onSubmit({ status, is_active: isActive });
  };

  return (
    <DialogBox
      open={open}
      onOpenChange={handleOpenChange}
      title="Change Tenant Status"
      description="Update workspace lifecycle status and access state"
      actionLabel="Save Status"
      actionLoading={loading}
      actionLoadingText="Saving..."
      onAction={handleSubmit}
      className="sm:max-w-lg"
    >
      <div className="space-y-4 py-1">
        <Alert>
          <AlertDescription>
            Updating status for <span className="font-semibold">{tenant.name}</span> (
            <span className="font-mono">{tenant.schema_name}</span>)
          </AlertDescription>
        </Alert>

        {/* <div className="rounded-md border p-3">
          <div className="mb-2 text-xs text-muted-foreground">Current</div>
          <TenantStatusBadge status={tenant.status} active={tenant.is_active ?? tenant.active} />
        </div> */}

        <div className="space-y-2">
          <Label>Status</Label>
          <div className="grid gap-2 sm:grid-cols-2">
            {STATUS_OPTIONS.map((option) => {
              const selected = status === option.value;
              return (
                <Button
                  key={option.value}
                  type="button"
                  variant="outline"
                  onClick={() => setStatus(option.value)}
                  className={cn(
                    "h-auto justify-start px-3 py-2 text-left",
                    selected && "border-primary bg-primary/5"
                  )}
                >
                  <span className="flex w-full items-start justify-between gap-2">
                    <span>
                      <span className="block text-sm font-medium">{option.label}</span>
                      <span className="block text-xs text-muted-foreground">{option.hint}</span>
                    </span>
                    {selected ? <Check className="mt-0.5 size-4 text-primary" /> : null}
                  </span>
                </Button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Workspace Access</Label>
          <div className="grid gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsActive(true)}
              className={cn(
                "h-auto justify-start px-3 py-2 text-left",
                isActive && "border-primary bg-primary/5"
              )}
            >
              <span>
                <span className="block text-sm font-medium">Enabled</span>
                <span className="block text-xs text-muted-foreground">Users can access the workspace</span>
              </span>
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => setIsActive(false)}
              className={cn(
                "h-auto justify-start px-3 py-2 text-left",
                !isActive && "border-primary bg-primary/5"
              )}
            >
              <span>
                <span className="block text-sm font-medium">Disabled</span>
                <span className="block text-xs text-muted-foreground">Workspace login and actions are blocked</span>
              </span>
            </Button>
          </div>
        </div>

        <div className="rounded-md border bg-muted/30 p-3">
          <div className="mb-2 text-xs text-muted-foreground">New Status Preview</div>
          <TenantStatusBadge status={status} active={isActive} />
        </div>
      </div>
    </DialogBox>
  );
}
