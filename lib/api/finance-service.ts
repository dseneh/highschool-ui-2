import apiClient from "@/lib/api-client";
import type {
  PaginatedResponse,
  TransactionDto,
  TransactionListParams,
  CreateTransactionCommand,
  UpdateTransactionCommand,
  AccountTransferCommand,
  BulkTransactionCommand,
  BulkTransactionResponse,
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
  BillingSummaryItemDto,
  BillingSummaryParams,
  StudentPaymentStatusDto,
  PaymentStatusParams,
} from "./finance-types";

/* ================================================================== */
/*  Transactions                                                       */
/* ================================================================== */

/** GET /transactions/ */
export async function listTransactions(
  _subdomain: string,
  params?: TransactionListParams
) {
  const { data } = await apiClient.get<PaginatedResponse<TransactionDto>>(
    "transactions",
    { params }
  );
  return data;
}

/** GET /transactions/{id}/ */
export async function getTransaction(_subdomain: string, id: string) {
  const { data } = await apiClient.get<TransactionDto>(`transactions/${id}`);
  return data;
}

/** POST /transactions/ */
export async function createTransaction(
  _subdomain: string,
  payload: CreateTransactionCommand
) {
  const { data } = await apiClient.post<TransactionDto>(
    "transactions",
    payload
  );
  return data;
}

/** PUT /transactions/{id}/ */
export async function updateTransaction(
  _subdomain: string,
  id: string,
  payload: UpdateTransactionCommand
) {
  const { data } = await apiClient.put<TransactionDto>(
    `transactions/${id}`,
    payload
  );
  return data;
}

/** DELETE /transactions/{id}/ */
export async function deleteTransaction(_subdomain: string, id: string) {
  await apiClient.delete(`transactions/${id}`);
}

/** PUT /transactions/{id}/status/ */
export async function updateTransactionStatus(
  _subdomain: string,
  id: string,
  status: string
) {
  const { data } = await apiClient.put<TransactionDto>(
    `transactions/${id}/status`,
    { status }
  );
  return data;
}

/** PUT /transactions/{id}/approve/ */
export async function approveTransaction(_subdomain: string, id: string) {
  const { data } = await apiClient.put<TransactionDto>(
    `transactions/${id}/approve`
  );
  return data;
}

/** PUT /transactions/{id}/cancel/ */
export async function cancelTransaction(_subdomain: string, id: string) {
  const { data } = await apiClient.put<TransactionDto>(
    `transactions/${id}/cancel`
  );
  return data;
}

/** POST /transactions/bulk-approve/ */
export async function bulkApproveTransactions(
  _subdomain: string,
  transactionIds: string[]
) {
  const { data } = await apiClient.post<{
    success: boolean;
    updated: number;
    message: string;
  }>(`transactions/bulk-approve`, {
    transaction_ids: transactionIds,
  });
  return data;
}

/** POST /transactions/bulk-cancel/ */
export async function bulkCancelTransactions(
  _subdomain: string,
  transactionIds: string[]
) {
  const { data } = await apiClient.post<{
    success: boolean;
    updated: number;
    message: string;
  }>(`transactions/bulk-cancel`, {
    transaction_ids: transactionIds,
  });
  return data;
}

/** POST /transactions/bulk-delete/ */
export async function bulkDeleteTransactions(
  _subdomain: string,
  transactionIds: string[]
) {
  const { data } = await apiClient.post<{
    success: boolean;
    deleted: number;
    message: string;
  }>(`transactions/bulk-delete`, {
    transaction_ids: transactionIds,
  });
  return data;
}

/** POST /transactions/account-transfer/ */
export async function accountTransfer(
  _subdomain: string,
  payload: AccountTransferCommand
) {
  const { data } = await apiClient.post("transactions/account-transfer", payload);
  return data;
}

/** POST /transactions/bulk/{type}/ */
export async function createBulkTransaction(
  _subdomain: string,
  type: string,
  payload: BulkTransactionCommand
) {
  const { data } = await apiClient.post<BulkTransactionResponse>(
    `transactions/bulk/${type}`,
    payload
  );
  return data;
}

/** GET /transactions/students/{studentId}/ */
export async function getStudentTransactions(
  _subdomain: string,
  studentId: string,
  params?: { academic_year?: string; status?: string }
) {
  const { data } = await apiClient.get<TransactionDto[]>(
    `transactions/students/${studentId}`,
    { params }
  );
  return data;
}

/* ================================================================== */
/*  Bank Accounts                                                      */
/* ================================================================== */

