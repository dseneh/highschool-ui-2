"use client";

import * as React from "react";
import type { UserDto } from "@/lib/api2/users";
import { getUserColumns } from "./user-columns";
import { AdvancedTable, Searchbar, TableFilters, TableFiltersInline } from "@/components/shared/advanced-table";
import { AuthButton } from "@/components/auth/auth-button";
import { Download } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import type { Table } from "@tanstack/react-table";

interface UserTableProps {
  data: UserDto[];
  onEdit?: (user: UserDto) => void;
  onDelete?: (user: UserDto) => void;
  onView?: (user: UserDto) => void;
  onBlock?: (user: UserDto) => void;
  onReinstate?: (user: UserDto) => void;
  onChangeRole?: (user: UserDto) => void;
  onResetPassword?: (user: UserDto) => void;
  onToggleAdmin?: (user: UserDto) => void;
  onCopyId?: (user: UserDto) => void;
  onBulkDelete?: (users: UserDto[]) => void;
  onBulkBlock?: (users: UserDto[]) => void;
  onBulkReinstate?: (users: UserDto[]) => void;
  onExport?: (users: UserDto[]) => void;
  // Pagination props
  totalCount: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  urlParams: any;
  setUrlParams: any;
  loading?: boolean;
}

export function UserTable({ 
  data, 
  onEdit, 
  onDelete,
  onView,
  onBlock,
  onReinstate,
  onChangeRole,
  onResetPassword,
  onToggleAdmin,
  onCopyId,
  onBulkDelete,
  onBulkBlock,
  onBulkReinstate,
  onExport,
  totalCount,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  urlParams,
  setUrlParams,
  loading,
}: UserTableProps) {
  const [searchValue, setSearchValue] = useState("");
  const [tableInstance, setTableInstance] = useState<Table<UserDto> | null>(null);
  const isApplyingUrlFilters = useRef(false);
  const previousColumnFilters = useRef<string>("");

  // Apply URL filters to table on mount and when URL changes
  useEffect(() => {
    if (!tableInstance) return;
    
    isApplyingUrlFilters.current = true;
    
    // Apply URL filters to table columns for UI display
    const filterColumns = ['account_type', 'role', 'is_active', 'is_staff', ];
    filterColumns.forEach((key) => {
      const column = tableInstance.getColumn(key);
      if (column) {
        const value = urlParams[key as keyof typeof urlParams];
        if (Array.isArray(value) && value.length === 0) {
          column.setFilterValue(undefined);
        } else if (value === "" || value === undefined) {
          column.setFilterValue(undefined);
        } else {
          column.setFilterValue(value);
        }
      }
    });
    
    setTimeout(() => {
      previousColumnFilters.current = JSON.stringify(tableInstance.getState().columnFilters);
      isApplyingUrlFilters.current = false;
    }, 0);
  }, [tableInstance, urlParams]);

  // Sync table filter changes to URL
  useEffect(() => {
    if (!tableInstance) return;
    
    const handleStateChange = () => {
      if (isApplyingUrlFilters.current) return;

      const columnFilters = tableInstance.getState().columnFilters;
      const currentFiltersString = JSON.stringify(columnFilters);
      
      if (currentFiltersString === previousColumnFilters.current) return;
      
      previousColumnFilters.current = currentFiltersString;
      
      const newUrlFilters: Record<string, any> = {
        account_type: [],
        role: [],
        is_active: "",
        is_staff: "",
        is_superuser: "",
        is_default_password: "",
      };

      columnFilters.forEach((filter) => {
        newUrlFilters[filter.id] = filter.value;
      });

      // Update URL with new filters and reset to page 1
      setUrlParams({
        ...newUrlFilters,
        page: 1,
      });
    };
    
    handleStateChange();
    const interval = setInterval(handleStateChange, 100);
    return () => clearInterval(interval);
  }, [tableInstance, setUrlParams]);

  const columns = getUserColumns({ 
    onEdit, 
    onDelete, 
    onView,
    onBlock,
    onReinstate,
    onChangeRole,
    onResetPassword,
    onToggleAdmin,
    onCopyId,
  });

  // Client-side search filtering only (backend handles all other filters)
  const filteredData = React.useMemo(() => {
    if (!searchValue) return data;
    
    const search = searchValue.toLowerCase();
    return data.filter(user => 
      user.first_name?.toLowerCase().includes(search) ||
      user.last_name?.toLowerCase().includes(search) ||
      user.email?.toLowerCase().includes(search) ||
      user.id_number?.toLowerCase().includes(search)
    );
  }, [data, searchValue]);

  const handleBulkDelete = React.useCallback((selectedRows: UserDto[]) => {
    onBulkDelete?.(selectedRows);
  }, [onBulkDelete]);

  const handleCustomBulkAction = React.useCallback((action: string, selectedRows: UserDto[]) => {
    if (action === "bulk_block") {
      onBulkBlock?.(selectedRows);
      return;
    }

    if (action === "bulk_reinstate") {
      onBulkReinstate?.(selectedRows);
      return;
    }
  }, [onBulkBlock, onBulkReinstate]);

  const handleExport = React.useCallback(() => {
    onExport?.(filteredData);
  }, [filteredData, onExport]);

  return (
    <AdvancedTable 
    loading={loading}
      columns={columns} 
      data={filteredData}
      onRowClick={onView}
      pageSize={pageSize}
      totalCount={totalCount}
      currentPage={currentPage}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      showPagination={true}
      showRowSelection={true}
      showBulkActions={true}
      onBulkDelete={handleBulkDelete}
      onCustomBulkAction={handleCustomBulkAction}
      customBulkActions={[
        { label: "Block", action: "bulk_block" },
        { label: "Reinstate", action: "bulk_reinstate"},
      ]}
      onTableInstanceReady={setTableInstance}
      toolbar={(table) => (
          <div className="space-y-4">
            {/* Search and Actions Bar */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 flex-1">
                <Searchbar
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Search users..."
                  className="max-w-sm"
                />
                {/* Mobile Filter Button */}
                <div className="md:hidden">
                  <TableFilters table={table} />
                </div>
                <div className="hidden md:block">
                  <TableFiltersInline table={table} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                {onExport && (
                  <AuthButton
                    roles="teacher"
                    disable
                    variant="outline"
                    size="sm"
                    onClick={handleExport}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </AuthButton>
                )}
              </div>
            </div>
          </div>
      )}
    />
  );
}

