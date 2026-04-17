"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  PencilEdit01Icon,
  Delete01Icon,
  Calendar03Icon,
  Mail02Icon,
  SmartPhone01Icon,
  Location01Icon,
  Building02Icon,
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

function getAge(dateOfBirth: string | null | undefined) {
  if (!dateOfBirth) return null;
  const birthDate = new Date(dateOfBirth);
  if (Number.isNaN(birthDate.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }

  return age;
}

export function EmployeeDetailHeader({
  employee,
  onBack,
  onEdit,
  onTerminate,
}: EmployeeDetailHeaderProps) {
  const displayName =
    employee.fullName ?? `${employee.firstName ?? ""} ${employee.lastName ?? ""}`.trim();
  const initials = [employee.firstName, employee.lastName]
    .filter(Boolean)
    .map((name) => name![0])
    .join("");
  const status = employee.employmentStatus ?? "Unknown";
  const age = getAge(employee.dateOfBirth);
  const location = [employee.city, employee.state, employee.country].filter(Boolean).join(", ");
  const position = employee.jobTitle || employee.positionName;
  const department = employee.departmentName;

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="border-b p-4 sm:p-6">
        <div className="flex items-center justify-between gap-3">
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
            {status !== "Terminated" ? (
              <Button
                variant="outline"
                size="sm"
                className="border-destructive/30 text-destructive hover:bg-destructive/10"
                onClick={onTerminate}
                iconLeft={<HugeiconsIcon icon={Delete01Icon} />}
              >
                Terminate
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
          <Avatar className="size-18 shrink-0 shadow-lg ring-4 ring-background sm:size-24">
            {employee.photoUrl ? <AvatarImage src={employee.photoUrl} alt={displayName} /> : null}
            <AvatarFallback className="text-2xl font-semibold">{initials || "?"}</AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="mb-1 text-xl font-bold tracking-tight sm:text-3xl">{displayName || "Unnamed Employee"}</h1>
                <p className="font-mono text-xs text-muted-foreground sm:text-sm">
                  Employee Number: <b>{employee.employeeNumber || "Auto-generated"}</b>
                </p>
              </div>
            </div>

            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Badge className={cn("capitalize border-0", getStatusPillClass(status))}>{status}</Badge>
              {position ? <Badge variant="secondary">{position}</Badge> : null}
              {department ? (
                <Badge variant="outline" className="gap-1.5">
                  <HugeiconsIcon icon={Building02Icon} className="size-3" />
                  {department}
                </Badge>
              ) : null}
              {employee.gender ? <Badge variant="outline">{employee.gender}</Badge> : null}
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground sm:gap-3 sm:text-sm">
              {age !== null ? (
                <div className="flex items-center gap-2">
                  <HugeiconsIcon icon={Calendar03Icon} className="size-4 shrink-0" />
                  {age} year{age !== 1 ? "s" : ""} old
                </div>
              ) : null}
              {employee.email ? (
                <div className="flex items-center gap-2">
                  <HugeiconsIcon icon={Mail02Icon} className="size-4 shrink-0" />
                  <a href={`mailto:${employee.email}`} className="truncate hover:text-foreground">
                    {employee.email}
                  </a>
                </div>
              ) : null}
              {employee.phoneNumber ? (
                <div className="flex items-center gap-2">
                  <HugeiconsIcon icon={SmartPhone01Icon} className="size-4 shrink-0" />
                  <a href={`tel:${employee.phoneNumber}`} className="hover:text-foreground">
                    {employee.phoneNumber}
                  </a>
                </div>
              ) : null}
              {location ? (
                <div className="flex items-center gap-2 md:col-span-2 lg:col-span-3">
                  <HugeiconsIcon icon={Location01Icon} className="size-4 shrink-0" />
                  <span className="truncate">{location}</span>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
