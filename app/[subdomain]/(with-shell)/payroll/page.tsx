"use client";

import * as React from "react";
import {
  Coins01Icon,
  Briefcase01Icon,
  Invoice01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { Plus } from "lucide-react";
import { AuthButton } from "@/components/auth/auth-button";
import PageLayout from "@/components/dashboard/page-layout";
import EmptyStateComponent from "@/components/shared/empty-state";
import RefreshButton from "@/components/shared/refresh-button";
import { StatsCards, type StatsCardItem } from "@/components/shared/stats-cards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CompensationFormModal } from "@/components/payroll/compensation-form-modal";
import { CompensationTable } from "@/components/payroll/compensation-table";
import { PayrollComponentFormModal } from "@/components/payroll/payroll-component-form-modal";
import { PayrollComponentsTable } from "@/components/payroll/payroll-components-table";
import { PayrollRunFormModal } from "@/components/payroll/payroll-run-form-modal";
import { PayrollRunsTable } from "@/components/payroll/payroll-runs-table";
import { useEmployees } from "@/hooks/use-employee";
import { useEmployeeCompensations, usePayrollComponents, usePayrollMutations, usePayrollRuns } from "@/hooks/use-payroll";
import type { CreateEmployeeCompensationCommand, CreatePayrollComponentCommand, CreatePayrollRunCommand } from "@/lib/api2/payroll-types";
import { showToast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/utils";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

export default function PayrollPage() {
  const { data: compensations = [], isLoading, error, isFetching, refetch } = useEmployeeCompensations();
  const { data: components = [] } = usePayrollComponents();
  const { data: payrollRuns = [] } = usePayrollRuns();
  const { data: employees = [] } = useEmployees();
  const { createComponent, createCompensation, createRun } = usePayrollMutations();

  const [showComponentModal, setShowComponentModal] = React.useState(false);
  const [showCompensationModal, setShowCompensationModal] = React.useState(false);
  const [showRunModal, setShowRunModal] = React.useState(false);
  const [isSubmittingComponent, setIsSubmittingComponent] = React.useState(false);
  const [isSubmittingCompensation, setIsSubmittingCompensation] = React.useState(false);
  const [isSubmittingRun, setIsSubmittingRun] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("compensation");

  const totalNetPay = compensations.reduce((sum, item) => sum + item.netPay, 0);
  const totalBasePay = compensations.reduce((sum, item) => sum + item.baseSalary, 0);
  const deductionComponents = components.filter((item) => item.componentType.toLowerCase() === "deduction").length;
  const processedRuns = payrollRuns.filter((item) => ["Completed", "Paid"].includes(item.status)).length;

  const statsItems = React.useMemo<StatsCardItem[]>(
    () => [
      {
        title: "Compensation Packages",
        value: String(compensations.length),
        subtitle: "Employees with active pay setup",
        icon: UserGroupIcon,
      },
      {
        title: "Payroll Components",
        value: String(components.length),
        subtitle: `${deductionComponents} deductions configured`,
        icon: Invoice01Icon,
      },
      {
        title: "Processed Runs",
        value: String(processedRuns),
        subtitle: "Completed or paid payroll batches",
        icon: Briefcase01Icon,
      },
      {
        title: "Monthly Base Payroll",
        value: formatCurrency(totalBasePay),
        subtitle: "Base salary commitments",
        icon: Briefcase01Icon,
      },
      {
        title: "Net Payroll",
        value: formatCurrency(totalNetPay),
        subtitle: "Estimated take-home total",
        icon: Coins01Icon,
      },
    ],
    [compensations.length, components.length, deductionComponents, processedRuns, totalBasePay, totalNetPay]
  );

  const handleCreateComponent = async (payload: CreatePayrollComponentCommand) => {
    setIsSubmittingComponent(true);
    try {
      await createComponent.mutateAsync(payload);
      showToast.success("Component created", "Payroll component added successfully");
      setShowComponentModal(false);
      refetch();
    } catch (submitError) {
      showToast.error("Create failed", getErrorMessage(submitError));
    } finally {
      setIsSubmittingComponent(false);
    }
  };

  const handleCreateCompensation = async (payload: CreateEmployeeCompensationCommand) => {
    setIsSubmittingCompensation(true);
    try {
      await createCompensation.mutateAsync(payload);
      showToast.success("Compensation saved", "Employee compensation package created successfully");
      setShowCompensationModal(false);
      refetch();
    } catch (submitError) {
      showToast.error("Create failed", getErrorMessage(submitError));
    } finally {
      setIsSubmittingCompensation(false);
    }
  };

  const handleCreateRun = async (payload: CreatePayrollRunCommand) => {
    setIsSubmittingRun(true);
    try {
      await createRun.mutateAsync(payload);
      showToast.success("Payroll run created", "The payroll run has been added successfully");
      setShowRunModal(false);
      refetch();
    } catch (submitError) {
      showToast.error("Create failed", getErrorMessage(submitError));
    } finally {
      setIsSubmittingRun(false);
    }
  };

  return (
    <PageLayout
      title="Payroll & Compensation"
      description="Manage recurring earnings, deductions, and employee compensation packages"
      actions={
        <div className="flex items-center gap-2">
          {activeTab === "components" ? (
            <AuthButton roles="admin" disable onClick={() => setShowComponentModal(true)} icon={<Plus />}>
              Add Component
            </AuthButton>
          ) : activeTab === "runs" ? (
            <AuthButton roles="admin" disable onClick={() => setShowRunModal(true)} icon={<Plus />}>
              New Payroll Run
            </AuthButton>
          ) : (
            <AuthButton roles="admin" disable onClick={() => setShowCompensationModal(true)} icon={<Plus />}>
              New Package
            </AuthButton>
          )}
          <RefreshButton onClick={refetch} loading={isLoading || isFetching} />
        </div>
      }
      error={error}
      loading={isLoading}
      emptyState={
        <EmptyStateComponent
          title="No payroll setup yet"
          description="Create payroll components and assign the first compensation package to an employee."
          actionTitle="New Package"
          handleAction={() => setShowCompensationModal(true)}
        />
      }
      noData={!isLoading && compensations.length === 0 && components.length === 0 && payrollRuns.length === 0}
    >
      <div className="space-y-6">
        <StatsCards items={statsItems} className="mb-0 xl:grid-cols-5" />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <Card>
            <CardHeader className="gap-4">
              <div className="space-y-1">
                <CardTitle>Payroll Workspace</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Switch between employee compensation packages and reusable payroll components.
                </p>
              </div>
              <TabsList variant="line" className="w-full sm:max-w-xl">
                <TabsTrigger value="compensation">Compensation Packages</TabsTrigger>
                <TabsTrigger value="components">Payroll Components</TabsTrigger>
                <TabsTrigger value="runs">Payroll Runs</TabsTrigger>
              </TabsList>
            </CardHeader>
            <CardContent>
              <TabsContent value="compensation" className="mt-0">
                <CompensationTable
                  compensations={compensations}
                  employees={employees}
                  components={components}
                  onRefresh={refetch}
                />
              </TabsContent>

              <TabsContent value="components" className="mt-0">
                <PayrollComponentsTable components={components} onRefresh={refetch} />
              </TabsContent>

              <TabsContent value="runs" className="mt-0">
                <PayrollRunsTable payrollRuns={payrollRuns} onRefresh={refetch} />
              </TabsContent>
            </CardContent>
          </Card>
        </Tabs>
      </div>

      <CompensationFormModal
        open={showCompensationModal}
        onOpenChange={setShowCompensationModal}
        onSubmit={handleCreateCompensation}
        isSubmitting={isSubmittingCompensation}
        employees={employees}
        components={components}
      />

      <PayrollComponentFormModal
        open={showComponentModal}
        onOpenChange={setShowComponentModal}
        onSubmit={handleCreateComponent}
        isSubmitting={isSubmittingComponent}
      />

      <PayrollRunFormModal
        open={showRunModal}
        onOpenChange={setShowRunModal}
        onSubmit={handleCreateRun}
        isSubmitting={isSubmittingRun}
      />
    </PageLayout>
  );
}