/** GET /bankaccounts/ */
export async function listBankAccounts(
  _subdomain: string,
  params?: { include_basic_analysis?: boolean; include_analysis?: boolean }
) {
  const { data } = await apiClient.get<PaginatedResponse<BankAccountDto>>(
    "bankaccounts",
    { params }
  );
  return data;
}

/** GET /bankaccounts/{id}/ */
export async function getBankAccount(
  _subdomain: string,
  id: string,
  params?: { include_basic_analysis?: boolean; include_analysis?: boolean }
) {
  const { data } = await apiClient.get<BankAccountDetailDto>(
    `bankaccounts/${id}`,
    { params }
  );
  return data;
}

/** POST /bankaccounts/ */
export async function createBankAccount(
  _subdomain: string,
  payload: CreateBankAccountCommand
) {
  const { data } = await apiClient.post<BankAccountDto>(
    "bankaccounts",
    payload
  );
  return data;
}

/** PUT /bankaccounts/{id}/ */
export async function updateBankAccount(
  _subdomain: string,
  id: string,
  payload: UpdateBankAccountCommand
) {
  const { data } = await apiClient.put<BankAccountDto>(
    `bankaccounts/${id}`,
    payload
  );
  return data;
}

/** DELETE /bankaccounts/{id}/ */
export async function deleteBankAccount(_subdomain: string, id: string) {
  await apiClient.delete(`bankaccounts/${id}`);
}

/* ================================================================== */
/*  Transaction Types                                                  */
/* ================================================================== */

/** GET /transaction-types/ */
export async function listTransactionTypes(
  _subdomain: string,
  params?: { include_hidden?: boolean; search?: string }
) {
  const { data } = await apiClient.get<TransactionTypeDto[]>(
    "transaction-types",
    { params }
  );
  return data;
}

/** POST /transaction-types/ */
export async function createTransactionType(
  _subdomain: string,
  payload: CreateTransactionTypeCommand
) {
  const { data } = await apiClient.post<TransactionTypeDto>(
    "transaction-types",
    payload
  );
  return data;
}

/** PUT /transaction-types/{id}/ */
export async function updateTransactionType(
  _subdomain: string,
  id: string,
  payload: UpdateTransactionTypeCommand
) {
  const { data } = await apiClient.put<TransactionTypeDto>(
    `transaction-types/${id}`,
    payload
  );
  return data;
}

/** DELETE /transaction-types/{id}/ */
export async function deleteTransactionType(_subdomain: string, id: string) {
  await apiClient.delete(`transaction-types/${id}`);
}

/* ================================================================== */
/*  Payment Methods                                                    */
/* ================================================================== */

/** GET /payment-methods/ */
export async function listPaymentMethods(_subdomain: string) {
  const { data } = await apiClient.get<PaymentMethodDto[]>("payment-methods");
  return data;
}

/** POST /payment-methods/ */
export async function createPaymentMethod(
  _subdomain: string,
  payload: CreatePaymentMethodCommand
) {
  const { data } = await apiClient.post<PaymentMethodDto>(
    "payment-methods",
    payload
  );
  return data;
}

/** PUT /payment-methods/{id}/ */
export async function updatePaymentMethod(
  _subdomain: string,
  id: string,
  payload: UpdatePaymentMethodCommand
) {
  const { data } = await apiClient.put<PaymentMethodDto>(
    `payment-methods/${id}`,
    payload
  );
  return data;
}

/** DELETE /payment-methods/{id}/ */
export async function deletePaymentMethod(_subdomain: string, id: string) {
  await apiClient.delete(`payment-methods/${id}`);
}

/* ================================================================== */
/*  Currencies                                                         */
/* ================================================================== */

/** GET /currencies/ */
export async function listCurrencies(_subdomain: string) {
  const { data } = await apiClient.get<CurrencyDto[]>("currencies");
  return data;
}

/** POST /currencies/ */
export async function createCurrency(
  _subdomain: string,
  payload: { name: string; symbol: string; code: string }
) {
  const { data } = await apiClient.post<CurrencyDto>("currencies", payload);
  return data;
}

/* ================================================================== */
/*  General Fees                                                       */
/* ================================================================== */

/** GET /general-fees/ */
export async function listGeneralFees(_subdomain: string) {
  const { data } = await apiClient.get<GeneralFeeDto[]>("general-fees");
  return data;
}

/** GET /general-fees/{id}/ */
export async function getGeneralFee(_subdomain: string, id: string) {
  const { data } = await apiClient.get<GeneralFeeDto>(`general-fees/${id}`);
  return data;
}

