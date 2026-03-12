"use client";

import * as React from "react";
import { PageContent } from "@/components/dashboard/page-content";
import { PageHeader } from "@/components/dashboard/page-header";
import { AlertCircle } from "lucide-react";
import { getErrorMessage, cn } from "@/lib/utils";
import EmptyStateComponent from "../shared/empty-state";
import RefreshButton from "../shared/refresh-button";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/data-table";

type PageLayoutProps = {
  children?: React.ReactNode;
  title: string | React.ReactNode;
  description?: string | React.ReactNode;
  actions?: React.ReactNode;
  filterActions?: React.ReactNode;
  className?: string;
  loading?: boolean;
  fetching?: boolean;
  error?: any;
  emptyState?: React.ReactNode;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  emptyStateAction?: () => void;
  emptyStateIcon?: React.ReactNode;
  skeleton?: React.ReactNode;
  noData?: boolean;
  globalChildren?: React.ReactNode;
  refreshAction?: () => void;
  // DataTable props - if provided, shows DataTable instead of children
  columns?: ColumnDef<any, any>[];
  tableData?: any[];
  searchKey?: string;
  showPagination?: boolean;
  pageSize?: number;
};

export default function PageLayout({
  children,
  title,
  description,
  actions,
  filterActions,
  className,
  loading,
  fetching,
  error,
  emptyState,
  skeleton,
  noData,
  globalChildren,
  emptyStateTitle = "No Data Available",
  emptyStateDescription = "There is no data to display at the moment.",
  emptyStateIcon,
  emptyStateAction,
  refreshAction,
  columns,
  tableData,
  searchKey,
  showPagination = true,
  pageSize = 20,
}: PageLayoutProps) {
  const isEmpty = !loading && noData;
  const useDataTable = columns && tableData;

  if (error) {
    return (
      <>
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 border-b px-3 py-1 overflow-x-hidden">
          <PageHeader title={title} description={description}>
            <div className="flex items-center gap-2">
            {actions && actions}
            {refreshAction && (
              <RefreshButton onClick={refreshAction} loading={loading || (fetching && fetching)} />
            )}
            </div>
          </PageHeader>
        </div>
        <PageContent >
            {filterActions && filterActions}
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="size-5 text-destructive mt-0.5" />
              <div>
                <h2 className="text-lg font-semibold mb-1">An Error Occurred</h2>
                <p className="text-sm text-muted-foreground">
                  {getErrorMessage(error)}
                </p>
              </div>
            </div>
          </div>
        </PageContent>
      </>
    );
  }

  return (
    <>
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 border-b px-3 py-1 overflow-x-hidden">
        <PageHeader title={title} description={description}>
          {actions && actions}
          {refreshAction && (
              <RefreshButton onClick={refreshAction} loading={loading || (fetching && fetching)} />
            )}
        </PageHeader>
      </div>
      <PageContent className={cn("", className)}>
         {filterActions && filterActions}
        {loading ? (
          skeleton ? skeleton : (
            <div className="space-y-4">
              <div className="h-48 w-full rounded-xl bg-muted/50 animate-pulse" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="h-32 rounded-xl bg-muted/50 animate-pulse" />
                <div className="h-32 rounded-xl bg-muted/50 animate-pulse" />
                <div className="h-32 rounded-xl bg-muted/50 animate-pulse" />
                <div className="h-32 rounded-xl bg-muted/50 animate-pulse" />
              </div>
            </div>
          )
        ) : (
          <>
            {/* Render children first (stats cards, filters, custom content) */}
            {children}
            
            {/* Then render DataTable if columns and data are provided */}
            {useDataTable && (
              <DataTable 
                columns={columns!} 
                data={tableData!}
                searchKey={searchKey}
                showPagination={showPagination}
                pageSize={pageSize}
                noData={isEmpty}
                emptyStateTitle={emptyStateTitle}
                emptyStateDescription={emptyStateDescription}
                emptyStateAction={emptyStateAction}
                emptyStateIcon={emptyStateIcon}
              />
            )}
            
            {/* Show empty state only if no DataTable and no custom content */}
            {!useDataTable && isEmpty && (
              <div className="">
                {emptyState ? emptyState : (
                  <EmptyStateComponent
                    title={emptyStateTitle}
                    description={emptyStateDescription}
                    actionTitle={emptyStateAction ? "Create new" : undefined}
                    handleAction={emptyStateAction}
                    icon={emptyStateIcon}
                  />
                )}
              </div>
            )}
          </>
        )}
        {globalChildren}
      </PageContent>
    </>
  );
}
