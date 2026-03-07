"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/shared/data-table";
import {
    useTransactionTypes,
    useTransactionTypeMutations,
} from "@/hooks/use-finance";
import { showToast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/utils/error-handler";
import { columns } from "./columns";
import { CreateDialog } from "./create-dialog";
import { EditDialog } from "./edit-dialog";
import { DeleteDialog } from "./delete-dialog";
import type { TransactionTypeDto } from "@/lib/api2/finance-types";
import PageLayout from "@/components/dashboard/page-layout";
import { SelectField } from "@/components/ui/select-field";

export function TransactionTypesList() {
  const [typeFilter, setTypeFilter] = useState<"income" | "expense" | "all">(
    "all",
  );
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedType, setSelectedType] = useState<TransactionTypeDto | null>(
    null,
  );

  const { data: types = [], isLoading, error } = useTransactionTypes();
  const mutations = useTransactionTypeMutations();

  const handleEdit = (type: TransactionTypeDto) => {
    setSelectedType(type);
    setShowEditDialog(true);
  };

  const handleDelete = (type: TransactionTypeDto) => {
    setSelectedType(type);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedType) return;

    try {
      await mutations.remove.mutateAsync(selectedType.id);
      showToast.success("Transaction type deleted successfully");
      setShowDeleteDialog(false);
      setSelectedType(null);
    } catch (error) {
      showToast.error(getErrorMessage(error));
    }
  };

  const tableColumns = columns(handleEdit, handleDelete);

  const filteredTypes = types.filter(
    (type) => typeFilter === "all" || type.type === typeFilter,
  );

  const typeOptions = [
    { value: "all", label: "All Types" },
    { value: "income", label: "Income" },
    { value: "expense", label: "Expense" },
  ];
  
  return (
    <PageLayout
      title="Transaction Types"
      description="Manage transaction categories and labels"
      actions={
        <div className="flex items-center justify-between gap-4">
          <Button
            onClick={() => setShowCreateDialog(true)}
            icon={<Plus className="h-4 w-4" />}
          >
            New Transaction Type
          </Button>
        </div>
      }
      loading={isLoading}
        error={error}
    >
      <div className="space-y-4">
        <DataTable
          columns={tableColumns}
          data={filteredTypes}
          searchKey="name"
          searchPlaceholder="Search transaction types..."
          filters={
            <SelectField
             items={typeOptions}
             value={typeFilter}
             onValueChange={(value) => setTypeFilter(value as any)}
          />
        }
        />

        <CreateDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onSuccess={() => setShowCreateDialog(false)}
        />

        {selectedType && (
          <>
            <EditDialog
              open={showEditDialog}
              onOpenChange={setShowEditDialog}
              type={selectedType}
              onSuccess={() => {
                setShowEditDialog(false);
                setSelectedType(null);
              }}
            />

            <DeleteDialog
              open={showDeleteDialog}
              onOpenChange={setShowDeleteDialog}
              type={selectedType}
              onConfirm={handleDeleteConfirm}
              isLoading={mutations.remove.isPending}
            />
          </>
        )}
      </div>
    </PageLayout>
  );
}
