"use client";

import * as React from "react";
import {
  Calendar01Icon,
  Clock01Icon,
  UserGroupIcon,
  Alert02Icon,
} from "@hugeicons/core-free-icons";
import { Plus } from "lucide-react";
import { AuthButton } from "@/components/auth/auth-button";
import PageLayout from "@/components/dashboard/page-layout";
import { StatsCards, type StatsCardItem } from "@/components/shared/stats-cards";
import EmptyStateComponent from "@/components/shared/empty-state";
import RefreshButton from "@/components/shared/refresh-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmployeeAttendanceFormModal } from "@/components/employees/employee-attendance-form-modal";
import { EmployeeAttendanceTable } from "@/components/employees/employee-attendance-table";
import { useEmployees } from "@/hooks/use-employee";
import { useEmployeeAttendance, useEmployeeAttendanceMutations } from "@/hooks/use-employee-attendance";
import type { CreateEmployeeAttendanceCommand } from "@/lib/api2/employee-attendance-types";
import { showToast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/utils";

export default function EmployeeAttendancePage() {
  const { data: records = [], isLoading, error, isFetching, refetch } = useEmployeeAttendance();
  const { data: employees = [] } = useEmployees();
  const { create } = useEmployeeAttendanceMutations();

  const [showAttendanceModal, setShowAttendanceModal] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const presentCount = records.filter((item) => item.status.toLowerCase() === "present").length;
  const lateCount = records.filter((item) => item.status.toLowerCase() === "late").length;
  const absentCount = records.filter((item) => item.status.toLowerCase() === "absent").length;
  const averageHours = records.length > 0
    ? records.reduce((sum, item) => sum + item.hoursWorked, 0) / records.length
    : 0;

  const statsItems = React.useMemo<StatsCardItem[]>(
    () => [
      {
        title: "Attendance Records",
        value: String(records.length),
        subtitle: "Logged employee workdays",
        icon: UserGroupIcon,
      },
      {
        title: "Present",
        value: String(presentCount),
        subtitle: "On-time records",
        icon: Calendar01Icon,
      },
      {
        title: "Late / Absent",
        value: String(lateCount + absentCount),
        subtitle: `${lateCount} late • ${absentCount} absent`,
        icon: Alert02Icon,
      },
      {
        title: "Average Hours",
        value: averageHours.toFixed(1),
        subtitle: "Hours worked per record",
        icon: Clock01Icon,
      },
    ],
    [absentCount, averageHours, lateCount, presentCount, records.length]
  );

  const handleCreateAttendance = async (payload: CreateEmployeeAttendanceCommand) => {
    setIsSubmitting(true);
    try {
      await create.mutateAsync(payload);
      showToast.success("Attendance saved", "Employee attendance record created successfully");
      setShowAttendanceModal(false);
      refetch();
    } catch (submitError) {
      showToast.error("Create failed", getErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageLayout
      title="Employee Attendance"
      description="Track daily attendance, lateness, work hours, and notes for employees"
      actions={
        <div className="flex items-center gap-2">
          <AuthButton roles="admin" disable onClick={() => setShowAttendanceModal(true)} icon={<Plus />}>
            Add Attendance
          </AuthButton>
          <RefreshButton onClick={refetch} loading={isLoading || isFetching} />
        </div>
      }
      error={error}
      loading={isLoading}
      emptyState={
        <EmptyStateComponent
          title="No attendance records yet"
          description="Start by adding the first employee attendance entry."
          actionTitle="Add Attendance"
          handleAction={() => setShowAttendanceModal(true)}
        />
      }
      noData={!isLoading && records.length === 0}
    >
      <div className="space-y-6">
        <StatsCards items={statsItems} className="xl:grid-cols-4" />

        <Card>
          <CardHeader>
            <CardTitle>Attendance Records</CardTitle>
          </CardHeader>
          <CardContent>
            <EmployeeAttendanceTable records={records} employees={employees} onRefresh={refetch} />
          </CardContent>
        </Card>
      </div>

      <EmployeeAttendanceFormModal
        open={showAttendanceModal}
        onOpenChange={setShowAttendanceModal}
        onSubmit={handleCreateAttendance}
        isSubmitting={isSubmitting}
        employees={employees}
      />
    </PageLayout>
  );
}
