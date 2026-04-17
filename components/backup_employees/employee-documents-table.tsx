"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Edit2, MoreVertical, Trash2 } from "lucide-react";
import { AccountingAdvancedTable } from "@/components/accounting/accounting-advanced-table";
import { AdvancedTableColumnHeader } from "@/components/shared/advanced-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEmployeeDocumentMutations } from "@/hooks/use-employee-documents";
import type { EmployeeDto } from "@/lib/api2/employee-types";
import type {
  CreateEmployeeDocumentCommand,
  EmployeeDocumentDto,
} from "@/lib/api2/employee-document-types";
import { showToast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/utils";
import { EmployeeDocumentFormModal } from "./employee-document-form-modal";

interface EmployeeDocumentsTableProps {
  records: EmployeeDocumentDto[];
  employees: EmployeeDto[];
  onRefresh: () => void;
}

function formatDate(value: string | null) {
  if (!value) return "--";
  return new Date(value).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function ComplianceBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();

  if (normalized === "expired") return <Badge variant="destructive">Expired</Badge>;
  if (normalized === "expiring soon") return <Badge variant="secondary">Expiring Soon</Badge>;
  return <Badge variant="outline">Valid</Badge>;
}

export function EmployeeDocumentsTable({ records, employees, onRefresh }: EmployeeDocumentsTableProps) {
  const { remove, update } = useEmployeeDocumentMutations();
  const [editingRecord, setEditingRecord] = React.useState<EmployeeDocumentDto | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const employeeFilterOptions = React.useMemo(
    () =>
      Array.from(new Map(records.map((record) => [record.employeeId, record.employeeName])).entries()).map(
        ([value, label]) => ({ value, label })
      ),
    [records]
  );

  const typeFilterOptions = React.useMemo(
    () =>
      Array.from(new Set(records.map((record) => record.documentType))).map((type) => ({
        value: type,
        label: type,
      })),
    [records]
  );

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this document record?")) {
      return;
    }

    try {
      await remove.mutateAsync(id);
      showToast.success("Deleted", "Employee document removed successfully");
      onRefresh();
    } catch (error) {
      showToast.error("Delete failed", getErrorMessage(error));
    }
  };

  const handleEditSubmit = async (payload: CreateEmployeeDocumentCommand) => {
    if (!editingRecord) return;

    setIsSubmitting(true);
    try {
      await update.mutateAsync({ id: editingRecord.id, payload });
      showToast.success("Updated", "Employee document updated successfully");
      setEditingRecord(null);
      onRefresh();
    } catch (error) {
      showToast.error("Update failed", getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: ColumnDef<EmployeeDocumentDto>[] = [
    {
      accessorKey: "employeeName",
      header: ({ column }) => <AdvancedTableColumnHeader column={column} title="Employee" />,
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.employeeName}</p>
          <p className="text-sm text-muted-foreground">{row.original.employeeNumber || "No employee number"}</p>
        </div>
      ),
      filterFn: (row, id, value) => {
        if (!value || !Array.isArray(value) || value.length === 0) return true;
        return value.includes(row.original.employeeId);
      },
      meta: {
        displayName: "Employee",
        filterType: "checkbox",
        filterOptions: employeeFilterOptions,
        filterSummaryMode: "count",
      } as never,
    },
    {
      accessorKey: "title",
      header: ({ column }) => <AdvancedTableColumnHeader column={column} title="Document" />,
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.title}</p>
          <p className="text-sm text-muted-foreground">{row.original.documentNumber || "No reference number"}</p>
        </div>
      ),
    },
    {
      accessorKey: "documentType",
      header: ({ column }) => <AdvancedTableColumnHeader column={column} title="Type" />,
      cell: ({ row }) => row.original.documentType,
      filterFn: (row, id, value) => {
        if (!value) return true;
        return String(row.getValue(id)).toLowerCase() === String(value).toLowerCase();
      },
      meta: {
        displayName: "Type",
        filterType: "select",
        filterOptions: typeFilterOptions,
      } as never,
    },
    {
      id: "validity",
      header: ({ column }) => <AdvancedTableColumnHeader column={column} title="Validity" />,
      cell: ({ row }) => (
        <div>
          <p className="text-sm">Issued: {formatDate(row.original.issueDate)}</p>
          <p className="text-sm text-muted-foreground">Expires: {formatDate(row.original.expiryDate)}</p>
        </div>
      ),
    },
    {
      accessorKey: "complianceStatus",
      header: ({ column }) => <AdvancedTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => <ComplianceBadge status={row.original.complianceStatus} />,
      filterFn: (row, id, value) => {
        if (!value) return true;
        return String(row.getValue(id)).toLowerCase() === String(value).toLowerCase();
      },
      meta: {
        displayName: "Status",
        filterType: "select",
        filterOptions: [
          { label: "Valid", value: "Valid" },
          { label: "Expiring Soon", value: "Expiring Soon" },
          { label: "Expired", value: "Expired" },
        ],
      } as never,
    },
    {
      accessorKey: "issuingAuthority",
      header: ({ column }) => <AdvancedTableColumnHeader column={column} title="Authority" />,
      cell: ({ row }) => row.original.issuingAuthority || "--",
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" icon={<MoreVertical />} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuCheckboxItem
              checked={editingRecord?.id === row.original.id}
              onClick={() => setEditingRecord(row.original)}
              className="flex items-center gap-2"
            >
              <Edit2 className="h-4 w-4" />
              Edit
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={false}
              onClick={() => handleDelete(row.original.id)}
              className="flex items-center gap-2 text-red-600"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <>
      <AccountingAdvancedTable
        columns={columns}
        data={records}
        pageSize={10}
        searchPlaceholder="Search employee documents..."
        searchPredicate={(row, normalizedSearch) =>
          row.employeeName.toLowerCase().includes(normalizedSearch) ||
          (row.employeeNumber || "").toLowerCase().includes(normalizedSearch) ||
          row.title.toLowerCase().includes(normalizedSearch) ||
          row.documentType.toLowerCase().includes(normalizedSearch) ||
          (row.documentNumber || "").toLowerCase().includes(normalizedSearch) ||
          (row.issuingAuthority || "").toLowerCase().includes(normalizedSearch) ||
          row.complianceStatus.toLowerCase().includes(normalizedSearch)
        }
      />

      <EmployeeDocumentFormModal
        open={Boolean(editingRecord)}
        onOpenChange={(open) => {
          if (!open) setEditingRecord(null);
        }}
        onSubmit={handleEditSubmit}
        isSubmitting={isSubmitting}
        employees={employees}
        initialData={editingRecord ?? undefined}
      />
    </>
  );
}
