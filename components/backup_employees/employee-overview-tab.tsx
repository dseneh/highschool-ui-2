"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  UserIcon,
  Call02Icon,
  MapPinIcon,
  Building02Icon,
} from "@hugeicons/core-free-icons";
import type { EmployeeDto } from "@/lib/api2/employee-types";
import { cn } from "@/lib/utils";

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined | React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <dt className="shrink-0 text-sm text-muted-foreground">{label}</dt>
      <dd className="text-right text-sm font-medium">
        {value || <span className="text-muted-foreground/50">—</span>}
      </dd>
    </div>
  );
}

function SectionCard({
  title,
  icon,
  iconClassName,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  iconClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="border-b">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex size-8 items-center justify-center rounded-lg",
              iconClassName || "bg-primary/10 text-primary"
            )}
          >
            {icon}
          </div>
          <CardTitle>{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <dl className="divide-y divide-border/50">{children}</dl>
      </CardContent>
    </Card>
  );
}

function formatDate(iso: string | null | undefined) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function EmployeeOverviewTab({ employee }: { employee: EmployeeDto }) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <SectionCard
        title="Personal Information"
        icon={<HugeiconsIcon icon={UserIcon} className="size-4" />}
        iconClassName="bg-blue-500/10 text-blue-600 dark:text-blue-400"
      >
        <DetailRow label="First Name" value={employee.firstName} />
        <DetailRow label="Middle Name" value={employee.middleName} />
        <DetailRow label="Last Name" value={employee.lastName} />
        <DetailRow label="Date of Birth" value={formatDate(employee.dateOfBirth)} />
        <DetailRow label="Place of Birth" value={employee.placeOfBirth} />
        <DetailRow
          label="Gender"
          value={
            employee.gender ? (
              <Badge variant="secondary" className="capitalize text-xs font-medium">
                {employee.gender}
              </Badge>
            ) : null
          }
        />
      </SectionCard>

      <SectionCard
        title="Contact Information"
        icon={<HugeiconsIcon icon={Call02Icon} className="size-4" />}
        iconClassName="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
      >
        <DetailRow
          label="Email Address"
          value={
            employee.email ? (
              <a href={`mailto:${employee.email}`} className="text-primary hover:underline">
                {employee.email}
              </a>
            ) : null
          }
        />
        <DetailRow
          label="Phone Number"
          value={
            employee.phoneNumber ? (
              <a href={`tel:${employee.phoneNumber}`} className="hover:underline">
                {employee.phoneNumber}
              </a>
            ) : null
          }
        />
        <DetailRow label="National ID" value={employee.nationalId} />
        <DetailRow label="Passport" value={employee.passportNumber} />
      </SectionCard>

      <SectionCard
        title="Address"
        icon={<HugeiconsIcon icon={MapPinIcon} className="size-4" />}
        iconClassName="bg-amber-500/10 text-amber-600 dark:text-amber-400"
      >
        <DetailRow label="Address" value={employee.address} />
        <DetailRow label="City" value={employee.city} />
        <DetailRow label="State" value={employee.state} />
        <DetailRow label="Postal Code" value={employee.postalCode} />
        <DetailRow label="Country" value={employee.country} />
      </SectionCard>

      <SectionCard
        title="Employment Information"
        icon={<HugeiconsIcon icon={Building02Icon} className="size-4" />}
        iconClassName="bg-violet-500/10 text-violet-600 dark:text-violet-400"
      >
        <DetailRow
          label="Employee #"
          value={<span className="rounded bg-muted px-2 py-0.5 font-mono text-xs">{employee.employeeNumber || "Auto"}</span>}
        />
        <DetailRow label="Position" value={employee.jobTitle || employee.positionName} />
        <DetailRow label="Department" value={employee.departmentName} />
        <DetailRow
          label="Status"
          value={<Badge variant="outline">{employee.employmentStatus || "Unknown"}</Badge>}
        />
        <DetailRow label="Employment Type" value={employee.employmentType} />
        <DetailRow label="Hire Date" value={formatDate(employee.hireDate)} />
        <DetailRow label="Termination Date" value={formatDate(employee.terminationDate)} />
        <DetailRow label="Manager" value={employee.managerName} />
      </SectionCard>
    </div>
  );
}
