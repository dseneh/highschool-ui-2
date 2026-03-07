"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  PencilEdit01Icon,
  Delete01Icon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { getStatusPillClass } from "@/lib/status-colors";
import type { EmployeeDto } from "@/lib/api2/employee-types";

interface EmployeeDetailHeaderProps {
  employee: EmployeeDto;
  onBack: () => void;
  onEdit: () => void;
  onTerminate: () => void;
}

export function EmployeeDetailHeader({
  employee,
  onBack,
  onEdit,
  onTerminate,
}: EmployeeDetailHeaderProps) {
  const displayName =
    employee.fullName ??
    `${employee.firstName ?? ""} ${employee.lastName ?? ""}`.trim();
  const initials = [employee.firstName, employee.lastName]
    .filter(Boolean)
    .map((n) => n![0])
    .join("");
  const status = employee.employmentStatus ?? "Unknown";

  return (
    <div className="rounded-xl border bg-card p-6">
      <div className="flex flex-col gap-6">
        {/* Top row: back + actions */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            iconLeft={<HugeiconsIcon icon={ArrowLeft01Icon} />}
          >
            Back to Employees
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
              iconLeft={<HugeiconsIcon icon={PencilEdit01Icon} />}
            >
              Edit
            </Button>
            {status !== "Terminated" && (
              <Button
                variant="outline"
                size="sm"
                className="text-destructive border-destructive/30 hover:bg-destructive/10"
                onClick={onTerminate}
                iconLeft={<HugeiconsIcon icon={Delete01Icon} />}
              >
                Terminate
              </Button>
            )}
          </div>
        </div>

        {/* Profile info */}
        <div className="flex items-center gap-5">
          <Avatar className="size-16">
            {employee.photoUrl ? (
              <AvatarImage src={employee.photoUrl} alt={displayName} />
            ) : null}
            <AvatarFallback className="text-lg font-semibold">
              {initials || "?"}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold tracking-tight text-balance">
                {displayName || "Unnamed Employee"}
              </h1>
              <span
                className={cn(
                  "inline-flex items-center px-2 py-0.5 rounded-md border text-xs font-medium",
                  getStatusPillClass(status)
                )}
              >
                {status}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {employee.employeeNumber && (
                <span>#{employee.employeeNumber}</span>
              )}
              {employee.jobTitle && <span>{employee.jobTitle}</span>}
              {employee.employmentType && (
                <span className="px-2 py-0.5 rounded-md bg-muted text-xs font-medium">
                  {employee.employmentType}
                </span>
              )}
            </div>
            {employee.email && (
              <span className="text-sm text-muted-foreground">
                {employee.email}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
