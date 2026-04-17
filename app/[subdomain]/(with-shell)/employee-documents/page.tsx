"use client";

import * as React from "react";
import {
  Alert02Icon,
  Calendar01Icon,
  FileIcon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { Plus } from "lucide-react";
import { AuthButton } from "@/components/auth/auth-button";
import PageLayout from "@/components/dashboard/page-layout";
import { StatsCards, type StatsCardItem } from "@/components/shared/stats-cards";
import EmptyStateComponent from "@/components/shared/empty-state";
import RefreshButton from "@/components/shared/refresh-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmployeeDocumentFormModal } from "@/components/employees/employee-document-form-modal";
import { EmployeeDocumentsTable } from "@/components/employees/employee-documents-table";
import { useEmployees } from "@/hooks/use-employee";
import { useEmployeeDocumentMutations, useEmployeeDocuments } from "@/hooks/use-employee-documents";
import type { CreateEmployeeDocumentCommand } from "@/lib/api2/employee-document-types";
import { showToast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/utils";

export default function EmployeeDocumentsPage() {
  const { data: records = [], isLoading, error, isFetching, refetch } = useEmployeeDocuments();
  const { data: employees = [] } = useEmployees();
  const { create } = useEmployeeDocumentMutations();

  const [showDocumentModal, setShowDocumentModal] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const validCount = records.filter((item) => item.complianceStatus.toLowerCase() === "valid").length;
  const expiringSoonCount = records.filter((item) => item.complianceStatus.toLowerCase() === "expiring soon").length;
  const expiredCount = records.filter((item) => item.complianceStatus.toLowerCase() === "expired").length;
  const coveredEmployeesCount = new Set(records.map((item) => item.employeeId).filter(Boolean)).size;

  const statsItems = React.useMemo<StatsCardItem[]>(
    () => [
      {
        title: "Documents on File",
        value: String(records.length),
        subtitle: "Contracts, permits, and certifications",
        icon: FileIcon,
      },
      {
        title: "Covered Employees",
        value: String(coveredEmployeesCount),
        subtitle: "Employees with at least one document",
        icon: UserGroupIcon,
      },
      {
        title: "Expiring Soon",
        value: String(expiringSoonCount),
        subtitle: "Renewals due within 30 days",
        icon: Calendar01Icon,
      },
      {
        title: "Expired",
        value: String(expiredCount),
        subtitle: `${validCount} currently valid`,
        icon: Alert02Icon,
      },
    ],
    [coveredEmployeesCount, expiredCount, expiringSoonCount, records.length, validCount]
  );

  const handleCreateDocument = async (payload: CreateEmployeeDocumentCommand) => {
    setIsSubmitting(true);
    try {
      await create.mutateAsync(payload);
      showToast.success("Document saved", "Employee document created successfully");
      setShowDocumentModal(false);
      refetch();
    } catch (submitError) {
      showToast.error("Create failed", getErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageLayout
      title="Employee Documents"
      description="Manage contracts, IDs, certificates, licenses, and renewal compliance for employees"
      actions={
        <div className="flex items-center gap-2">
          <AuthButton roles="admin" disable onClick={() => setShowDocumentModal(true)} icon={<Plus />}>
            Add Document
          </AuthButton>
          <RefreshButton onClick={refetch} loading={isLoading || isFetching} />
        </div>
      }
      error={error}
      loading={isLoading}
      emptyState={
        <EmptyStateComponent
          title="No employee documents yet"
          description="Start by recording the first employee contract, permit, or certification."
          actionTitle="Add Document"
          handleAction={() => setShowDocumentModal(true)}
        />
      }
      noData={!isLoading && records.length === 0}
    >
      <div className="space-y-6">
        <StatsCards items={statsItems} className="mb-0 xl:grid-cols-4" />

        <Card>
          <CardHeader>
            <CardTitle>Document Registry</CardTitle>
          </CardHeader>
          <CardContent>
            <EmployeeDocumentsTable records={records} employees={employees} onRefresh={refetch} />
          </CardContent>
        </Card>
      </div>

      <EmployeeDocumentFormModal
        open={showDocumentModal}
        onOpenChange={setShowDocumentModal}
        onSubmit={handleCreateDocument}
        isSubmitting={isSubmitting}
        employees={employees}
      />
    </PageLayout>
  );
}
