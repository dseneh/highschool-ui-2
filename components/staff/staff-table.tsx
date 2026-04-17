"use client";

import * as React from "react";
import type { Table } from "@tanstack/react-table";
import {
  AdvancedTable,
  Searchbar,
  TableFilters,
  TableFiltersInline,
  ViewOptions,
} from "@/components/shared/advanced-table";
import { DialogBox } from "@/components/ui/dialog-box";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/date-picker";
import { Textarea } from "@/components/ui/textarea";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { showToast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/utils/error-handler";
import { useStaff } from "@/lib/api2/staff";
import {
  getStaffColumns,
  type StaffStatusActionType,
} from "./staff-columns";
import type { StaffListItem, StaffListResponse } from "@/lib/api2/staff/types";
import StaffHeader from "./staff-header";

export interface StaffTableUrlParams {
  search: string;
  status: string;
  department: string;
  role: string;
  gender: string;
}

interface StaffTableProps {
  data?: StaffListResponse;
  urlParams: StaffTableUrlParams;
  setUrlParams: (params: StaffTableUrlParams & { page: number }) => void;
  departmentFilterOptions?: Array<{ label: string; value: string }>;
  serverPagination?: {
    totalCount: number;
    currentPage: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
  };
  loading?: boolean;
  onDataChanged?: () => void;
}

function parseCsv(value?: string): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function StaffTable({
  data,
  urlParams,
  setUrlParams,
  departmentFilterOptions = [],
  serverPagination,
  loading,
  onDataChanged,
}: StaffTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const returnToUrl = React.useMemo(() => {
    const qs = searchParams.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }, [pathname, searchParams]);
  const staffApi = useStaff();

  const [tableInstance, setTableInstance] = React.useState<Table<StaffListItem> | null>(null);
  const isApplyingUrlFilters = React.useRef(false);
  const previousColumnFilters = React.useRef<string>("");

  const [deleteStaff, setDeleteStaff] = React.useState<StaffListItem | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [deleteConfirmed, setDeleteConfirmed] = React.useState(false);

  const [statusAction, setStatusAction] = React.useState<{
    type: StaffStatusActionType;
    staff: StaffListItem;
  } | null>(null);
  const [statusActionConfirmed, setStatusActionConfirmed] = React.useState(false);
  const [statusActionDate, setStatusActionDate] = React.useState<Date | undefined>(new Date());
  const [statusActionReason, setStatusActionReason] = React.useState("");

  const [searchInputValue, setSearchInputValue] = React.useState(urlParams.search);
  const isSearchDirty = searchInputValue.trim() !== urlParams.search.trim();

  React.useEffect(() => {
    setSearchInputValue(urlParams.search);
  }, [urlParams.search]);

  const { mutateAsync: performDelete, isPending: isDeleting } =
    staffApi.deleteStaff(deleteStaff?.id || "");

  const { mutateAsync: patchStaffStatus, isPending: isUpdatingStatus } =
    staffApi.patchStaff(statusAction?.staff.id || "");

  const handleDelete = React.useCallback((staff: StaffListItem) => {
    setDeleteStaff(staff);
    setDeleteConfirmed(false);
    setDeleteDialogOpen(true);
  }, []);

  const handleStatusAction = React.useCallback((staff: StaffListItem, action: StaffStatusActionType) => {
    setStatusAction({ staff, type: action });
    setStatusActionConfirmed(false);
    setStatusActionReason("");
    setStatusActionDate(new Date());
  }, []);

  const handleConfirmDelete = async () => {
    if (!deleteStaff) return;

    try {
      await performDelete(undefined);
      showToast.success("Staff member deleted successfully");
      setDeleteDialogOpen(false);
      setDeleteStaff(null);
      setDeleteConfirmed(false);
      onDataChanged?.();
    } catch (error) {
      showToast.error(getErrorMessage(error));
    }
  };

  const getStatusActionConfig = React.useCallback((action: StaffStatusActionType) => {
    switch (action) {
      case "suspend":
        return {
          title: "Suspend staff member",
          description: "This updates the staff member status to suspended. They will remain in the system, but their employment status will reflect the suspension.",
          actionLabel: "Suspend staff",
          loadingText: "Suspending",
          successTitle: "Staff suspended",
          getSuccessMessage: (staff: StaffListItem) => `${staff.full_name} has been suspended.`,
          requiresReason: true,
          requiresDate: true,
          confirmLabel: "I confirm I want to suspend this staff member.",
          buildPayload: (date: string, reason: string) => ({
            status: "suspended",
            suspension_date: date,
            suspension_reason: reason.trim(),
          }),
        };
      case "terminate":
        return {
          title: "Terminate staff member",
          description: "This marks the staff member as terminated. Use this only when employment has officially ended.",
          actionLabel: "Terminate staff",
          loadingText: "Terminating",
          successTitle: "Staff terminated",
          getSuccessMessage: (staff: StaffListItem) => `${staff.full_name} has been marked as terminated.`,
          requiresReason: true,
          requiresDate: true,
          confirmLabel: "I confirm I want to terminate this staff member.",
          buildPayload: (date: string, reason: string) => ({
            status: "terminated",
            termination_date: date,
            termination_reason: reason.trim(),
          }),
        };
      case "mark_on_leave":
        return {
          title: "Mark staff member on leave",
          description: "This updates the staff member status to on leave without removing them from the system.",
          actionLabel: "Mark on leave",
          loadingText: "Updating",
          successTitle: "Staff updated",
          getSuccessMessage: (staff: StaffListItem) => `${staff.full_name} is now marked as on leave.`,
          requiresReason: false,
          requiresDate: false,
          confirmLabel: "I confirm I want to mark this staff member as on leave.",
          buildPayload: () => ({
            status: "on_leave",
          }),
        };
      case "activate":
      default:
        return {
          title: "Restore staff to active",
          description: "This restores the staff member to active status.",
          actionLabel: "Restore active",
          loadingText: "Restoring",
          successTitle: "Staff restored",
          getSuccessMessage: (staff: StaffListItem) => `${staff.full_name} is now active.`,
          requiresReason: false,
          requiresDate: false,
          confirmLabel: "I confirm I want to restore this staff member to active status.",
          buildPayload: () => ({
            status: "active",
            suspension_date: null,
            suspension_reason: null,
            termination_date: null,
            termination_reason: null,
          }),
        };
    }
  }, []);

  const formatDateForApi = React.useCallback((date: Date | undefined) => {
    if (!date) return "";
    return date.toISOString().split("T")[0];
  }, []);

  const handleConfirmStatusAction = async () => {
    if (!statusAction) return;

    const config = getStatusActionConfig(statusAction.type);
    const formattedActionDate = formatDateForApi(statusActionDate);

    if (config.requiresDate && !formattedActionDate) {
      showToast.error("Action date is required");
      return;
    }

    if (config.requiresReason && !statusActionReason.trim()) {
      showToast.error("Reason is required");
      return;
    }

    try {
      await patchStaffStatus(config.buildPayload(formattedActionDate, statusActionReason));
      showToast.success(config.successTitle, config.getSuccessMessage(statusAction.staff));
      setStatusAction(null);
      setStatusActionConfirmed(false);
      setStatusActionReason("");
      onDataChanged?.();
    } catch (error) {
      showToast.error("Update failed", getErrorMessage(error));
    }
  };

  const staffRows = React.useMemo<StaffListItem[]>(() => data?.results || [], [data]);

  const columns = React.useMemo(
    () =>
      getStaffColumns({
        departmentFilterOptions,
        onDelete: handleDelete,
        onStatusAction: handleStatusAction,
        returnToUrl,
      }),
    [departmentFilterOptions, handleDelete, handleStatusAction, returnToUrl]
  );

  React.useEffect(() => {
    if (!tableInstance) return;

    isApplyingUrlFilters.current = true;

    const applyArrayFilter = (columnId: string, csv: string) => {
      const column = tableInstance.getColumn(columnId);
      if (!column) return;
      const values = parseCsv(csv).filter((value) => value !== "all");
      column.setFilterValue(values.length > 0 ? values : undefined);
    };

    const applySelectFilter = (columnId: string, value: string) => {
      const column = tableInstance.getColumn(columnId);
      if (!column) return;
      column.setFilterValue(value && value !== "all" ? value : undefined);
    };

    applyArrayFilter("status", urlParams.status);
    applyArrayFilter("department", urlParams.department);
    applySelectFilter("is_teacher", urlParams.role || "all");
    applySelectFilter("gender", urlParams.gender || "all");

    setTimeout(() => {
      previousColumnFilters.current = JSON.stringify(tableInstance.getState().columnFilters);
      isApplyingUrlFilters.current = false;
    }, 0);
  }, [tableInstance, urlParams]);

  React.useEffect(() => {
    if (!tableInstance) return;

    const handleStateChange = () => {
      if (isApplyingUrlFilters.current) return;

      const columnFilters = tableInstance.getState().columnFilters;
      const currentFiltersString = JSON.stringify(columnFilters);
      if (currentFiltersString === previousColumnFilters.current) return;
      previousColumnFilters.current = currentFiltersString;

      const nextParams: StaffTableUrlParams & { page: number } = {
        search: urlParams.search,
        status: "all",
        department: "",
        role: "all",
        gender: "",
        page: 1,
      };

      columnFilters.forEach((filter) => {
        if (filter.id === "status") {
          const selected = Array.isArray(filter.value)
            ? filter.value.map((value) => String(value).toLowerCase()).filter((value) => value !== "all")
            : [];
          nextParams.status = selected.length > 0 ? selected.join(",") : "all";
          return;
        }

        if (filter.id === "department") {
          nextParams.department = Array.isArray(filter.value) ? filter.value.join(",") : "";
          return;
        }

        if (filter.id === "is_teacher") {
          const selected = String(filter.value || "all");
          nextParams.role = selected === "teacher" || selected === "staff" ? selected : "all";
          return;
        }

        if (filter.id === "gender") {
          const selected = String(filter.value || "all");
          nextParams.gender =
            selected === "male" || selected === "female" || selected === "unknown"
              ? selected
              : "";
        }
      });

      setUrlParams(nextParams);
    };

    handleStateChange();
    const interval = setInterval(handleStateChange, 120);
    return () => clearInterval(interval);
  }, [tableInstance, urlParams.search, setUrlParams]);

  const handleRowClick = React.useCallback(
    (staff: StaffListItem) => {
      const returnTo = `${window.location.pathname}${window.location.search}`;
      router.push(`/staff/${staff.id_number}?returnTo=${encodeURIComponent(returnTo)}`);
    },
    [router]
  );

  return (
    <>
      <AdvancedTable
        loading={loading}
        columns={columns}
        data={staffRows}
        noData={!loading && staffRows.length === 0}
        emptyStateTitle="No Staff Found"
        emptyStateDescription="There are no staff members to display at the moment."
        pageSize={serverPagination?.pageSize ?? 20}
        totalCount={serverPagination?.totalCount}
        currentPage={serverPagination?.currentPage ?? 1}
        onPageChange={serverPagination?.onPageChange}
        onPageSizeChange={serverPagination?.onPageSizeChange}
        onRowClick={handleRowClick}
        showPagination={true}
        showRowSelection={false}
        showBulkActions={false}
        onTableInstanceReady={setTableInstance}
        toolbar={(table) => (
          <div className="p-1 space-y-4 overflow-x-auto no-scrollbar">
            <div className="flex items-center justify-between gap-1">
              <div className="flex items-center gap-2 flex-1">
                <Searchbar
                  value={searchInputValue}
                  disabled={loading}
                  onChange={(event) => {
                    setSearchInputValue(event.target.value);
                  }}
                  onClear={() => {
                    setSearchInputValue("");
                    setUrlParams({
                      ...urlParams,
                      search: "",
                      page: 1,
                    });
                  }}
                  onSearch={() => {
                    setUrlParams({
                      ...urlParams,
                      search: searchInputValue,
                      page: 1,
                    });
                  }}
                  showDirtyIndicator={isSearchDirty}
                  placeholder="Search staff..."
                  className="w-full min-w-62.5 max-w-sm"
                />
                <div className="md:hidden">
                  <TableFilters table={table} disabled={Boolean(loading)} />
                </div>
                <div className="hidden md:block">
                  <TableFiltersInline table={table} disabled={Boolean(loading)} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ViewOptions table={table} />
              </div>
            </div>
          </div>
        )}
      />

      <DialogBox
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) {
            setDeleteStaff(null);
            setDeleteConfirmed(false);
          }
        }}
        title="Delete staff record"
        description="This permanently removes the staff record from the system. This action cannot be undone."
        cancelLabel="Cancel"
        onCancel={() => {
          setDeleteDialogOpen(false);
          setDeleteStaff(null);
          setDeleteConfirmed(false);
        }}
        actionLabel="Delete permanently"
        actionVariant="destructive"
        actionLoading={isDeleting}
        actionLoadingText="Deleting"
        actionDisabled={!deleteConfirmed || !deleteStaff}
        onAction={handleConfirmDelete}
      >
        {deleteStaff ? (
          <div className="space-y-4">
            <StaffHeader staff={deleteStaff} />

            <div className="rounded-xl border bg-muted/30 p-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Before you continue</p>
              <p className="mt-1">
                Deleting this record may affect staff history, linked schedules, or future references to this staff member.
              </p>
            </div>

            <label className="flex cursor-pointer items-start gap-3 rounded-lg border px-4 py-3 text-sm">
              <Checkbox
                checked={deleteConfirmed}
                onCheckedChange={(checked) => setDeleteConfirmed(Boolean(checked))}
                className="mt-0.5"
              />
              <span>
                I understand this will permanently delete <span className="font-medium text-foreground">{deleteStaff.full_name}</span> and cannot be undone.
              </span>
            </label>
          </div>
        ) : null}
      </DialogBox>

      <DialogBox
        open={!!statusAction}
        onOpenChange={(open) => {
          if (!open) {
            setStatusAction(null);
            setStatusActionConfirmed(false);
            setStatusActionReason("");
          }
        }}
        title={statusAction ? getStatusActionConfig(statusAction.type).title : "Update staff status"}
        description={statusAction ? getStatusActionConfig(statusAction.type).description : undefined}
        cancelLabel="Cancel"
        onCancel={() => {
          setStatusAction(null);
          setStatusActionConfirmed(false);
          setStatusActionReason("");
        }}
        actionLabel={statusAction ? getStatusActionConfig(statusAction.type).actionLabel : "Confirm"}
        actionVariant="destructive"
        actionLoading={isUpdatingStatus}
        actionLoadingText={statusAction ? getStatusActionConfig(statusAction.type).loadingText : "Saving"}
        actionDisabled={
          !statusAction ||
          !statusActionConfirmed ||
          (statusAction && getStatusActionConfig(statusAction.type).requiresDate && !statusActionDate) ||
          (statusAction && getStatusActionConfig(statusAction.type).requiresReason && !statusActionReason.trim())
        }
        onAction={handleConfirmStatusAction}
      >
        {statusAction ? (
          <div className="space-y-4">
            <StaffHeader staff={statusAction.staff} />

            {getStatusActionConfig(statusAction.type).requiresDate && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Effective date</label>
                <DatePicker
                  value={statusActionDate}
                  onChange={setStatusActionDate}
                  allowFutureDates={false}
                  dateFormat="MM/DD/YYYY"
                />
              </div>
            )}

            {getStatusActionConfig(statusAction.type).requiresReason && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Reason</label>
                <Textarea
                  value={statusActionReason}
                  onChange={(event) => setStatusActionReason(event.target.value)}
                  placeholder="Provide a clear reason for this status change"
                />
              </div>
            )}

            <label className="flex cursor-pointer items-start gap-3 rounded-lg border px-4 py-3 text-sm">
              <Checkbox
                checked={statusActionConfirmed}
                onCheckedChange={(checked) => setStatusActionConfirmed(Boolean(checked))}
                className="mt-0.5"
              />
              <span>{getStatusActionConfig(statusAction.type).confirmLabel}</span>
            </label>
          </div>
        ) : null}
      </DialogBox>
    </>
  );
}
