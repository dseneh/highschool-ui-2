"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/shared/data-table";
import { usePaymentMethods, usePaymentMethodMutations } from "@/hooks/use-finance";
import { showToast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/utils/error-handler";
import { columns } from "./columns";
import { CreateDialog } from "./create-dialog";
import { EditDialog } from "./edit-dialog";
import { DeleteDialog } from "./delete-dialog";
import type { PaymentMethodDto } from "@/lib/api/finance-types";
import PageLayout from '@/components/dashboard/page-layout';

export function PaymentMethodsList() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodDto | null>(null);

  const { data: methods = [] } = usePaymentMethods();
  const mutations = usePaymentMethodMutations();

  const handleEdit = (method: PaymentMethodDto) => {
    setSelectedMethod(method);
    setShowEditDialog(true);
  };

  const handleDelete = (method: PaymentMethodDto) => {
    setSelectedMethod(method);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedMethod) return;

    try {
      await mutations.remove.mutateAsync(selectedMethod.id);
      showToast.success("Payment method deleted successfully");
      setShowDeleteDialog(false);
      setSelectedMethod(null);
    } catch (error) {
      showToast.error(getErrorMessage(error));
    }
  };

  const tableColumns = columns(handleEdit, handleDelete);

  return (
    <PageLayout
          title="Payment Methods"
          description="Manage accepted payment options"
          actions={
              <Button
          onClick={() => setShowCreateDialog(true)}
          icon={<Plus className="h-4 w-4" />}
        >
          New Payment Method
        </Button>
          }
        >
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1" />
      
      </div>

      <DataTable
        columns={tableColumns}
        data={methods}
        searchKey="name"
        searchPlaceholder="Search payment methods..."
      />

      <CreateDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={() => setShowCreateDialog(false)}
      />

      {selectedMethod && (
        <>
          <EditDialog
            open={showEditDialog}
            onOpenChange={setShowEditDialog}
            method={selectedMethod}
            onSuccess={() => {
              setShowEditDialog(false);
              setSelectedMethod(null);
            }}
          />

          <DeleteDialog
            open={showDeleteDialog}
            onOpenChange={setShowDeleteDialog}
            method={selectedMethod}
            onConfirm={handleDeleteConfirm}
            isLoading={mutations.remove.isPending}
          />
        </>
      )}
    </div>
    </PageLayout>
  );
}
