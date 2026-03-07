"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { useTenantSubdomain } from "@/hooks/use-tenant-subdomain";
import {
  listTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  approveTransaction,
  cancelTransaction,
  bulkApproveTransactions,
  bulkCancelTransactions,
  bulkDeleteTransactions,
  accountTransfer,
  createBulkTransaction,
  listBankAccounts,
  getBankAccount,
  createBankAccount,
  updateBankAccount,
  deleteBankAccount,
  listTransactionTypes,
  createTransactionType,
  updateTransactionType,
  deleteTransactionType,
  listPaymentMethods,
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
  listCurrencies,
  listGeneralFees,
  createGeneralFee,
  updateGeneralFee,
  deleteGeneralFee,
  listSectionFees,
  assignSectionFees,
  updateSectionFee,
  deleteSectionFee,
  listInstallments,
  createInstallment,
  updateInstallment,
  bulkUpdateInstallments,
  deleteInstallment,
  getBillingSummary,
  getPaymentStatus,
} from "@/lib/api/finance-service";
import type {
  TransactionDto,
  TransactionListParams,
  CreateTransactionCommand,
  UpdateTransactionCommand,
  AccountTransferCommand,
  BankAccountDto,
  BankAccountDetailDto,
  CreateBankAccountCommand,
  UpdateBankAccountCommand,
  TransactionTypeDto,
  CreateTransactionTypeCommand,
  UpdateTransactionTypeCommand,
  PaymentMethodDto,
  CreatePaymentMethodCommand,
  UpdatePaymentMethodCommand,
  CurrencyDto,
  GeneralFeeDto,
  CreateGeneralFeeCommand,
  UpdateGeneralFeeCommand,
  SectionFeeDto,
  PaymentInstallmentDto,
  CreateInstallmentCommand,
  UpdateInstallmentCommand,
  PaginatedResponse,
  BillingSummaryItemDto,
  BillingSummaryParams,
  StudentPaymentStatusDto,
  PaymentStatusParams,
} from "@/lib/api/finance-types";
import {getQueryClient} from '@/lib/query-client';

/* ================================================================== */
/*  Query Keys                                                         */
/* ================================================================== */

export const financeKeys = {
  // Transactions
  transactions: (sub: string) => ["transactions", sub] as const,
  transactionList: (sub: string, params?: TransactionListParams) =>
    ["transactions", sub, "list", params] as const,
  transactionDetail: (sub: string, id: string) =>
    ["transactions", sub, id] as const,

  // Bank Accounts
  bankAccounts: (sub: string) => ["bankAccounts", sub] as const,
  bankAccountDetail: (sub: string, id: string) =>
    ["bankAccounts", sub, id] as const,

  // Transaction Types
  transactionTypes: (sub: string) => ["transactionTypes", sub] as const,

  // Payment Methods
  paymentMethods: (sub: string) => ["paymentMethods", sub] as const,

  // Currencies
  currencies: (sub: string) => ["currencies", sub] as const,

  // General Fees
  generalFees: (sub: string) => ["generalFees", sub] as const,

  // Section Fees
  sectionFees: (sub: string, sectionId: string) =>
    ["sectionFees", sub, sectionId] as const,

  // Installments
  installments: (sub: string, yearId: string) =>
    ["installments", sub, yearId] as const,

  // Billing Summary
  billingSummary: (sub: string, params: BillingSummaryParams) =>
    ["billingSummary", sub, params] as const,

  // Payment Status
  paymentStatus: (sub: string, params?: PaymentStatusParams) =>
    ["paymentStatus", sub, params] as const,
};

/* ================================================================== */
/*  Transactions                                                       */
/* ================================================================== */

export function useTransactions(params?: TransactionListParams) {
  const sub = useTenantSubdomain();
  return useQuery<PaginatedResponse<TransactionDto>>({
    queryKey: financeKeys.transactionList(sub, params),
    queryFn: () => listTransactions(sub, params),
    enabled: Boolean(sub),
  });
}

export function useTransaction(id: string | undefined) {
  const sub = useTenantSubdomain();
  return useQuery<TransactionDto>({
    queryKey: financeKeys.transactionDetail(sub, id ?? ""),
    queryFn: () => getTransaction(sub, id!),
    enabled: Boolean(sub) && Boolean(id),
  });
}

