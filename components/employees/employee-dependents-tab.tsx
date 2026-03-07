"use client";

import type { DependentDto } from "@/lib/api/employee-types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface EmployeeDependentsTabProps {
  dependents: DependentDto[] | null;
  onAddDependent: () => void;
}

function formatDate(iso: string | null | undefined) {
  if (!iso) return "--";
  return new Date(iso).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function EmployeeDependentsTab({
  dependents,
  onAddDependent,
}: EmployeeDependentsTabProps) {
  const list = dependents ?? [];

  if (list.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-8 text-center">
        <p className="text-sm text-muted-foreground mb-4">
          No dependents have been added yet.
        </p>
        <button
          onClick={onAddDependent}
          className="text-sm font-medium text-primary hover:underline"
        >
          Add a dependent
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b">
        <h2 className="text-sm font-semibold">Dependents</h2>
        <button
          onClick={onAddDependent}
          className="text-sm font-medium text-primary hover:underline"
        >
          Add Dependent
        </button>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="text-muted-foreground font-medium">Name</TableHead>
              <TableHead className="text-muted-foreground font-medium">Relationship</TableHead>
              <TableHead className="text-muted-foreground font-medium">Date of Birth</TableHead>
              <TableHead className="text-muted-foreground font-medium">Gender</TableHead>
              <TableHead className="text-muted-foreground font-medium">National ID</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.map((d) => (
              <TableRow key={d.id}>
                <TableCell className="font-medium">
                  {[d.firstName, d.lastName].filter(Boolean).join(" ") || "--"}
                </TableCell>
                <TableCell className="text-muted-foreground">{d.relationship ?? "--"}</TableCell>
                <TableCell className="text-muted-foreground">{formatDate(d.dateOfBirth)}</TableCell>
                <TableCell className="text-muted-foreground">{d.gender ?? "--"}</TableCell>
                <TableCell className="text-muted-foreground">{d.nationalId ?? "--"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
