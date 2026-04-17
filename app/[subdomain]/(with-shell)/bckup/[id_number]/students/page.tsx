"use client";

import { useRouter } from "next/navigation";
import { GraduationCap, Users } from "lucide-react";
import { EmployeeSubpageShell } from "@/components/employees/employee-subpage-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTenantSubdomain } from "@/hooks/use-tenant-subdomain";

export default function EmployeeStudentsPage() {
  const router = useRouter();
  const subdomain = useTenantSubdomain();
  const route = (path: string) => (subdomain ? `/${subdomain}${path}` : path);

  return (
    <EmployeeSubpageShell
      title="Students"
      description="Quick access to student lists and class rosters relevant to this employee."
      actions={
        <Button
          variant="outline"
          onClick={() => router.push(route("/students"))}
          iconLeft={<Users className="h-4 w-4" />}
        >
          Open Students
        </Button>
      }
    >
      {(employee) => (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <GraduationCap className="h-4 w-4" /> Student Access
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Browse enrolled students, attendance, and grade context from the student management area.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => router.push(route("/students"))}>
                Student Management
              </Button>
              <Button variant="outline" onClick={() => router.push(route("/grading/gradebooks"))}>
                Related Gradebooks
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