export function useTransactionMutations(studentId?: string) {
  const sub = useTenantSubdomain();
  const qc = getQueryClient();

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ["transactions", sub] });
    void qc.invalidateQueries({ queryKey: ["installments", sub] });
    void qc.invalidateQueries({ queryKey: ["billingSummary", sub] });
    void qc.invalidateQueries({ queryKey: ["paymentStatus", sub] });
    if (studentId) {
      void qc.invalidateQueries({ queryKey: ["billing", "student-bills", sub, studentId] });
      void qc.invalidateQueries({ queryKey: ["transactions", "student", sub, studentId] });
    }
  };

  const create = useMutation({
    mutationFn: (payload: CreateTransactionCommand) =>
      createTransaction(sub, payload),
    onSuccess: () => {
      void invalidate();
      void qc.invalidateQueries({ queryKey: financeKeys.bankAccounts(sub) });
    },
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTransactionCommand }) =>
      updateTransaction(sub, id, payload),
    onSuccess: () => {
      void invalidate();
      void qc.invalidateQueries({ queryKey: financeKeys.bankAccounts(sub) });
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteTransaction(sub, id),
    onSuccess: () => {
      void invalidate();
      void qc.invalidateQueries({ queryKey: financeKeys.bankAccounts(sub) });
    },
  });

  const approve = useMutation({
    mutationFn: (id: string) => approveTransaction(sub, id),
    onSuccess: () => {
      void invalidate();
      void qc.invalidateQueries({ queryKey: financeKeys.bankAccounts(sub) });
    },
  });

  const cancel = useMutation({
    mutationFn: (id: string) => cancelTransaction(sub, id),
    onSuccess: () => {
      void invalidate();
      void qc.invalidateQueries({ queryKey: financeKeys.bankAccounts(sub) });
    },
  });

  const bulkApprove = useMutation({
    mutationFn: (transactionIds: string[]) =>
      bulkApproveTransactions(sub, transactionIds),
    onSuccess: () => {
      void invalidate();
      void qc.invalidateQueries({ queryKey: financeKeys.bankAccounts(sub) });
    },
  });

  const bulkCancel = useMutation({
    mutationFn: (transactionIds: string[]) =>
      bulkCancelTransactions(sub, transactionIds),
    onSuccess: () => {
      void invalidate();
      void qc.invalidateQueries({ queryKey: financeKeys.bankAccounts(sub) });
    },
  });

  const bulkDelete = useMutation({
    mutationFn: (transactionIds: string[]) =>
      bulkDeleteTransactions(sub, transactionIds),
    onSuccess: () => {
      void invalidate();
      void qc.invalidateQueries({ queryKey: financeKeys.bankAccounts(sub) });
    },
  });

  const transfer = useMutation({
    mutationFn: (payload: AccountTransferCommand) =>
      accountTransfer(sub, payload),
    onSuccess: () => {
      void invalidate();
      void qc.invalidateQueries({ queryKey: financeKeys.bankAccounts(sub) });
    },
  });

  const bulkCreate = useMutation({
    mutationFn: ({ type, payload }: { type: string; payload: import("@/lib/api/finance-types").BulkTransactionCommand }) =>
      createBulkTransaction(sub, type, payload),
    onSuccess: () => {
      void invalidate();
      void qc.invalidateQueries({ queryKey: financeKeys.bankAccounts(sub) });
    },
  });

  return { create, update, remove, approve, cancel, bulkApprove, bulkCancel, bulkDelete, transfer, bulkCreate };
}

/* ================================================================== */
/*  Bank Accounts                                                      */
/* ================================================================== */

export function useBankAccounts(
  params?: { include_basic_analysis?: boolean }
) {
  const sub = useTenantSubdomain();
  return useQuery<PaginatedResponse<BankAccountDto>>({
    queryKey: [...financeKeys.bankAccounts(sub), params],
    queryFn: () => listBankAccounts(sub, params),
    enabled: Boolean(sub),
  });
}

export function useBankAccount(id: string | undefined) {
  const sub = useTenantSubdomain();
  return useQuery<BankAccountDetailDto>({
    queryKey: financeKeys.bankAccountDetail(sub, id ?? ""),
    queryFn: () => getBankAccount(sub, id!, { include_basic_analysis: true, include_analysis: true }),
    enabled: Boolean(sub) && Boolean(id),
  });
}

