"use client";

import { useRouter } from "next/navigation";
import { CalendarClock, Settings2 } from "lucide-react";
import { EmployeeSubpageShell } from "@/components/employees/employee-subpage-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTenantSubdomain } from "@/hooks/use-tenant-subdomain";

export default function EmployeeSchedulePage() {
  const router = useRouter();
  const subdomain = useTenantSubdomain();
  const route = (path: string) => (subdomain ? `/${subdomain}${path}` : path);

  return (
    <EmployeeSubpageShell
      title="Schedule"
      description="Schedule information for this employee and quick links to timetable setup."
      actions={
        <Button
          variant="outline"
          onClick={() => router.push(route("/setup/period-times"))}
          iconLeft={<Settings2 className="h-4 w-4" />}
        >
          Configure Period Times
        </Button>
      }
    >
      {(employee) => (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarClock className="h-4 w-4" /> Employee Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Detailed timetable projections are managed from scheduling and grading modules.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => router.push(route("/grading/gradebooks"))}>
                Open Gradebooks
              </Button>
              <Button variant="outline" onClick={() => router.push(route("/students"))}>
                Open Students
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
