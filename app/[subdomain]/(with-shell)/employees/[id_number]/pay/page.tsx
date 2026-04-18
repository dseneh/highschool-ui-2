"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { Add01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import PageLayout from "@/components/dashboard/page-layout";
import RefreshButton from "@/components/shared/refresh-button";
import { Button } from "@/components/ui/button";
import { EmployeeCompensationPanel } from "@/components/employees/employee-compensation-panel";
import { CompensationFormModal } from "@/components/payroll/compensation-form-modal";
import { useEmployee } from "@/lib/api2/employee";
import {
  useEmployeeCompensation,
  usePayrollComponents,
  usePayrollMutations,
} from "@/hooks/use-payroll";
import { showToast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/utils";
import { useHasRole } from "@/hooks/use-authorization";
import type { CreateEmployeeCompensationCommand } from "@/lib/api2/payroll-types";
import type { EmployeeDto as CamelEmployeeDto } from "@/lib/api2/employee-types";

export default function EmployeePayPage() {
  const params = useParams();
  const idNumber = params.id_number as string;

  const employeeApi = useEmployee();
  const { data: employee, isLoading: employeeLoading } = employeeApi.getEmployeeMember(idNumber, {
    enabled: !!idNumber && window.location.href.includes("/employees/"),
  });

  const {
    data: compensations = [],
    isLoading: compLoading,
    isFetching,
    error,
    refetch,
  } = useEmployeeCompensation(employee?.id, { enabled: !!employee?.id });

  const { data: components = [], isLoading: componentsLoading } = usePayrollComponents();
  const { createCompensation, updateCompensation, removeCompensation } = usePayrollMutations();

  const canManage = useHasRole("admin");
  const isLoading = employeeLoading || compLoading || componentsLoading;
  const compensation = compensations[0] ?? undefined;

  // Map snake_case employee to camelCase shape for compensation modal
  const employeeForModal: CamelEmployeeDto | undefined = React.useMemo(() => {
    if (!employee) return undefined;
    return {
      id: employee.id,
      fullName: employee.full_name,
      employeeNumber: employee.id_number,
      photoUrl: employee.photo_url ?? null,
    } as CamelEmployeeDto;
  }, [employee]);

  const [modalOpen, setModalOpen] = React.useState(false);
  const [editing, setEditing] = React.useState(false);

  const handleCreate = () => {
    setEditing(false);
    setModalOpen(true);
  };

  const handleEdit = () => {
    setEditing(true);
    setModalOpen(true);
  };

  const handleDelete = async () => {
    if (!compensation) return;
    try {
      await removeCompensation.mutateAsync(compensation.id);
      showToast.success("Removed", "Compensation package has been removed");
      refetch();
    } catch (err) {
      showToast.error("Failed", getErrorMessage(err));
    }
  };

  const handleSubmit = async (data: CreateEmployeeCompensationCommand) => {
    try {
      if (editing && compensation) {
        await updateCompensation.mutateAsync({ id: compensation.id, payload: data });
        showToast.success("Updated", "Compensation package updated");
      } else {
        await createCompensation.mutateAsync(data);
        showToast.success("Created", "Compensation package created");
      }
      setModalOpen(false);
      refetch();
    } catch (err) {
      showToast.error("Failed", getErrorMessage(err));
    }
  };

  return (
    <PageLayout
      title="Pay"
      description="Compensation package, earnings, and deductions"
      actions={
        <div className="flex items-center gap-2">
          {canManage && !compensation && !isLoading ? (
            <Button
              size="sm"
              icon={<HugeiconsIcon icon={Add01Icon} size={16} />}
              onClick={handleCreate}
            >
              Add Compensation
            </Button>
          ) : null}
          <RefreshButton onClick={refetch} loading={isLoading || isFetching} />
        </div>
      }
      error={error}
      loading={isLoading}
    >
      <EmployeeCompensationPanel
        compensation={compensation}
        components={components}
        onEdit={canManage ? handleEdit : undefined}
        onDelete={canManage ? handleDelete : undefined}
        loading={isLoading}
      />

      {employeeForModal ? (
        <CompensationFormModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          onSubmit={handleSubmit}
          isSubmitting={createCompensation.isPending || updateCompensation.isPending}
          employees={[employeeForModal]}
          components={components}
          initialData={editing ? compensation : undefined}
          hideEmployeeSelect
        />
      ) : null}
    </PageLayout>
  );
}