export function useBankAccountMutations() {
  const sub = useTenantSubdomain();
  const qc = getQueryClient();

  const invalidate = () =>
    qc.invalidateQueries({ queryKey: financeKeys.bankAccounts(sub) });

  const create = useMutation({
    mutationFn: (payload: CreateBankAccountCommand) =>
      createBankAccount(sub, payload),
    onSuccess: () => void invalidate(),
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateBankAccountCommand }) =>
      updateBankAccount(sub, id, payload),
    onSuccess: () => void invalidate(),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteBankAccount(sub, id),
    onSuccess: () => void invalidate(),
  });

  return { create, update, remove };
}

/* ================================================================== */
/*  Transaction Types                                                  */
/* ================================================================== */

export function useTransactionTypes() {
  const sub = useTenantSubdomain();
  return useQuery<TransactionTypeDto[]>({
    queryKey: financeKeys.transactionTypes(sub),
    queryFn: () => listTransactionTypes(sub),
    enabled: Boolean(sub),
  });
}

export function useTransactionTypeMutations() {
  const sub = useTenantSubdomain();
  const qc = getQueryClient();

  const invalidate = () =>
    qc.invalidateQueries({ queryKey: financeKeys.transactionTypes(sub) });

  const create = useMutation({
    mutationFn: (payload: CreateTransactionTypeCommand) =>
      createTransactionType(sub, payload),
    onSuccess: () => void invalidate(),
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTransactionTypeCommand }) =>
      updateTransactionType(sub, id, payload),
    onSuccess: () => void invalidate(),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteTransactionType(sub, id),
    onSuccess: () => void invalidate(),
  });

  return { create, update, remove };
}

/* ================================================================== */
/*  Payment Methods                                                    */
/* ================================================================== */

export function usePaymentMethods() {
  const sub = useTenantSubdomain();
  return useQuery<PaymentMethodDto[]>({
    queryKey: financeKeys.paymentMethods(sub),
    queryFn: () => listPaymentMethods(sub),
    enabled: Boolean(sub),
  });
}

export function usePaymentMethodMutations() {
  const sub = useTenantSubdomain();
  const qc = getQueryClient();

  const invalidate = () =>
    qc.invalidateQueries({ queryKey: financeKeys.paymentMethods(sub) });

  const create = useMutation({
    mutationFn: (payload: CreatePaymentMethodCommand) =>
      createPaymentMethod(sub, payload),
    onSuccess: () => void invalidate(),
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdatePaymentMethodCommand }) =>
      updatePaymentMethod(sub, id, payload),
    onSuccess: () => void invalidate(),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deletePaymentMethod(sub, id),
    onSuccess: () => void invalidate(),
  });

  return { create, update, remove };
}

/* ================================================================== */
/*  Currencies                                                         */
/* ================================================================== */

export function useCurrencies() {
  const sub = useTenantSubdomain();
  return useQuery<CurrencyDto[]>({
    queryKey: financeKeys.currencies(sub),
    queryFn: () => listCurrencies(sub),
    enabled: Boolean(sub),
  });
}

/* ================================================================== */
/*  General Fees                                                       */
/* ================================================================== */

export function useGeneralFees() {
  const sub = useTenantSubdomain();
  return useQuery<GeneralFeeDto[]>({
    queryKey: financeKeys.generalFees(sub),
    queryFn: () => listGeneralFees(sub),
    enabled: Boolean(sub),
  });
}

export function useGeneralFeeMutations() {
  const sub = useTenantSubdomain();
  const qc = getQueryClient();

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: financeKeys.generalFees(sub) });
    void qc.invalidateQueries({ queryKey: ["installments", sub] });
    void qc.invalidateQueries({ queryKey: ["billingSummary", sub] });
    void qc.invalidateQueries({ queryKey: ["paymentStatus", sub] });
  };

  const create = useMutation({
    mutationFn: (payload: CreateGeneralFeeCommand) =>
      createGeneralFee(sub, payload),
    onSuccess: () => void invalidate(),
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateGeneralFeeCommand }) =>
      updateGeneralFee(sub, id, payload),
    onSuccess: () => void invalidate(),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteGeneralFee(sub, id),
    onSuccess: () => void invalidate(),
  });

  return { create, update, remove, deleteById: remove };
}

/* ================================================================== */
/*  Section Fees                                                       */
/* ================================================================== */

export function useSectionFees(sectionId: string | undefined) {
  const sub = useTenantSubdomain();
  return useQuery<SectionFeeDto[]>({
    queryKey: financeKeys.sectionFees(sub, sectionId ?? ""),
    queryFn: () => listSectionFees(sub, sectionId!),
    enabled: Boolean(sub) && Boolean(sectionId),
  });
}

