"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle2, ClipboardList, LoaderCircle } from "lucide-react";
import { StatsCards, type StatsCardItem } from "@/components/shared/stats-cards";
import { EmployeeSubpageShell } from "@/components/employees/employee-subpage-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEmployeeWorkflowTasks } from "@/hooks/use-employee-workflow";
import { useTenantSubdomain } from "@/hooks/use-tenant-subdomain";

function formatDate(value: string | null) {
  if (!value) return "No due date";
  return new Date(value).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function EmployeeWorkflowDetailPage() {
  const params = useParams<{ id_number: string }>();
  const router = useRouter();
  const subdomain = useTenantSubdomain();
  const employeeId = params.id_number;
  const { data: tasks = [] } = useEmployeeWorkflowTasks({ employeeId });

  const stats = React.useMemo<StatsCardItem[]>(() => {
    const pending = tasks.filter((task) => task.status.toLowerCase() === "pending").length;
    const completed = tasks.filter((task) => task.status.toLowerCase() === "completed").length;
    const overdue = tasks.filter((task) => task.isOverdue).length;

    return [
      { title: "Workflow Tasks", value: String(tasks.length), subtitle: "Total lifecycle tasks", icon: ClipboardList },
      { title: "Pending", value: String(pending), subtitle: "Still awaiting action", icon: LoaderCircle },
      { title: "Completed", value: String(completed), subtitle: "Finished checklist items", icon: CheckCircle2 },
      { title: "Overdue", value: String(overdue), subtitle: "Require follow-up", icon: AlertTriangle },
    ];
  }, [tasks]);

  return (
    <EmployeeSubpageShell
      title="Workflows"
      description="Track onboarding, offboarding, and operational tasks for this employee."
      actions={
        <Button
          variant="outline"
          onClick={() => router.push(subdomain ? `/${subdomain}/employee-workflows` : "/employee-workflows")}
        >
          Open Workflow Board
        </Button>
      }
    >
      {() => (
        <div className="space-y-6">
          <StatsCards items={stats} className="xl:grid-cols-4" />

          <Card>
            <CardHeader>
              <CardTitle>Recent Workflow Tasks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {tasks.length === 0 ? (
                <p className="text-sm text-muted-foreground">No workflow tasks are assigned to this employee yet.</p>
              ) : (
                tasks.slice(0, 8).map((task) => (
                  <div key={task.id} className="flex items-center justify-between gap-4 rounded-lg border p-3">
                    <div>
                      <p className="font-medium">{task.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {task.workflowType} • Due {formatDate(task.dueDate)}
                      </p>
                    </div>
                    <p className="text-sm font-medium">{task.status}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </EmployeeSubpageShell>
  );
}
