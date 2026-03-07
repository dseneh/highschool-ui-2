"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { DatePicker } from "@/components/ui/date-picker";
import type {
  TransactionListParams,
  TransactionStatus,
  TransactionTypeDto,
  BankAccountDto,
} from "@/lib/api/finance-types";
import {
  Search01Icon,
  FilterHorizontalIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { format } from "date-fns";
import {
  useQueryState,
  parseAsString,
  parseAsInteger,
} from "nuqs";

/* ------------------------------------------------------------------ */
/*  Hook: useTransactionFilterParams                                   */
/*  Reads/writes filter state from URL via nuqs. The search input is   */
/*  the only "instant" filter – everything else is staged inside the   */
/*  Sheet and only committed when the user clicks "Apply".             */
/* ------------------------------------------------------------------ */

export function useTransactionFilterParams() {
  const [search, setSearch] = useQueryState("search", parseAsString.withDefault(""));
  const [status, setStatus] = useQueryState("status", parseAsString.withDefault(""));
  const [transactionType, setTransactionType] = useQueryState("type", parseAsString.withDefault(""));
  const [account, setAccount] = useQueryState("account", parseAsString.withDefault(""));
  const [academicYear, setAcademicYear] = useQueryState("year", parseAsString.withDefault(""));
  const [dateFrom, setDateFrom] = useQueryState("from", parseAsString.withDefault(""));
  const [dateTo, setDateTo] = useQueryState("to", parseAsString.withDefault(""));
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));

  /** Build the params object to pass to the API hook */
  const params: TransactionListParams = React.useMemo(
    () => ({
      page,
      page_size: 50,
      search: search || undefined,
      status: (status as TransactionStatus) || undefined,
      transaction_type: transactionType || undefined,
      account: account || undefined,
      academic_year: academicYear || undefined,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
    }),
    [search, status, transactionType, account, academicYear, dateFrom, dateTo, page]
  );

  /** Count how many filters are active (common + advanced) */
  const activeFilterCount = [status, transactionType, account, academicYear, dateFrom, dateTo].filter(Boolean).length;
  /** Count advanced filters only (excludes status & type which are always visible) */
  const advancedFilterCount = [account, academicYear, dateFrom, dateTo].filter(Boolean).length;

  return {
    params,
    search,
    setSearch,
    status,
    setStatus,
    transactionType,
    setTransactionType,
    account,
    setAccount,
    academicYear,
    setAcademicYear,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    page,
    setPage,
    activeFilterCount,
    advancedFilterCount,
  };
}

/* ------------------------------------------------------------------ */
/*  TransactionFilters – Search bar + "Filters" sheet trigger          */
/* ------------------------------------------------------------------ */

interface TransactionFiltersProps {
  transactionTypes?: TransactionTypeDto[];
  bankAccounts?: BankAccountDto[];
  academicYears?: Array<{ id: string; name: string }>;
  filterState: ReturnType<typeof useTransactionFilterParams>;
}

