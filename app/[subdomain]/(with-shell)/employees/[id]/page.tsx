"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { PageContent } from "@/components/dashboard/page-content";
import { EmployeeDetailHeader } from "@/components/employees/employee-detail-header";
import { EmployeeOverviewTab } from "@/components/employees/employee-overview-tab";
import { EmployeeContactsTab } from "@/components/employees/employee-contacts-tab";
import { EmployeeDependentsTab } from "@/components/employees/employee-dependents-tab";
import { useTenantSubdomain } from "@/hooks/use-tenant-subdomain";
import { cn } from "@/lib/utils";
import { TerminateEmployeeDialog } from "@/components/employees/terminate-employee-dialog";
import { AddContactSheet } from "@/components/employees/add-contact-sheet";
import { AddDependentSheet } from "@/components/employees/add-dependent-sheet";
import { EmployeeFormModal } from "@/components/employees/employee-form";
import type { UpdateEmployeeCommand } from "@/lib/api/employee-types";
import { useEmployeeDetail, useEmployeeMutations } from "@/hooks/use-employee";
import { Skeleton } from "@/components/ui/skeleton";

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "contacts", label: "Contacts" },
  { key: "dependents", label: "Dependents" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function EmployeeDetailPage() {
  const subdomain = useTenantSubdomain();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState<TabKey>("overview");
  const [showTerminate, setShowTerminate] = React.useState(false);
  const [showAddContact, setShowAddContact] = React.useState(false);
  const [showAddDependent, setShowAddDependent] = React.useState(false);
  const [showEditModal, setShowEditModal] = React.useState(false);

  const { data: employee, isLoading } = useEmployeeDetail(params.id);
  const { update } = useEmployeeMutations();

  if (isLoading) {
    return (
      <PageContent>
        {/* Header skeleton */}
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

        {/* Tab bar skeleton */}
        <div className="flex items-center gap-1 border-b">
          <Skeleton className="h-5 w-20 mx-4 my-2.5" />
          <Skeleton className="h-5 w-20 mx-4 my-2.5" />
          <Skeleton className="h-5 w-24 mx-4 my-2.5" />
        </div>

        {/* Tab content skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

      {/* Tab navigation */}
      <div className="flex items-center gap-1 border-b">
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

      {/* Tab content */}
      {activeTab === "overview" && (
        <EmployeeOverviewTab employee={employee} />
      )}
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

      {/* Terminate dialog */}
      <TerminateEmployeeDialog
        employee={employee}
        open={showTerminate}
        onOpenChange={setShowTerminate}
      />

      {/* Add contact sheet */}
      <AddContactSheet
        employeeId={employee.id}
        open={showAddContact}
        onOpenChange={setShowAddContact}
      />

      {/* Add dependent sheet */}
      <AddDependentSheet
        employeeId={employee.id}
        open={showAddDependent}
        onOpenChange={setShowAddDependent}
      />

      {/* Edit employee modal */}
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
