"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AlertTriangle, Trash2 } from "lucide-react";
import { useAuth } from "@/components/portable-auth/src/client";
import { EmployeeSubpageShell } from "@/components/employees/employee-subpage-shell";
import { TerminateEmployeeDialog } from "@/components/employees/terminate-employee-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEmployeeMutations } from "@/hooks/use-employee";
import { useTenantSubdomain } from "@/hooks/use-tenant-subdomain";
import { showToast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/utils";

export default function EmployeeSettingsPage() {
  const [terminateOpen, setTerminateOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { remove } = useEmployeeMutations();
  const params = useParams<{ id_number: string }>();
  const router = useRouter();
  const subdomain = useTenantSubdomain();
  const { user } = useAuth();

  const employeeId = params.id_number;
  const role = String(user?.role || "").toLowerCase();
  const isAdmin = role === "admin" || role === "superadmin" || user?.is_superuser === true;

  const employeesPath = useMemo(
    () => (subdomain ? `/${subdomain}/employees` : "/employees"),
    [subdomain]
  );

  async function handleDelete() {
    if (!isAdmin) return;

    const confirmed = window.confirm("Delete this employee permanently? This action cannot be undone.");
    if (!confirmed) return;

    setDeleting(true);
    try {
      await remove.mutateAsync(employeeId);
      showToast.success("Employee deleted", "The employee record has been removed.");
      router.push(employeesPath);
    } catch (error) {
      showToast.error("Delete failed", getErrorMessage(error));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <EmployeeSubpageShell
      title="Settings"
      description="Administrative actions for this employee profile."
    >
      {(employee) => (
        <div className="w-full max-w-3xl space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Employment Actions</CardTitle>
              <CardDescription>
                Manage lifecycle actions for {employee.fullName || employee.employeeNumber || "this employee"}.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="destructive"
                onClick={() => setTerminateOpen(true)}
                disabled={!isAdmin}
                iconLeft={<AlertTriangle className="h-4 w-4" />}
              >
                Terminate Employment
              </Button>
            </CardContent>
          </Card>

          <Card className="border-destructive/40">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>
                Irreversible actions. Only administrators should perform these operations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={!isAdmin || deleting}
                loading={deleting}
                loadingText="Deleting..."
                iconLeft={<Trash2 className="h-4 w-4" />}
              >
                Delete Employee
              </Button>
            </CardContent>
          </Card>

          <TerminateEmployeeDialog
            employee={employee}
            open={terminateOpen}
            onOpenChange={setTerminateOpen}
          />
        </div>
      )}
    </EmployeeSubpageShell>
  );
}
