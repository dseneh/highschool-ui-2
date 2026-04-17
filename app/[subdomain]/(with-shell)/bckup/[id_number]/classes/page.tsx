"use client";

import { useRouter } from "next/navigation";
import { BookOpen, Users } from "lucide-react";
import { EmployeeSubpageShell } from "@/components/employees/employee-subpage-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTenantSubdomain } from "@/hooks/use-tenant-subdomain";

export default function EmployeeClassesPage() {
  const router = useRouter();
  const subdomain = useTenantSubdomain();
  const route = (path: string) => (subdomain ? `/${subdomain}${path}` : path);

  return (
    <EmployeeSubpageShell
      title="Classes"
      description="Classes and academic assignments related to this employee."
      actions={
        <Button
          variant="outline"
          onClick={() => router.push(route("/grading/gradebooks"))}
          iconLeft={<BookOpen className="h-4 w-4" />}
        >
          Open Gradebooks
        </Button>
      }
    >
      {(employee) => (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4" /> Class Assignment Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Class teaching assignments are managed through grading and timetable modules.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => router.push(route("/grading/gradebooks"))}>
                Manage Gradebooks
              </Button>
              <Button variant="outline" onClick={() => router.push(route("/students"))}>
                View Students
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
