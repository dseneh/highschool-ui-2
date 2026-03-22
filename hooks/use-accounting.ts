"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { useTenantSubdomain } from "@/hooks/use-tenant-subdomain";
import { getQueryClient } from "@/lib/query-client";
import {
  listAccountingCurrencies,
  createAccountingCurrency,
  updateAccountingCurrency,
  deleteAccountingCurrency,
  listLedgerAccounts,
  createLedgerAccount,
  updateLedgerAccount,
  deleteLedgerAccount,
  listAccountingBankAccounts,
  getAccountingBankAccountDetail,
  createAccountingBankAccount,
  updateAccountingBankAccount,
  deleteAccountingBankAccount,
  listTransactionTypes,
  createTransactionType,
  updateTransactionType,
  deleteTransactionType,
  listPaymentMethods,
  listCashTransactions,
  createCashTransaction,
  updateCashTransaction,
  deleteCashTransaction,
  approveCashTransaction,
  rejectCashTransaction,
  postCashTransaction,
  listJournalEntries,
  getJournalEntryDetail,
  createJournalEntry,
  updateJournalEntry,
  updateJournalLine,
  deleteJournalEntry,
  listFeeItems,
  createFeeItem,
  updateFeeItem,
  deleteFeeItem,
  listExchangeRates,
  createAccountTransfer,
  postStudentPayment,
  postIncomeTransaction,
  postExpenseTransaction,
  postGeneralJournalEntry,
} from "@/lib/api2/accounting-service";
import type {
  CreateAccountingCurrencyCommand,
  UpdateAccountingCurrencyCommand,
  CreateAccountingLedgerAccountCommand,
  UpdateAccountingLedgerAccountCommand,
  CreateAccountingBankAccountCommand,
  UpdateAccountingBankAccountCommand,
  CreateAccountingTransactionTypeCommand,
  UpdateAccountingTransactionTypeCommand,
  CreateAccountingCashTransactionCommand,
  UpdateAccountingCashTransactionCommand,
  CashTransactionListParams,
  CreateAccountingJournalEntryCommand,
  UpdateAccountingJournalEntryCommand,
  UpdateAccountingJournalLineCommand,
  JournalEntryListParams,
  CreateAccountingFeeItemCommand,
  UpdateAccountingFeeItemCommand,
  CreateAccountTransferCommand,
  PostStudentPaymentCommand,
  PostIncomeCommand,
  PostExpenseCommand,
  PostGeneralTransactionCommand,
} from "@/lib/api2/accounting-types";

/* ================================================================== */
/*  Key factories                                                      */
/* ================================================================== */

export const accountingKeys = {
  currencies: (sub: string) => ["accounting", sub, "currencies"] as const,
  ledgerAccounts: (sub: string) => ["accounting", sub, "ledger-accounts"] as const,
  bankAccounts: (sub: string) => ["accounting", sub, "bank-accounts"] as const,
  bankAccountDetail: (sub: string, id: string) => ["accounting", sub, "bank-accounts", id] as const,
  transactionTypes: (sub: string) => ["accounting", sub, "transaction-types"] as const,
  paymentMethods: (sub: string) => ["accounting", sub, "payment-methods"] as const,
  cashTransactions: (sub: string, params?: CashTransactionListParams) =>
    ["accounting", sub, "cash-transactions", params] as const,
  journalEntries: (sub: string, params?: JournalEntryListParams) =>
    ["accounting", sub, "journal-entries", params] as const,
  journalEntryDetail: (sub: string, id: string) =>
    ["accounting", sub, "journal-entries", id] as const,
  feeItems: (sub: string) => ["accounting", sub, "fee-items"] as const,
  exchangeRates: (sub: string) => ["accounting", sub, "exchange-rates"] as const,
};

/* ================================================================== */
/*  Currencies                                                         */
/* ================================================================== */

export function useAccountingCurrencies() {
  const sub = useTenantSubdomain();
  return useQuery({
    queryKey: accountingKeys.currencies(sub),
    queryFn: () => listAccountingCurrencies(sub),
    enabled: !!sub,
    staleTime: 10 * 60 * 1000,
  });
}

export function useAccountingCurrencyMutations() {
  const sub = useTenantSubdomain();
  const qc = getQueryClient();

  const invalidate = () =>
    qc.invalidateQueries({ queryKey: accountingKeys.currencies(sub) });

  const create = useMutation({
    mutationFn: (payload: CreateAccountingCurrencyCommand) =>
      createAccountingCurrency(sub, payload),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateAccountingCurrencyCommand }) =>
      updateAccountingCurrency(sub, id, payload),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteAccountingCurrency(sub, id),
    onSuccess: invalidate,
  });

  return { create, update, remove };
}

/* ================================================================== */
/*  Ledger Accounts (Chart of Accounts)                               */
/* ================================================================== */

export function useLedgerAccounts() {
  const sub = useTenantSubdomain();
  return useQuery({
    queryKey: accountingKeys.ledgerAccounts(sub),
    queryFn: () => listLedgerAccounts(sub),
    enabled: !!sub,
    staleTime: 10 * 60 * 1000,
  });
}

