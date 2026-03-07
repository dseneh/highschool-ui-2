"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { HugeiconsIcon } from "@hugeicons/react";
import { Building02Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import type { UserSearchResult } from "@/lib/api/public-types";
import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";

interface TenantSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  results: UserSearchResult[];
  onSelectTenant: (result: UserSearchResult) => void;
}

export function TenantSelectionDialog({
  open,
  onOpenChange,
  results,
  onSelectTenant,
}: TenantSelectionDialogProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleSelect = (index: number) => {
    setSelectedIndex(index);
    onSelectTenant(results[index]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select Account</DialogTitle>
          <DialogDescription>
            Your credentials are associated with multiple schools. Please select which
            account you&apos;d like to access.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 mt-4">
          {results.map((result, index) => {
            const { tenant, data, user_type } = result;
            const initials = [data.first_name, data.last_name]
              .filter(Boolean)
              .map((n) => n![0])
              .join("");

            return (
              <button
                key={`${tenant.id}-${index}`}
                onClick={() => handleSelect(index)}
                className={cn(
                  "w-full flex items-center gap-4 p-4 rounded-lg border-2 transition-all",
                  "hover:bg-muted/50 active:scale-[0.98]",
                  selectedIndex === index
                    ? "border-primary bg-primary/5"
                    : "border-border bg-background"
                )}
              >
                <Avatar className="size-12">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {initials || tenant.short_name.substring(0, 2)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 text-left">
                  <div className="font-semibold text-sm mb-0.5">
                    {data.full_name || `${data.first_name} ${data.last_name}`}  <Badge variant="default">{user_type}</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <HugeiconsIcon
                      icon={Building02Icon}
                      className="size-3.5"
                    />
                    <span>{tenant.name}</span>
                  </div>
                  <div className="fmt-1">
                    {/* <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-muted text-[10px] font-medium uppercase tracking-wider">
                      {user_type}
                    </span> */}
                    {data.grade_level && (
                      <span className="ml-2 text-[10px] text-muted-foreground">
                        {data.grade_level}
                      </span>
                    )}
                  </div>
                </div>

                <HugeiconsIcon
                  icon={ArrowRight01Icon}
                  className={cn(
                    "size-5 transition-all",
                    selectedIndex === index
                      ? "text-primary translate-x-1"
                      : "text-muted-foreground"
                  )}
                />
              </button>
            );
          })}
        </div>

        <div className="mt-6 text-center text-xs text-muted-foreground">
          Can&apos;t find your account? Contact your school administrator.
        </div>
      </DialogContent>
    </Dialog>
  );
}
