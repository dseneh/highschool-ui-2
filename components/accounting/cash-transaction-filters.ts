"use client";

import { useQueryState, parseAsString, parseAsInteger } from "nuqs";
import type { CashTransactionStatus } from "@/lib/api2/accounting-types";
import {
  buildNumberConditionQueryParams,
  type ConditionFilter,
} from "@/components/shared/advanced-table";

export interface CashTransactionFilterParams {
  page: number;
  page_size: number;
  search?: string;
  status?: CashTransactionStatus;
  transaction_type?: string;
  bank_account?: string;
  start_date?: string;
  end_date?: string;
  amount?: string;
  amount_min?: string;
  amount_max?: string;
  ordering?: string;
}

/**
 * Hook: useCashTransactionFilterParams
 * Reads/writes filter state from URL via nuqs.
 */
export function useCashTransactionFilterParams() {
  const [search, setSearch] = useQueryState("search", parseAsString.withDefault(""));
  const [status, setStatus] = useQueryState("status", parseAsString.withDefault(""));
  const [transactionType, setTransactionType] = useQueryState("type", parseAsString.withDefault(""));
  const [bankAccount, setBankAccount] = useQueryState("account", parseAsString.withDefault(""));
  const [dateFrom, setDateFrom] = useQueryState("from", parseAsString.withDefault(""));
  const [dateTo, setDateTo] = useQueryState("to", parseAsString.withDefault(""));
  const [amountCondition, setAmountCondition] = useQueryState("amount_condition", parseAsString.withDefault(""));
  const [amountMin, setAmountMin] = useQueryState("amount_min", parseAsString.withDefault(""));
  const [amountMax, setAmountMax] = useQueryState("amount_max", parseAsString.withDefault(""));
  const [sortBy, setSortBy] = useQueryState("sort", parseAsString.withDefault("-transaction_date"));
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [pageSize, setPageSize] = useQueryState("page_size", parseAsInteger.withDefault(50));

  const amountFilter: ConditionFilter | undefined =
    amountCondition || amountMin || amountMax
      ? {
          condition: amountCondition || "",
          value: [amountMin || "", amountMax || ""],
        }
      : undefined;

  const amountParams = buildNumberConditionQueryParams(amountFilter, {
    equalKey: "amount",
    minKey: "amount_min",
    maxKey: "amount_max",
  });

  // Build the params object to pass to the API
  const params: CashTransactionFilterParams = {
    page,
    page_size: pageSize,
    search: search || undefined,
    status: (status as CashTransactionStatus) || undefined,
    transaction_type: transactionType || undefined,
    bank_account: bankAccount || undefined,
    start_date: dateFrom || undefined,
    end_date: dateTo || undefined,
    amount: amountParams.amount,
    amount_min: amountParams.amount_min,
    amount_max: amountParams.amount_max,
    ordering: sortBy || undefined,
  };

  return {
    params,
    search,
    setSearch,
    status,
    setStatus,
    transactionType,
    setTransactionType,
    bankAccount,
    setBankAccount,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    amountCondition,
    setAmountCondition,
    amountMin,
    setAmountMin,
    amountMax,
    setAmountMax,
    sortBy,
    setSortBy,
    page,
    setPage,
    pageSize,
    setPageSize,
    activeFilterCount: [
      status,
      transactionType,
      bankAccount,
      dateFrom,
      dateTo,
      amountCondition,
      amountMin,
      amountMax,
    ].filter(Boolean).length,
    clearFilters: async () => {
      await Promise.all([
        setSearch(""),
        setStatus(""),
        setTransactionType(""),
        setBankAccount(""),
        setDateFrom(""),
        setDateTo(""),
        setAmountCondition(""),
        setAmountMin(""),
        setAmountMax(""),
        setSortBy("-transaction_date"),
        setPage(1),
        setPageSize(50),
      ]);
    },
  };
}