export function useLedgerAccountMutations() {
  const sub = useTenantSubdomain();
  const qc = getQueryClient();

  const invalidate = () =>
    qc.invalidateQueries({ queryKey: accountingKeys.ledgerAccounts(sub) });

  const create = useMutation({
    mutationFn: (payload: CreateAccountingLedgerAccountCommand) =>
      createLedgerAccount(sub, payload),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateAccountingLedgerAccountCommand }) =>
      updateLedgerAccount(sub, id, payload),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (input: string | { id: string; deleteChildren?: boolean }) => {
      if (typeof input === "string") {
        return deleteLedgerAccount(sub, input);
      }
      return deleteLedgerAccount(sub, input.id, {
        deleteChildren: input.deleteChildren,
      });
    },
    onSuccess: invalidate,
  });

  return { create, update, remove };
}

/* ================================================================== */
/*  Bank Accounts                                                      */
/* ================================================================== */

export function useAccountingBankAccounts() {
  const sub = useTenantSubdomain();
  return useQuery({
    queryKey: accountingKeys.bankAccounts(sub),
    queryFn: () => listAccountingBankAccounts(sub),
    select: (payload) => payload.results,
    enabled: !!sub,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAccountingBankAccountsWithSummary() {
  const sub = useTenantSubdomain();
  return useQuery({
    queryKey: accountingKeys.bankAccounts(sub),
    queryFn: () => listAccountingBankAccounts(sub),
    enabled: !!sub,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAccountingBankAccount(id: string) {
  const sub = useTenantSubdomain();
  return useQuery({
    queryKey: accountingKeys.bankAccountDetail(sub, id),
    queryFn: () => getAccountingBankAccountDetail(sub, id),
    enabled: !!sub && !!id,
    staleTime: 2 * 60 * 1000,
  });
}

export function useAccountingBankAccountMutations() {
  const sub = useTenantSubdomain();
  const qc = getQueryClient();

  const invalidate = () =>
    qc.invalidateQueries({ queryKey: ["accounting", sub, "bank-accounts"] });

  const create = useMutation({
    mutationFn: (payload: CreateAccountingBankAccountCommand) =>
      createAccountingBankAccount(sub, payload),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateAccountingBankAccountCommand }) =>
      updateAccountingBankAccount(sub, id, payload),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteAccountingBankAccount(sub, id),
    onSuccess: invalidate,
  });

  return { create, update, remove };
}

/* ================================================================== */
/*  Transaction Types                                                  */
/* ================================================================== */

export function useTransactionTypes() {
  const sub = useTenantSubdomain();
  return useQuery({
    queryKey: accountingKeys.transactionTypes(sub),
    queryFn: () => listTransactionTypes(sub),
    enabled: !!sub,
    staleTime: 10 * 60 * 1000,
  });
}

export function useTransactionTypeMutations() {
  const sub = useTenantSubdomain();
  const qc = getQueryClient();

  const invalidate = () =>
    qc.invalidateQueries({ queryKey: accountingKeys.transactionTypes(sub) });

  const create = useMutation({
    mutationFn: (payload: CreateAccountingTransactionTypeCommand) =>
      createTransactionType(sub, payload),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateAccountingTransactionTypeCommand }) =>
      updateTransactionType(sub, id, payload),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteTransactionType(sub, id),
    onSuccess: invalidate,
  });

  return { create, update, remove };
}

/* ================================================================== */
/*  Payment Methods                                                    */
/* ================================================================== */

export function usePaymentMethods() {
  const sub = useTenantSubdomain();
  return useQuery({
    queryKey: accountingKeys.paymentMethods(sub),
    queryFn: () => listPaymentMethods(sub),
    enabled: !!sub,
    staleTime: 10 * 60 * 1000,
  });
}

/* ================================================================== */
/*  Cash Transactions                                                  */
/* ================================================================== */

export function useCashTransactions(params?: CashTransactionListParams) {
  const sub = useTenantSubdomain();
  return useQuery({
    queryKey: accountingKeys.cashTransactions(sub, params),
    queryFn: () => listCashTransactions(sub, params),
    enabled: !!sub,
    staleTime: 2 * 60 * 1000,
  });
}

export function useCashTransactionMutations() {
  const sub = useTenantSubdomain();
  const qc = getQueryClient();

  const invalidate = () =>
    qc.invalidateQueries({ queryKey: ["accounting", sub, "cash-transactions"] });

  const create = useMutation({
    mutationFn: (payload: CreateAccountingCashTransactionCommand) =>
      createCashTransaction(sub, payload),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateAccountingCashTransactionCommand }) =>
      updateCashTransaction(sub, id, payload),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteCashTransaction(sub, id),
    onSuccess: invalidate,
  });

  const approve = useMutation({
    mutationFn: (input: string | { id: string; preventJournalPosting?: boolean }) => {
      if (typeof input === "string") {
        return approveCashTransaction(sub, input);
      }
      return approveCashTransaction(sub, input.id, {
        prevent_journal_posting: input.preventJournalPosting,
      });
    },
    onSuccess: invalidate,
  });

  const reject = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      rejectCashTransaction(sub, id, reason),
    onSuccess: invalidate,
  });

  const post = useMutation({
    mutationFn: (id: string) => postCashTransaction(sub, id),
    onSuccess: () => {
      invalidate();
      qc.invalidateQueries({ queryKey: ["accounting", sub, "journal-entries"] });
    },
  });

  return { create, update, remove, approve, reject, post };
}

