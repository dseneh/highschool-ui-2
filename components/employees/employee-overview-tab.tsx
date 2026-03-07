"use client";

import type { EmployeeDto } from "@/lib/api/employee-types";

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:gap-0">
      <dt className="text-sm font-medium text-muted-foreground sm:w-44 shrink-0">
        {label}
      </dt>
      <dd className="text-sm">{value || "--"}</dd>
    </div>
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Personal Information */}
      <div className="rounded-xl border bg-card p-5">
        <h2 className="text-sm font-semibold mb-4">Personal Information</h2>
        <dl className="flex flex-col gap-3">
          <InfoRow label="First Name" value={employee.firstName} />
          <InfoRow label="Middle Name" value={employee.middleName} />
          <InfoRow label="Last Name" value={employee.lastName} />
          <InfoRow label="Email" value={employee.email} />
          <InfoRow label="Phone" value={employee.phoneNumber} />
          <InfoRow label="Date of Birth" value={formatDate(employee.dateOfBirth)} />
          <InfoRow label="Gender" value={employee.gender} />
          <InfoRow label="National ID" value={employee.nationalId} />
          <InfoRow label="Passport" value={employee.passportNumber} />
        </dl>
      </div>

      {/* Employment Information */}
      <div className="rounded-xl border bg-card p-5">
        <h2 className="text-sm font-semibold mb-4">Employment Information</h2>
        <dl className="flex flex-col gap-3">
          <InfoRow label="Employee #" value={employee.employeeNumber} />
          <InfoRow label="Job Title" value={employee.jobTitle} />
          <InfoRow label="Employment Type" value={employee.employmentType} />
          <InfoRow label="Employment Status" value={employee.employmentStatus} />
          <InfoRow label="Hire Date" value={formatDate(employee.hireDate)} />
          <InfoRow
            label="Termination Date"
            value={formatDate(employee.terminationDate)}
          />
          <InfoRow label="Department ID" value={employee.departmentId} />
          <InfoRow label="Position ID" value={employee.positionId} />
          <InfoRow label="Manager ID" value={employee.managerId} />
        </dl>
      </div>
    </div>
  );
}