/** POST /general-fees/ */
export async function createGeneralFee(
  _subdomain: string,
  payload: CreateGeneralFeeCommand
) {
  const { data } = await apiClient.post<GeneralFeeDto>(
    "general-fees",
    payload
  );
  return data;
}

/** PUT /general-fees/{id}/ */
export async function updateGeneralFee(
  _subdomain: string,
  id: string,
  payload: UpdateGeneralFeeCommand
) {
  const { data } = await apiClient.put<GeneralFeeDto>(
    `general-fees/${id}`,
    payload
  );
  return data;
}

/** DELETE /general-fees/{id}/ */
export async function deleteGeneralFee(_subdomain: string, id: string) {
  await apiClient.delete(`general-fees/${id}`);
}

/* ================================================================== */
/*  Section Fees                                                       */
/* ================================================================== */

/** GET /sections/{sectionId}/section-fees/ */
export async function listSectionFees(
  _subdomain: string,
  sectionId: string
) {
  const { data } = await apiClient.get<SectionFeeDto[]>(
    `sections/${sectionId}/section-fees`
  );
  return data;
}

/** POST /sections/{sectionId}/section-fees/ */
export async function assignSectionFees(
  _subdomain: string,
  sectionId: string,
  feeIds: string[]
) {
  const { data } = await apiClient.post(
    `sections/${sectionId}/section-fees`,
    { fees: feeIds }
  );
  return data;
}

/** PUT /section-fees/{id}/ */
export async function updateSectionFee(
  _subdomain: string,
  id: string,
  payload: { amount?: number; active?: boolean }
) {
  const { data } = await apiClient.put<SectionFeeDto>(
    `section-fees/${id}`,
    payload
  );
  return data;
}

/** DELETE /section-fees/{id}/ */
export async function deleteSectionFee(_subdomain: string, id: string) {
  await apiClient.delete(`section-fees/${id}`);
}

/* ================================================================== */
/*  Payment Installments                                               */
/* ================================================================== */

/** GET /academic-years/{academicYearId}/installments/ */
export async function listInstallments(
  _subdomain: string,
  academicYearId: string
) {
  const { data } = await apiClient.get<PaymentInstallmentDto[]>(
    `academic-years/${academicYearId}/installments`
  );
  return data;
}

/** POST /academic-years/{academicYearId}/installments/ */
export async function createInstallment(
  _subdomain: string,
  academicYearId: string,
  payload: CreateInstallmentCommand | CreateInstallmentCommand[]
) {
  const { data } = await apiClient.post<PaymentInstallmentDto | PaymentInstallmentDto[]>(
    `academic-years/${academicYearId}/installments`,
    payload
  );
  return data;
}

/** PUT /installments/{id}/ */
export async function updateInstallment(
  _subdomain: string,
  id: string,
  payload: UpdateInstallmentCommand
) {
  const { data } = await apiClient.put<PaymentInstallmentDto>(
    `installments/${id}`,
    payload
  );
  return data;
}

/** PUT /academic-years/{academicYearId}/installments/ (bulk update) */
export async function bulkUpdateInstallments(
  _subdomain: string,
  academicYearId: string,
  payload: UpdateInstallmentCommand[]
) {
  const { data } = await apiClient.put<PaymentInstallmentDto[]>(
    `academic-years/${academicYearId}/installments`,
    payload
  );
  return data;
}

/** DELETE /installments/{id}/ */
export async function deleteInstallment(_subdomain: string, id: string) {
  await apiClient.delete(`installments/${id}`);
}

/* ================================================================== */
/*  Billing Summary                                                    */
/* ================================================================== */

/** GET /bill-summary/ */
export async function getBillingSummary(
  _subdomain: string,
  params: BillingSummaryParams
) {
  const { data } = await apiClient.get<PaginatedResponse<BillingSummaryItemDto>>(
    "bill-summary",
    { params }
  );
  return data;
}

/** GET /bill-summary/download/ */
export async function downloadBillingSummary(
  _subdomain: string,
  params: BillingSummaryParams
): Promise<Blob> {
  const { data } = await apiClient.get("bill-summary/download", {
    params,
    responseType: "blob",
  });
  return data;
}

/* ================================================================== */
/*  Payment Status                                                     */
/* ================================================================== */

/** GET /students/payment-status/ */
export async function getPaymentStatus(
  _subdomain: string,
  params: PaymentStatusParams
) {
  const { data } = await apiClient.get<PaginatedResponse<StudentPaymentStatusDto>>(
    "students/payment-status",
    { params }
  );
  return data;
}