/* ================================================================== */
/*  Journal Entries                                                    */
/* ================================================================== */

export function useJournalEntries(params?: JournalEntryListParams) {
  const sub = useTenantSubdomain();
  return useQuery({
    queryKey: accountingKeys.journalEntries(sub, params),
    queryFn: () => listJournalEntries(sub, params),
    enabled: !!sub,
    staleTime: 2 * 60 * 1000,
  });
}

export function useJournalEntryDetail(id?: string | null) {
  const sub = useTenantSubdomain();
  return useQuery({
    queryKey: accountingKeys.journalEntryDetail(sub, id || ""),
    queryFn: () => getJournalEntryDetail(sub, id as string),
    enabled: !!sub && !!id,
    staleTime: 2 * 60 * 1000,
  });
}

export function useJournalEntryMutations() {
  const sub = useTenantSubdomain();
  const qc = getQueryClient();

  const create = useMutation({
    mutationFn: (payload: CreateAccountingJournalEntryCommand) =>
      createJournalEntry(sub, payload),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["accounting", sub, "journal-entries"] }),
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateAccountingJournalEntryCommand }) =>
      updateJournalEntry(sub, id, payload),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["accounting", sub, "journal-entries"] }),
  });

  const updateLine = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateAccountingJournalLineCommand }) =>
      updateJournalLine(sub, id, payload),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["accounting", sub, "journal-entries"] }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteJournalEntry(sub, id),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["accounting", sub, "journal-entries"] }),
  });

  const invalidateJE = () =>
    qc.invalidateQueries({ queryKey: ["accounting", sub, "journal-entries"] });
  const invalidateCT = () =>
    qc.invalidateQueries({ queryKey: ["accounting", sub, "cash-transactions"] });

  const postStudentPaymentMutation = useMutation({
    mutationFn: (payload: PostStudentPaymentCommand) =>
      postStudentPayment(sub, payload),
    onSuccess: () => { invalidateCT(); invalidateJE(); },
  });

  const postTransfer = useMutation({
    mutationFn: (payload: CreateAccountTransferCommand) =>
      createAccountTransfer(sub, payload),
    onSuccess: () => { invalidateCT(); invalidateJE(); },
  });

  const postIncome = useMutation({
    mutationFn: (payload: PostIncomeCommand) =>
      postIncomeTransaction(sub, payload),
    onSuccess: () => { invalidateCT(); invalidateJE(); },
  });

  const postExpense = useMutation({
    mutationFn: (payload: PostExpenseCommand) =>
      postExpenseTransaction(sub, payload),
    onSuccess: () => { invalidateCT(); invalidateJE(); },
  });

  const postGeneral = useMutation({
    mutationFn: (payload: PostGeneralTransactionCommand) =>
      postGeneralJournalEntry(sub, payload),
    onSuccess: () => { invalidateCT(); invalidateJE(); },
  });

  return {
    create,
    update,
    updateLine,
    remove,
    postStudentPayment: postStudentPaymentMutation,
    postTransfer,
    postIncome,
    postExpense,
    postGeneral,
  };
}

/* ================================================================== */
/*  Fee Items                                                          */
/* ================================================================== */

export function useFeeItems() {
  const sub = useTenantSubdomain();
  return useQuery({
    queryKey: accountingKeys.feeItems(sub),
    queryFn: () => listFeeItems(sub),
    enabled: !!sub,
    staleTime: 10 * 60 * 1000,
  });
}

export function useFeeItemMutations() {
  const sub = useTenantSubdomain();
  const qc = getQueryClient();

  const invalidate = () =>
    qc.invalidateQueries({ queryKey: accountingKeys.feeItems(sub) });

  const create = useMutation({
    mutationFn: (payload: CreateAccountingFeeItemCommand) =>
      createFeeItem(sub, payload),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateAccountingFeeItemCommand }) =>
      updateFeeItem(sub, id, payload),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteFeeItem(sub, id),
    onSuccess: invalidate,
  });

  return { create, update, remove };
}

/* ================================================================== */
/*  Exchange Rates                                                     */
/* ================================================================== */

export function useExchangeRates() {
  const sub = useTenantSubdomain();
  return useQuery({
    queryKey: accountingKeys.exchangeRates(sub),
    queryFn: () => listExchangeRates(sub),
    enabled: !!sub,
    staleTime: 10 * 60 * 1000,
  });
}
