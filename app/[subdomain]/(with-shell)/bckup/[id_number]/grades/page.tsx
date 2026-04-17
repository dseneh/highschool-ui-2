"use client";

import { useRouter } from "next/navigation";
import { BarChart3, ClipboardCheck } from "lucide-react";
import { EmployeeSubpageShell } from "@/components/employees/employee-subpage-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTenantSubdomain } from "@/hooks/use-tenant-subdomain";

export default function EmployeeGradesPage() {
  const router = useRouter();
  const subdomain = useTenantSubdomain();
  const route = (path: string) => (subdomain ? `/${subdomain}${path}` : path);

  return (
    <EmployeeSubpageShell
      title="Grades"
      description="Gradebook and assessment tools linked to this employee's teaching workload."
      actions={
        <Button
          variant="outline"
          onClick={() => router.push(route("/grading/gradebooks"))}
          iconLeft={<ClipboardCheck className="h-4 w-4" />}
        >
          Open Gradebooks
        </Button>
      }
    >
      {(employee) => (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="h-4 w-4" /> Grade Workflow
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Use the grading workspace to enter, review, and publish student grades.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => router.push(route("/grading"))}>
                Open Grading Home
              </Button>
              <Button variant="outline" onClick={() => router.push(route("/grading/gradebooks"))}>
                Open Gradebooks
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Employee: {employee.fullName || employee.employeeNumber || employee.id}
            </p>
          </CardContent>
        </Card>
      )}
    </EmployeeSubpageShell>
  );
}