export function useSectionFeeMutations() {
  const sub = useTenantSubdomain();
  const qc = getQueryClient();

  const invalidateSection = (sectionId: string) => {
    void qc.invalidateQueries({
      queryKey: financeKeys.sectionFees(sub, sectionId),
    });
    void qc.invalidateQueries({ queryKey: ["sections"] });
    void qc.invalidateQueries({ queryKey: ["installments", sub] });
    void qc.invalidateQueries({ queryKey: ["billingSummary", sub] });
    void qc.invalidateQueries({ queryKey: ["paymentStatus", sub] });
  };

  const assign = useMutation({
    mutationFn: ({
      sectionId,
      feeIds,
    }: {
      sectionId: string;
      feeIds: string[];
    }) => assignSectionFees(sub, sectionId, feeIds),
    onSuccess: (_, variables) => invalidateSection(variables.sectionId),
  });

  const update = useMutation({
    mutationFn: ({
      id,
      sectionId,
      payload,
    }: {
      id: string;
      sectionId: string;
      payload: { amount?: number; active?: boolean };
    }) => updateSectionFee(sub, id, payload),
    onSuccess: (_, variables) => invalidateSection(variables.sectionId),
  });

  const remove = useMutation({
    mutationFn: ({ id, sectionId }: { id: string; sectionId: string }) =>
      deleteSectionFee(sub, id),
    onSuccess: (_, variables) => invalidateSection(variables.sectionId),
  });

  return { assign, update, remove, deleteById: remove };
}

/* ================================================================== */
/*  Payment Installments                                               */
/* ================================================================== */

export function useInstallments(academicYearId: string | undefined) {
  const sub = useTenantSubdomain();
  return useQuery<PaymentInstallmentDto[]>({
    queryKey: financeKeys.installments(sub, academicYearId ?? ""),
    queryFn: () => listInstallments(sub, academicYearId!),
    enabled: Boolean(sub) && Boolean(academicYearId),
  });
}

export function useInstallmentMutations(academicYearId: string | undefined) {
  const sub = useTenantSubdomain();
  const qc = getQueryClient();

  const invalidate = () => {
    if (academicYearId) {
      void qc.invalidateQueries({
        queryKey: financeKeys.installments(sub, academicYearId),
      });
    }
    void qc.invalidateQueries({ queryKey: ["installments", sub] });
    void qc.invalidateQueries({ queryKey: ["billingSummary", sub] });
    void qc.invalidateQueries({ queryKey: ["paymentStatus", sub] });
    void qc.invalidateQueries({ queryKey: ["billing", "student-bills", sub] });
  };

  const create = useMutation({
    mutationFn: (
      payload: CreateInstallmentCommand | CreateInstallmentCommand[]
    ) => createInstallment(sub, academicYearId!, payload),
    onSuccess: () => void invalidate(),
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateInstallmentCommand }) =>
      updateInstallment(sub, id, payload),
    onSuccess: () => void invalidate(),
  });

  const bulkUpdate = useMutation({
    mutationFn: (payload: UpdateInstallmentCommand[]) =>
      bulkUpdateInstallments(sub, academicYearId!, payload),
    onSuccess: () => void invalidate(),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteInstallment(sub, id),
    onSuccess: () => void invalidate(),
  });

  return { create, update, bulkUpdate, remove };
}

/* ================================================================== */
/*  Billing Summary                                                    */
/* ================================================================== */

export function useBillingSummary(params: BillingSummaryParams) {
  const sub = useTenantSubdomain();
  return useQuery<PaginatedResponse<BillingSummaryItemDto>>({
    queryKey: financeKeys.billingSummary(sub, params),
    queryFn: () => getBillingSummary(sub, params),
    enabled: Boolean(sub) && Boolean(params.academic_year_id),
  });
}

/* ================================================================== */
/*  Payment Status                                                     */
/* ================================================================== */

export function usePaymentStatus(params?: PaymentStatusParams) {
  const sub = useTenantSubdomain();
  return useQuery<PaginatedResponse<StudentPaymentStatusDto>>({
    queryKey: financeKeys.paymentStatus(sub, params),
    queryFn: () => getPaymentStatus(sub, params ?? {}),
    enabled: Boolean(sub),
  });
}
