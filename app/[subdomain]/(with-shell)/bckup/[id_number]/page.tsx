"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import {
  CalendarDays,
  ClipboardList,
  FileText,
  TrendingUp,
  Wallet,
} from "lucide-react";
import PageLayout from "@/components/dashboard/page-layout";
import { EmployeeDetailHeader } from "@/components/employees/employee-detail-header";
import { EmployeeOverviewTab } from "@/components/employees/employee-overview-tab";
import { EmployeeContactsTab } from "@/components/employees/employee-contacts-tab";
import { EmployeeDependentsTab } from "@/components/employees/employee-dependents-tab";
import { EmployeeLeaveTab } from "@/components/employees/employee-leave-tab";
import { TerminateEmployeeDialog } from "@/components/employees/terminate-employee-dialog";
import { AddContactSheet } from "@/components/employees/add-contact-sheet";
import { AddDependentSheet } from "@/components/employees/add-dependent-sheet";
import { EmployeeFormModal } from "@/components/employees/employee-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTenantSubdomain } from "@/hooks/use-tenant-subdomain";
import { useEmployeeDetail, useEmployeeMutations } from "@/hooks/use-employee";
import { useEmployeeDocuments } from "@/hooks/use-employee-documents";
import { useEmployeeAttendance } from "@/hooks/use-employee-attendance";
import { useEmployeeWorkflowTasks } from "@/hooks/use-employee-workflow";
import { useEmployeePerformanceReviews } from "@/hooks/use-employee-performance-reviews";
import { useEmployeeCompensations } from "@/hooks/use-payroll";
import type { UpdateEmployeeCommand } from "@/lib/api2/employee-types";
import { showToast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/utils";

function formatCurrency(value: number | null | undefined, currency = "USD") {
  const amount = Number(value ?? 0);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

export default function EmployeeOverviewPage() {
  const params = useParams<{ id_number: string }>();
  const router = useRouter();
  const subdomain = useTenantSubdomain();
  const employeeId = params.id_number;

  const [showTerminate, setShowTerminate] = React.useState(false);
  const [showAddContact, setShowAddContact] = React.useState(false);
  const [showAddDependent, setShowAddDependent] = React.useState(false);
  const [showEditModal, setShowEditModal] = React.useState(false);

  const { data: employee, isLoading, error, refetch, isFetching } = useEmployeeDetail(employeeId);
  const { update } = useEmployeeMutations();
  const { data: documents = [] } = useEmployeeDocuments({ employeeId });
  const { data: attendance = [] } = useEmployeeAttendance({ employeeId });
  const { data: workflows = [] } = useEmployeeWorkflowTasks({ employeeId });
  const { data: performanceReviews = [] } = useEmployeePerformanceReviews({ employeeId });
  const { data: compensations = [] } = useEmployeeCompensations();

  const compensation = React.useMemo(
    () => compensations.find((item) => item.employeeId === employeeId) ?? null,
    [compensations, employeeId]
  );

  const employeeRoute = React.useCallback(
    (path: string) => (subdomain ? `/${subdomain}${path}` : path),
    [subdomain]
  );

  async function handleEdit(payload: UpdateEmployeeCommand) {
    if (!employee) return;

    try {
      await update.mutateAsync({ id: employee.id, payload });
      showToast.success("Employee updated", "Your changes have been saved.");
      setShowEditModal(false);
      void refetch();
    } catch (submitError) {
      showToast.error("Update failed", getErrorMessage(submitError));
    }
  }

  return (
    <>
      <PageLayout
        title={employee?.fullName || "Employee"}
        description={employee ? `Employee record for ${employee.fullName || employee.employeeNumber || employee.id}` : "Review employee profile information and HR records."}
        loading={isLoading}
        fetching={isFetching}
        refreshAction={() => {
          void refetch();
        }}
        error={error}
        noData={!employee && !isLoading}
        emptyStateTitle="Employee not found"
        emptyStateDescription="The requested employee record could not be located."
        skeleton={<LoadingSkeleton />}
      >
        {employee ? (
          <div className="space-y-6">
            <EmployeeDetailHeader
              employee={employee}
              onBack={() => router.push(employeeRoute("/employees"))}
              onEdit={() => setShowEditModal(true)}
              onTerminate={() => setShowTerminate(true)}
            />

            <Tabs defaultValue="overview" className="w-full space-y-4">
              <TabsList variant="line" className="w-full justify-start overflow-x-auto">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="contacts">Contacts</TabsTrigger>
                <TabsTrigger value="dependents">Dependents</TabsTrigger>
                <TabsTrigger value="leave">Leave</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <EmployeeOverviewTab employee={employee} />

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <QuickLinkCard
                    title="Attendance"
                    value={`${attendance.length} records`}
                    description="Track presence, lateness, and work hours"
                    icon={<CalendarDays className="h-4 w-4" />}
                    onOpen={() => router.push(employeeRoute(`/employees/${employeeId}/attendance`))}
                  />
                  <QuickLinkCard
                    title="Documents"
                    value={`${documents.length} files`}
                    description="Contracts, IDs, and compliance documents"
                    icon={<FileText className="h-4 w-4" />}
                    onOpen={() => router.push(employeeRoute(`/employees/${employeeId}/documents`))}
                  />
                  <QuickLinkCard
                    title="Workflows"
                    value={`${workflows.length} tasks`}
                    description="Onboarding and offboarding checklists"
                    icon={<ClipboardList className="h-4 w-4" />}
                    onOpen={() => router.push(employeeRoute(`/employees/${employeeId}/workflows`))}
                  />
                  <QuickLinkCard
                    title="Compensation"
                    value={formatCurrency(compensation?.netPay, compensation?.currency || "USD")}
                    description="Payroll package and net pay summary"
                    icon={<Wallet className="h-4 w-4" />}
                    onOpen={() => router.push(employeeRoute(`/employees/${employeeId}/compensation`))}
                  />
                </div>
              </TabsContent>

              <TabsContent value="contacts">
                <EmployeeContactsTab
                  contacts={employee.contacts}
                  onAddContact={() => setShowAddContact(true)}
                />
              </TabsContent>

              <TabsContent value="dependents">
                <EmployeeDependentsTab
                  dependents={employee.dependents}
                  onAddDependent={() => setShowAddDependent(true)}
                />
              </TabsContent>

              <TabsContent value="leave">
                <div className="space-y-6">
                  <EmployeeLeaveTab
                    leaveBalances={employee.leaveBalances}
                    leaveRequests={employee.leaveRequests}
                    onManageLeaves={() => router.push(employeeRoute(`/employees/${employeeId}/leave`))}
                  />

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <TrendingUp className="h-4 w-4" />
                        Performance Snapshot
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {performanceReviews.length} performance review records available for this employee.
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => router.push(employeeRoute(`/employees/${employeeId}/performance`))}
                      >
                        Open Performance
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        ) : null}
      </PageLayout>

      {employee ? (
        <>
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
            onSubmit={handleEdit}
            submitting={update.isPending}
          />
        </>
      ) : null}
    </>
  );
}

function QuickLinkCard({
  title,
  value,
  description,
  icon,
  onOpen,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  onOpen: () => void;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-sm font-semibold">
          <span>{title}</span>
          {icon}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xl font-semibold">{value}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
        <Button variant="outline" onClick={onOpen}>
          View {title}
        </Button>
      </CardContent>
    </Card>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-40 w-full rounded-xl" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Skeleton className="h-72 rounded-xl" />
        <Skeleton className="h-72 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-40 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

