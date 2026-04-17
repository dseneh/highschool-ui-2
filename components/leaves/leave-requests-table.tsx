"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdvancedTableColumnHeader } from "@/components/shared/advanced-table";
import { AccountingAdvancedTable } from "@/components/accounting/accounting-advanced-table";
import { CheckCheck, MoreVertical, XCircle, CircleOff } from "lucide-react";
import type { LeaveRequestDto } from "@/lib/api2/leave-types";
import AlertDialogBox from "@/components/shared/alert-dialogbox";

interface LeaveRequestsTableProps {
  requests: LeaveRequestDto[];
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
  onCancel: (id: string) => Promise<void>;
}

function formatDate(value: string) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();

  if (normalized === "approved") {
    return <Badge>Approved</Badge>;
  }
  if (normalized === "rejected") {
    return <Badge variant="destructive">Rejected</Badge>;
  }
  if (normalized === "cancelled") {
    return <Badge variant="outline">Cancelled</Badge>;
  }
  return <Badge variant="secondary">Pending</Badge>;
}

export function LeaveRequestsTable({
  requests,
  onApprove,
  onReject,
  onCancel,
}: LeaveRequestsTableProps) {
  const leaveTypeFilterOptions = React.useMemo(
    () =>
      Array.from(new Set(requests.map((request) => request.leaveTypeName)))
        .filter(Boolean)
        .map((value) => ({ label: value, value })),
    [requests]
  );

  const [confirmAction, setConfirmAction] = React.useState<{
    id: string;
    type: "approve" | "reject" | "cancel";
  } | null>(null);

  const handleConfirmAction = async () => {
    if (!confirmAction) return;
    const { id, type } = confirmAction;
    if (type === "approve") await onApprove(id);
    else if (type === "reject") await onReject(id);
    else await onCancel(id);
  };

  const confirmDialogConfig = confirmAction
    ? confirmAction.type === "approve"
      ? { title: "Approve Leave Request", description: "Are you sure you want to approve this leave request?", actionLabel: "Approve", variant: "default" }
      : confirmAction.type === "reject"
      ? { title: "Reject Leave Request", description: "Are you sure you want to reject this leave request?", actionLabel: "Reject", variant: "destructive" }
      : { title: "Cancel Leave Request", description: "Are you sure you want to cancel this leave request?", actionLabel: "Cancel", variant: "destructive" }
    : null;

  const columns: ColumnDef<LeaveRequestDto>[] = [
    {
      accessorKey: "employeeName",
      header: ({ column }) => <AdvancedTableColumnHeader column={column} title="Employee" />,
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.employeeName}</p>
          <p className="text-sm text-muted-foreground">{row.original.employeeNumber || "No employee number"}</p>
        </div>
      ),
    },
    {
      accessorKey: "leaveTypeName",
      header: ({ column }) => <AdvancedTableColumnHeader column={column} title="Leave Type" />,
      cell: ({ row }) => row.original.leaveTypeName,
      filterFn: (row, id, value) => {
        if (!value || !Array.isArray(value) || value.length === 0) return true;
        return value.includes(String(row.getValue(id)));
      },
      meta: {
        displayName: "Leave Type",
        filterType: "checkbox",
        filterOptions: leaveTypeFilterOptions,
        filterSummaryMode: "count",
      } as never,
    },
    {
      id: "dates",
      header: ({ column }) => <AdvancedTableColumnHeader column={column} title="Dates" />,
      cell: ({ row }) => (
        <div>
          <p>{formatDate(row.original.startDate)}</p>
          <p className="text-sm text-muted-foreground">to {formatDate(row.original.endDate)}</p>
        </div>
      ),
    },
    {
      accessorKey: "totalDays",
      header: ({ column }) => <AdvancedTableColumnHeader column={column} title="Days" />,
    },
    {
      accessorKey: "status",
      header: ({ column }) => <AdvancedTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
      filterFn: (row, id, value) => {
        if (!value) return true;
        return String(row.getValue(id)).toLowerCase() === String(value).toLowerCase();
      },
      meta: {
        displayName: "Status",
        filterType: "select",
        filterOptions: [
          { label: "Pending", value: "Pending" },
          { label: "Approved", value: "Approved" },
          { label: "Rejected", value: "Rejected" },
          { label: "Cancelled", value: "Cancelled" },
        ],
      } as never,
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const request = row.original;
        const isPending = request.status.toLowerCase() === "pending";

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" icon={<MoreVertical />} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuCheckboxItem
                checked={false}
                disabled={!isPending}
                onClick={() => {
                  if (isPending) setConfirmAction({ id: request.id, type: "approve" });
                }}
                className="flex items-center gap-2"
              >
                <CheckCheck className="h-4 w-4" />
                Approve
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={false}
                disabled={!isPending}
                onClick={() => {
                  if (isPending) setConfirmAction({ id: request.id, type: "reject" });
                }}
                className="flex items-center gap-2 text-red-600"
              >
                <XCircle className="h-4 w-4" />
                Reject
              </DropdownMenuCheckboxItem>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={false}
                onClick={() => {
                  setConfirmAction({ id: request.id, type: "cancel" });
                }}
                className="flex items-center gap-2"
              >
                <CircleOff className="h-4 w-4" />
                Cancel
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <>
      <AccountingAdvancedTable
        columns={columns}
        data={requests}
        noData={requests.length === 0}
        emptyStateTitle="No Leave Requests"
        emptyStateDescription="There are no leave requests to display."
        pageSize={10}
        searchPlaceholder="Search leave requests..."
        searchPredicate={(row, normalizedSearch) =>
          row.employeeName.toLowerCase().includes(normalizedSearch) ||
          (row.employeeNumber || "").toLowerCase().includes(normalizedSearch) ||
          row.leaveTypeName.toLowerCase().includes(normalizedSearch) ||
          row.status.toLowerCase().includes(normalizedSearch)
        }
      />

      <AlertDialogBox
        open={confirmAction !== null}
        onOpenChange={(open) => { if (!open) setConfirmAction(null); }}
        title={confirmDialogConfig?.title ?? ""}
        description={confirmDialogConfig?.description ?? ""}
        actionLabel={confirmDialogConfig?.actionLabel}
        variant={confirmDialogConfig?.variant}
        onConfirm={handleConfirmAction}
      />
    </>
  );
}
