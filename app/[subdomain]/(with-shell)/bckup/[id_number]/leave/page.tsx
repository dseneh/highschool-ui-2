"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { EmployeeSubpageShell } from "@/components/employees/employee-subpage-shell";
import { EmployeeLeaveTab } from "@/components/employees/employee-leave-tab";
import { useTenantSubdomain } from "@/hooks/use-tenant-subdomain";

export default function EmployeeLeaveDetailPage() {
  const router = useRouter();
  const subdomain = useTenantSubdomain();

  return (
    <EmployeeSubpageShell
      title="Leave"
      description="Review leave balances, history, and recent requests for this employee."
      actions={
        <Button
          variant="outline"
          onClick={() => router.push(subdomain ? `/${subdomain}/leaves` : "/leaves")}
        >
          Open Leave Management
        </Button>
      }
    >
      {(employee) => (
        <EmployeeLeaveTab
          leaveBalances={employee.leaveBalances}
          leaveRequests={employee.leaveRequests}
          onManageLeaves={() => router.push(subdomain ? `/${subdomain}/leaves` : "/leaves")}
        />
      )}
    </EmployeeSubpageShell>
  );
}
