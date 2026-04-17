"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowRight, CalendarDays, ClipboardList, FileText, TrendingUp, Wallet } from "lucide-react";
import { PageContent } from "@/components/dashboard/page-content";
import { EmployeeDetailHeader } from "@/components/employees/employee-detail-header";
import { EmployeeOverviewTab } from "@/components/employees/employee-overview-tab";
import { EmployeeContactsTab } from "@/components/employees/employee-contacts-tab";
import { EmployeeDependentsTab } from "@/components/employees/employee-dependents-tab";
import { EmployeeLeaveTab } from "@/components/employees/employee-leave-tab";
import { useTenantSubdomain } from "@/hooks/use-tenant-subdomain";
import { cn } from "@/lib/utils";
import { TerminateEmployeeDialog } from "@/components/employees/terminate-employee-dialog";
import { AddContactSheet } from "@/components/employees/add-contact-sheet";
import { AddDependentSheet } from "@/components/employees/add-dependent-sheet";
import { EmployeeFormModal } from "@/components/employees/employee-form";
import type { UpdateEmployeeCommand } from "@/lib/api2/employee-types";
import { useEmployeeDetail, useEmployeeMutations } from "@/hooks/use-employee";
import { useEmployeeDocuments } from "@/hooks/use-employee-documents";
import { useEmployeeAttendance } from "@/hooks/use-employee-attendance";
import { useEmployeePerformanceReviews } from "@/hooks/use-employee-performance-reviews";
import { useEmployeeWorkflowTasks } from "@/hooks/use-employee-workflow";
import { useEmployeeCompensations } from "@/hooks/use-payroll";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "contacts", label: "Contacts" },
  { key: "dependents", label: "Dependents" },
  { key: "leave", label: "Leave" },
  { key: "documents", label: "Documents" },
  { key: "attendance", label: "Attendance" },
  { key: "performance", label: "Performance" },
  { key: "workflows", label: "Workflows" },
  { key: "compensation", label: "Compensation" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function formatDate(value: string | null | undefined) {
  if (!value) return "--";

  return new Date(value).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatCurrency(value: number | null | undefined, currency = "USD") {
  const amount = Number(value ?? 0);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

export default function EmployeeDetailPage() {
  const subdomain = useTenantSubdomain();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState<TabKey>("overview");
  const [showTerminate, setShowTerminate] = React.useState(false);
  const [showAddContact, setShowAddContact] = React.useState(false);
  const [showAddDependent, setShowAddDependent] = React.useState(false);
  const [showEditModal, setShowEditModal] = React.useState(false);

  const employeeId = params.id;
  const { data: employee, isLoading } = useEmployeeDetail(employeeId);
  const { update } = useEmployeeMutations();
  const { data: documents = [] } = useEmployeeDocuments({ employeeId });
  const { data: attendance = [] } = useEmployeeAttendance({ employeeId });
  const { data: performanceReviews = [] } = useEmployeePerformanceReviews({ employeeId });
  const { data: workflowTasks = [] } = useEmployeeWorkflowTasks({ employeeId });
  const { data: compensations = [] } = useEmployeeCompensations();

  const employeeCompensation = React.useMemo(
    () => compensations.find((item) => item.employeeId === employeeId) ?? null,
    [compensations, employeeId]
  );

  const openEmployeeSection = React.useCallback(
    (path: string) => {
      router.push(subdomain ? `/${subdomain}${path}` : path);
    },
    [router, subdomain]
  );

  if (isLoading) {
    return (
      <PageContent>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="size-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-28" />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1 border-b">
          <Skeleton className="mx-4 my-2.5 h-5 w-20" />
          <Skeleton className="mx-4 my-2.5 h-5 w-20" />
          <Skeleton className="mx-4 my-2.5 h-5 w-24" />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </PageContent>
    );
  }

  if (!employee) {
    return (
      <PageContent>
        <div className="flex flex-col items-center justify-center gap-4 py-24">
          <p className="text-muted-foreground">Employee not found.</p>
          <button
            onClick={() => router.push(`/${subdomain}/employees`)}
            className="text-sm font-medium text-primary hover:underline"
          >
            Back to Employees
          </button>
        </div>
      </PageContent>
    );
  }

  return (
    <PageContent>
      <EmployeeDetailHeader
        employee={employee}
        onBack={() => router.push(`/${subdomain}/employees`)}
        onEdit={() => setShowEditModal(true)}
        onTerminate={() => setShowTerminate(true)}
      />

      <div className="flex flex-wrap items-center gap-1 border-b">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "-mb-px px-4 py-2.5 text-sm font-medium transition-colors",
              activeTab === tab.key
                ? "border-b-2 border-primary text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "overview" && <EmployeeOverviewTab employee={employee} />}
      {activeTab === "contacts" && (
        <EmployeeContactsTab
          contacts={employee.contacts}
          onAddContact={() => setShowAddContact(true)}
        />
      )}
      {activeTab === "dependents" && (
        <EmployeeDependentsTab
          dependents={employee.dependents}
          onAddDependent={() => setShowAddDependent(true)}
        />
      )}
      {activeTab === "leave" && (
        <EmployeeLeaveTab
          leaveBalances={employee.leaveBalances}
          leaveRequests={employee.leaveRequests}
          onManageLeaves={() => openEmployeeSection("/leaves")}
        />
      )}
      {activeTab === "documents" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4" />
                Documents Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{documents.length} total</Badge>
                <Badge>{documents.filter((item) => item.complianceStatus.toLowerCase() === "valid").length} valid</Badge>
                <Badge variant="secondary">{documents.filter((item) => item.complianceStatus.toLowerCase() === "expiring soon").length} expiring</Badge>
                <Badge variant="destructive">{documents.filter((item) => item.complianceStatus.toLowerCase() === "expired").length} expired</Badge>
              </div>
              <Button variant="outline" iconRight={<ArrowRight className="h-4 w-4" />} onClick={() => openEmployeeSection("/employee-documents")}>
                Open Documents
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Files</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {documents.length === 0 ? (
                <p className="text-sm text-muted-foreground">No document records yet for this employee.</p>
              ) : (
                documents.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-3 rounded-lg border p-3">
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.documentType}</p>
                    </div>
                    <Badge variant={item.complianceStatus.toLowerCase() === "expired" ? "destructive" : item.complianceStatus.toLowerCase() === "expiring soon" ? "secondary" : "outline"}>
                      {item.complianceStatus}
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}
      {activeTab === "attendance" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CalendarDays className="h-4 w-4" />
                Attendance Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge>{attendance.filter((item) => item.status.toLowerCase() === "present").length} present</Badge>
                <Badge variant="secondary">{attendance.filter((item) => item.status.toLowerCase() === "late").length} late</Badge>
                <Badge variant="destructive">{attendance.filter((item) => item.status.toLowerCase() === "absent").length} absent</Badge>
              </div>
              <Button variant="outline" iconRight={<ArrowRight className="h-4 w-4" />} onClick={() => openEmployeeSection("/employee-attendance")}>
                Open Attendance
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Records</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {attendance.length === 0 ? (
                <p className="text-sm text-muted-foreground">No attendance records yet for this employee.</p>
              ) : (
                attendance.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-3 rounded-lg border p-3">
                    <div>
                      <p className="font-medium">{formatDate(item.attendanceDate)}</p>
                      <p className="text-xs text-muted-foreground">{item.hoursWorked.toFixed(1)} hours</p>
                    </div>
                    <Badge variant={item.status.toLowerCase() === "absent" ? "destructive" : item.status.toLowerCase() === "late" ? "secondary" : "outline"}>
                      {item.status}
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}
      {activeTab === "performance" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-4 w-4" />
                Performance Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{performanceReviews.length} reviews</Badge>
                <Badge>{performanceReviews.filter((item) => item.status.toLowerCase() === "completed").length} completed</Badge>
              </div>
              <Button variant="outline" iconRight={<ArrowRight className="h-4 w-4" />} onClick={() => openEmployeeSection("/performance")}>
                Open Performance
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Reviews</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {performanceReviews.length === 0 ? (
                <p className="text-sm text-muted-foreground">No performance reviews yet for this employee.</p>
              ) : (
                performanceReviews.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-3 rounded-lg border p-3">
                    <div>
                      <p className="font-medium">{item.reviewTitle}</p>
                      <p className="text-xs text-muted-foreground">{item.reviewPeriod || formatDate(item.reviewDate)}</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline">{item.rating}</Badge>
                      <Badge>{item.status}</Badge>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}
      {activeTab === "workflows" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ClipboardList className="h-4 w-4" />
                Workflow Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{workflowTasks.length} tasks</Badge>
                <Badge>{workflowTasks.filter((item) => item.status.toLowerCase() === "completed").length} completed</Badge>
                <Badge variant="secondary">{workflowTasks.filter((item) => item.workflowType.toLowerCase() === "onboarding").length} onboarding</Badge>
                <Badge variant="destructive">{workflowTasks.filter((item) => item.isOverdue).length} overdue</Badge>
              </div>
              <Button variant="outline" iconRight={<ArrowRight className="h-4 w-4" />} onClick={() => openEmployeeSection("/employee-workflows")}>
                Open Workflows
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Open Checklist</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {workflowTasks.length === 0 ? (
                <p className="text-sm text-muted-foreground">No workflow tasks yet for this employee.</p>
              ) : (
                workflowTasks.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-3 rounded-lg border p-3">
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.workflowType} • {item.category}</p>
                    </div>
                    <Badge variant={item.status.toLowerCase() === "blocked" ? "destructive" : item.status.toLowerCase() === "completed" ? "outline" : "secondary"}>
                      {item.status}
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}
      {activeTab === "compensation" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Wallet className="h-4 w-4" />
                Compensation Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {employeeCompensation ? (
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <span>Base Salary</span>
                    <span className="font-medium">{formatCurrency(employeeCompensation.baseSalary, employeeCompensation.currency)}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <span>Gross Pay</span>
                    <span className="font-medium">{formatCurrency(employeeCompensation.grossPay, employeeCompensation.currency)}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <span>Net Pay</span>
                    <span className="font-medium">{formatCurrency(employeeCompensation.netPay, employeeCompensation.currency)}</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No compensation package has been configured for this employee yet.</p>
              )}
              <Button variant="outline" iconRight={<ArrowRight className="h-4 w-4" />} onClick={() => openEmployeeSection("/payroll")}>
                Open Payroll
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Payroll Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {employeeCompensation?.items?.length ? (
                employeeCompensation.items.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-3 rounded-lg border p-3">
                    <div>
                      <p className="font-medium">{item.componentName}</p>
                      <p className="text-xs text-muted-foreground">{item.componentType}</p>
                    </div>
                    <span className="text-sm font-medium">{formatCurrency(item.amount, employeeCompensation.currency)}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No payroll items are attached yet for this employee.</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <TerminateEmployeeDialog
        employee={employee}
        open={showTerminate}
        onOpenChange={setShowTerminate}
      />

      <AddContactSheet
        employeeId={employee.id}
        open={showAddContact}
        onOpenChange={setShowAddContact}
      />

      <AddDependentSheet
        employeeId={employee.id}
        open={showAddDependent}
        onOpenChange={setShowAddDependent}
      />

      <EmployeeFormModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        employee={employee}
        onSubmit={async (data) => {
          await update.mutateAsync({
            id: employee.id,
            payload: data as UpdateEmployeeCommand,
          });
          setShowEditModal(false);
        }}
        submitting={update.isPending}
      />
    </PageContent>
  );
}