export function TransactionFilters({
  transactionTypes = [],
  bankAccounts = [],
  academicYears = [],
  filterState,
}: TransactionFiltersProps) {
  const {
    search,
    setSearch,
    status,
    setStatus,
    transactionType,
    setTransactionType,
    activeFilterCount,
    advancedFilterCount,
    setPage,
  } = filterState;

  const [localSearch, setLocalSearch] = React.useState(search);
  const [sheetOpen, setSheetOpen] = React.useState(false);

  const visibleTypes = transactionTypes.filter((t) => !t.is_hidden);

  const STATUS_OPTIONS: { label: string; value: string }[] = [
    { label: "All Statuses", value: "" },
    { label: "Pending", value: "pending" },
    { label: "Approved", value: "approved" },
    { label: "Canceled", value: "canceled" },
  ];

  // Sync local search from URL on mount / URL change
  React.useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  // Debounce search input → URL
  const searchRef = React.useRef(search);

  React.useEffect(() => {
    searchRef.current = search;
  }, [search]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== searchRef.current) {
        void setSearch(localSearch || null);
        void setPage(1);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [localSearch, setSearch, setPage]);

  function handleClearAll() {
    void setSearch(null);
    void setStatus(null);
    void setTransactionType(null);
    void filterState.setAccount(null);
    void filterState.setAcademicYear(null);
    void filterState.setDateFrom(null);
    void filterState.setDateTo(null);
    void setPage(1);
  }

  return (
    <>
      <div className="flex items-center gap-2 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-50 max-w-sm">
          <HugeiconsIcon
            icon={Search01Icon}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none"
          />
          <Input
            placeholder="Search transactions…"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="pl-8"
          />
        </div>

        {/* Status Filter */}
        <Select
          value={status}
          onValueChange={(val) => {
            void setStatus(val || null);
            void setPage(1);
          }}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Transaction Type Filter */}
        {visibleTypes.length > 0 && (
          <Select
            value={transactionType}
            onValueChange={(val) => {
              void setTransactionType(val || null);
              void setPage(1);
            }}
            items={[
              { value: "", label: "All Types" },
              ...visibleTypes.map((t) => ({ value: t.id, label: t.name })),
            ]}
          >
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Types</SelectItem>
              {visibleTypes.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Advanced Filters button */}
        <Button
          variant="outline"
          size="sm"
          iconLeft={<HugeiconsIcon icon={FilterHorizontalIcon} size={14} />}
          onClick={() => setSheetOpen(true)}
        >
          More Filters
          {advancedFilterCount > 0 && (
            <Badge
              variant="default"
              className="ml-1.5 h-5 min-w-5 px-1.5 text-[10px] rounded-full"
            >
              {advancedFilterCount}
            </Badge>
          )}
        </Button>

        {/* Clear All button (shown when any filter is active) */}
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
          >
            Clear
          </Button>
        )}
      </div>

      {/* Advanced Filter Sheet */}
      <AdvancedFilterSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        filterState={filterState}
        bankAccounts={bankAccounts}
        academicYears={academicYears}
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  AdvancedFilterSheet – staged editing, applied on "Apply"           */
/* ------------------------------------------------------------------ */

function AdvancedFilterSheet({
  open,
  onOpenChange,
  filterState,
  bankAccounts,
  academicYears,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  filterState: ReturnType<typeof useTransactionFilterParams>;
  bankAccounts: BankAccountDto[];
  academicYears: Array<{ id: string; name: string }>;
}) {
  const {
    account,
    setAccount,
    academicYear,
    setAcademicYear,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    setPage,
    advancedFilterCount,
  } = filterState;

  // Staged (pending) filter values — only committed on "Apply"
  const [pendingAccount, setPendingAccount] = React.useState(account);
  const [pendingYear, setPendingYear] = React.useState(academicYear);
  const [pendingFrom, setPendingFrom] = React.useState(dateFrom);
  const [pendingTo, setPendingTo] = React.useState(dateTo);

  // Sync pending state when sheet opens
  React.useEffect(() => {
    if (open) {
      setPendingAccount(account);
      setPendingYear(academicYear);
      setPendingFrom(dateFrom);
      setPendingTo(dateTo);
    }
  }, [open, account, academicYear, dateFrom, dateTo]);

  function handleApply() {
    void setAccount(pendingAccount || null);
    void setAcademicYear(pendingYear || null);
    void setDateFrom(pendingFrom || null);
    void setDateTo(pendingTo || null);
    void setPage(1);
    onOpenChange(false);
  }

  function handleReset() {
    setPendingAccount("");
    setPendingYear("");
    setPendingFrom("");
    setPendingTo("");
  }

  function handleClearAll() {
    handleReset();
    void setAccount(null);
    void setAcademicYear(null);
    void setDateFrom(null);
    void setDateTo(null);
    void setPage(1);
    onOpenChange(false);
  }

  const hasPending = pendingAccount || pendingYear || pendingFrom || pendingTo;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-md w-full flex flex-col">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle>Advanced Filters</SheetTitle>
              <SheetDescription>
                Refine your transaction search
              </SheetDescription>
            </div>
            {advancedFilterCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {advancedFilterCount} active
              </Badge>
            )}
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-5">
          {/* Bank Account */}
          {bankAccounts.length > 0 && (
            <div className="space-y-2">
              <Label>Bank Account</Label>
              <Select
                value={pendingAccount}
                onValueChange={(val) => setPendingAccount(val ?? "")}
                items={[
                  { value: "", label: "All Accounts" },
                  ...bankAccounts.map((a) => ({ value: a.id, label: a.name })),
                ]}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Accounts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Accounts</SelectItem>
                  {bankAccounts.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Academic Year */}
          {academicYears.length > 0 && (
            <div className="space-y-2">
              <Label>Academic Year</Label>
              <Select
                value={pendingYear}
                onValueChange={(val) => setPendingYear(val ?? "")}
                items={[
                  { value: "", label: "All Years" },
                  ...academicYears.map((y) => ({ value: y.id, label: y.name })),
                ]}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Years" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Years</SelectItem>
                  {academicYears.map((y) => (
                    <SelectItem key={y.id} value={y.id}>
                      {y.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Date Range */}
          <div className="space-y-3">
            <Label>Date Range</Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <span className="text-xs text-muted-foreground">From</span>
                <DatePicker
                  value={pendingFrom ? new Date(pendingFrom) : undefined}
                  onChange={(d) =>
                    setPendingFrom(d ? format(d, "yyyy-MM-dd") : "")
                  }
                  placeholder="Start date"
                  className="w-full"
                />
              </div>
              <div className="space-y-1.5">
                <span className="text-xs text-muted-foreground">To</span>
                <DatePicker
                  value={pendingTo ? new Date(pendingTo) : undefined}
                  onChange={(d) =>
                    setPendingTo(d ? format(d, "yyyy-MM-dd") : "")
                  }
                  placeholder="End date"
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>

        <SheetFooter className="border-t pt-4">
          <div className="flex items-center justify-between w-full gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              disabled={advancedFilterCount === 0 && !hasPending}
            >
              Clear All
            </Button>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
              >
                Reset
              </Button>
              <Button size="sm" onClick={handleApply}>
                Apply Filters
              </Button>
            </div>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
