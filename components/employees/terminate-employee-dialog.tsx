"use client";

import * as React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { terminateEmployee } from "@/lib/api2/employee-service";
import { useTenantSubdomain } from "@/hooks/use-tenant-subdomain";
import type { EmployeeDto } from "@/lib/api2/employee-types";
import { getQueryClient } from "@/lib/query-client";

interface TerminateEmployeeDialogProps {
  employee: EmployeeDto;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TerminateEmployeeDialog({
  employee,
  open,
  onOpenChange,
}: TerminateEmployeeDialogProps) {
  const subdomain = useTenantSubdomain();
  const queryClient = getQueryClient();
  const [terminationDate, setTerminationDate] = React.useState<Date | undefined>(
    new Date()
  );
  const [submitting, setSubmitting] = React.useState(false);

  const displayName =
    employee.fullName ??
    `${employee.firstName ?? ""} ${employee.lastName ?? ""}`.trim();

  async function handleTerminate() {
    setSubmitting(true);
    try {
      await terminateEmployee(subdomain, employee.id, {
        employeeId: employee.id,
        terminationDate: terminationDate
          ? terminationDate.toISOString()
          : new Date().toISOString(),
        modifiedBy: null,
      });
      await queryClient.invalidateQueries({ queryKey: ["employee", subdomain, employee.id] });
      await queryClient.invalidateQueries({ queryKey: ["employees", subdomain] });
      onOpenChange(false);
    } catch (err) {
      console.error("Termination failed:", err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Terminate Employee</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to terminate{" "}
            <strong>{displayName || "this employee"}</strong>? This action will
            update their employment status to Terminated.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex flex-col gap-2">
          <Label>Termination Date</Label>
          <DatePicker
            value={terminationDate}
            onChange={(date) => setTerminationDate(date)}
            placeholder="Select termination date"
          />
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleTerminate}
            loading={submitting}
            loadingText="Terminating..."
            variant="destructive"
          >
            Terminate
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
