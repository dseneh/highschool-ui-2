import apiClient from "@/lib/api2/client";
import type {
  AccountingCurrencyDto,
  CreateAccountingCurrencyCommand,
  UpdateAccountingCurrencyCommand,
  AccountingLedgerAccountDto,
  CreateAccountingLedgerAccountCommand,
  UpdateAccountingLedgerAccountCommand,
  AccountingBankAccountDto,
  AccountingBankAccountsListDto,
  AccountingBankAccountDetailDto,
  CreateAccountingBankAccountCommand,
  UpdateAccountingBankAccountCommand,
  AccountingTransactionTypeDto,
  CreateAccountingTransactionTypeCommand,
  UpdateAccountingTransactionTypeCommand,
  AccountingPaymentMethodDto,
  AccountingCashTransactionDto,
  CashTransactionListResponse,
  CreateAccountingCashTransactionCommand,
  UpdateAccountingCashTransactionCommand,
  CashTransactionListParams,
  AccountingJournalEntryDto,
  AccountingJournalEntryDetailDto,
  AccountingJournalLineDto,
  CreateAccountingJournalEntryCommand,
  UpdateAccountingJournalEntryCommand,
  UpdateAccountingJournalLineCommand,
  JournalEntryListParams,
  AccountingFeeItemDto,
  CreateAccountingFeeItemCommand,
  UpdateAccountingFeeItemCommand,
  AccountingExchangeRateDto,
  PostTransactionResponse,
  AccountingAccountTransferDto,
  CreateAccountTransferCommand,
  PostStudentPaymentCommand,
  PostIncomeCommand,
  PostExpenseCommand,
  PostGeneralTransactionCommand,
} from "./accounting-types";

/* ================================================================== */
/*  Currencies                                                         */
/* ================================================================== */

export async function listAccountingCurrencies(_sub: string) {
  const { data } = await apiClient.get<AccountingCurrencyDto[]>(
    "accounting/currencies"
  );
  return data;
}

export async function createAccountingCurrency(
  _sub: string,
  payload: CreateAccountingCurrencyCommand
) {
  const { data } = await apiClient.post<AccountingCurrencyDto>(
    "accounting/currencies",
    payload
  );
  return data;
}

export async function updateAccountingCurrency(
  _sub: string,
  id: string,
  payload: UpdateAccountingCurrencyCommand
) {
  const { data } = await apiClient.put<AccountingCurrencyDto>(
    `accounting/currencies/${id}`,
    payload
  );
  return data;
}

export async function deleteAccountingCurrency(_sub: string, id: string) {
  await apiClient.delete(`accounting/currencies/${id}`);
}

/* ================================================================== */
/*  Ledger Accounts (Chart of Accounts)                               */
/* ================================================================== */

export async function listLedgerAccounts(_sub: string) {
  const { data } = await apiClient.get<AccountingLedgerAccountDto[]>(
    "accounting/ledger-accounts"
  );
  return data;
}

export async function createLedgerAccount(
  _sub: string,
  payload: CreateAccountingLedgerAccountCommand
) {
  const { data } = await apiClient.post<AccountingLedgerAccountDto>(
    "accounting/ledger-accounts",
    payload
  );
  return data;
}

export async function updateLedgerAccount(
  _sub: string,
  id: string,
  payload: UpdateAccountingLedgerAccountCommand
) {
  const { data } = await apiClient.put<AccountingLedgerAccountDto>(
    `accounting/ledger-accounts/${id}`,
    payload
  );
  return data;
}

export async function deleteLedgerAccount(
  _sub: string,
  id: string,
  options?: { deleteChildren?: boolean }
) {
  await apiClient.delete(`accounting/ledger-accounts/${id}`, {
    params: options?.deleteChildren ? { delete_children: true } : undefined,
  });
}

/* ================================================================== */
/*  Bank Accounts                                                      */
/* ================================================================== */

export async function listAccountingBankAccounts(_sub: string) {
  const { data } = await apiClient.get<AccountingBankAccountsListDto | AccountingBankAccountDto[]>(
    "accounting/bank-accounts"
  );
  if (Array.isArray(data)) {
    return {
      results: data,
      summary: {
        total_accounts: data.length,
        active_accounts: data.filter((account) => account.status === "active").length,
        cash_accounts: data.filter((account) => account.account_type === "cash").length,
        balances_by_currency: [],
      },
    };
  }
  return data;
}

export async function getAccountingBankAccountDetail(_sub: string, id: string) {
  const { data } = await apiClient.get<AccountingBankAccountDetailDto>(
    `accounting/bank-accounts/${id}`
  );
  return data;
}

export async function createAccountingBankAccount(
  _sub: string,
  payload: CreateAccountingBankAccountCommand
) {
  const { data } = await apiClient.post<AccountingBankAccountDto>(
    "accounting/bank-accounts",
    payload
  );
  return data;
}

export async function updateAccountingBankAccount(
  _sub: string,
  id: string,
  payload: UpdateAccountingBankAccountCommand
) {
  const { data } = await apiClient.put<AccountingBankAccountDto>(
    `accounting/bank-accounts/${id}`,
    payload
  );
  return data;
}

export async function deleteAccountingBankAccount(_sub: string, id: string) {
  await apiClient.delete(`accounting/bank-accounts/${id}`);
}

/* ================================================================== */
/*  Transaction Types                                                  */
/* ================================================================== */

export async function listTransactionTypes(_sub: string) {
  const { data } = await apiClient.get<AccountingTransactionTypeDto[]>(
    "accounting/transaction-types"
  );
  return data;
}

export async function createTransactionType(
  _sub: string,
  payload: CreateAccountingTransactionTypeCommand
) {
  const { data } = await apiClient.post<AccountingTransactionTypeDto>(
    "accounting/transaction-types",
    payload
  );
  return data;
}

export async function updateTransactionType(
  _sub: string,
  id: string,
  payload: UpdateAccountingTransactionTypeCommand
) {
  const { data } = await apiClient.put<AccountingTransactionTypeDto>(
    `accounting/transaction-types/${id}`,
    payload
  );
  return data;
}

export async function deleteTransactionType(_sub: string, id: string) {
  await apiClient.delete(`accounting/transaction-types/${id}`);
}

/* ================================================================== */
/*  Payment Methods                                                    */
/* ================================================================== */

export async function listPaymentMethods(_sub: string) {
  const { data } = await apiClient.get<AccountingPaymentMethodDto[]>(
    "accounting/payment-methods"
  );
  return data;
}

/* ================================================================== */
/*  Cash Transactions                                                  */
/* ================================================================== */

export async function listCashTransactions(
  _sub: string,
  params?: CashTransactionListParams
) {
  const { data } = await apiClient.get<
    AccountingCashTransactionDto[] | CashTransactionListResponse
  >(
    "accounting/cash-transactions",
    { params }
  );

  if (Array.isArray(data)) {
    return {
      count: data.length,
      next: null,
      previous: null,
      results: data,
    } satisfies CashTransactionListResponse;
  }

  return {
    count: data.count ?? 0,
    next: data.next ?? null,
    previous: data.previous ?? null,
    results: Array.isArray(data.results) ? data.results : [],
  } satisfies CashTransactionListResponse;
}

export async function createCashTransaction(
  _sub: string,
  payload: CreateAccountingCashTransactionCommand
) {
  const { data } = await apiClient.post<AccountingCashTransactionDto>(
    "accounting/cash-transactions",
    payload
  );
  return data;
}

export async function updateCashTransaction(
  _sub: string,
  id: string,
  payload: UpdateAccountingCashTransactionCommand
) {
  const { data } = await apiClient.put<AccountingCashTransactionDto>(
    `accounting/cash-transactions/${id}`,
    payload
  );
  return data;
}

export async function deleteCashTransaction(_sub: string, id: string) {
  await apiClient.delete(`accounting/cash-transactions/${id}`);
}

export async function approveCashTransaction(
  _sub: string,
  id: string,
  options?: { prevent_journal_posting?: boolean }
) {
  const payload = options?.prevent_journal_posting
    ? { prevent_journal_posting: true }
    : {};
  const { data } = await apiClient.put<AccountingCashTransactionDto>(
    `accounting/cash-transactions/${id}/approve`,
    payload
  );
  return data;
}

export async function rejectCashTransaction(
  _sub: string,
  id: string,
  rejection_reason: string
) {
  const { data } = await apiClient.put<AccountingCashTransactionDto>(
    `accounting/cash-transactions/${id}/reject`,
    { rejection_reason }
  );
  return data;
}

export async function postCashTransaction(_sub: string, id: string) {
  const { data } = await apiClient.post<PostTransactionResponse>(
    `accounting/cash-transactions/${id}/post`
  );
  return data;
}

/* ================================================================== */
/*  Journal Entries                                                    */
/* ================================================================== */

export async function listJournalEntries(
  _sub: string,
  params?: JournalEntryListParams
) {
  const { data } = await apiClient.get<
    AccountingJournalEntryDto[] | { results?: AccountingJournalEntryDto[] }
  >(
    "accounting/journal-entries",
    { params }
  );

  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
  return [];
}

export async function createJournalEntry(
  _sub: string,
  payload: CreateAccountingJournalEntryCommand
) {
  const { data } = await apiClient.post<AccountingJournalEntryDto>(
    "accounting/journal-entries",
    payload
  );
  return data;
}

export async function updateJournalEntry(
  _sub: string,
  id: string,
  payload: UpdateAccountingJournalEntryCommand
) {
  const { data } = await apiClient.put<AccountingJournalEntryDto>(
    `accounting/journal-entries/${id}`,
    payload
  );
  return data;
}

export async function deleteJournalEntry(_sub: string, id: string) {
  await apiClient.delete(`accounting/journal-entries/${id}`);
}

export async function getJournalEntryDetail(_sub: string, id: string) {
  const { data } = await apiClient.get<AccountingJournalEntryDetailDto>(
    `accounting/journal-entries/${id}`
  );
  return data;
}

export async function updateJournalLine(
  _sub: string,
  id: string,
  payload: UpdateAccountingJournalLineCommand
) {
  const { data } = await apiClient.patch<AccountingJournalLineDto>(
    `accounting/journal-lines/${id}`,
    payload
  );
  return data;
}

/* ================================================================== */
/*  Fee Items                                                          */
/* ================================================================== */

export async function listFeeItems(_sub: string) {
  const { data } = await apiClient.get<AccountingFeeItemDto[]>(
    "accounting/fee-items"
  );
  return data;
}

export async function createFeeItem(
  _sub: string,
  payload: CreateAccountingFeeItemCommand
) {
  const { data } = await apiClient.post<AccountingFeeItemDto>(
    "accounting/fee-items",
    payload
  );
  return data;
}

export async function updateFeeItem(
  _sub: string,
  id: string,
  payload: UpdateAccountingFeeItemCommand
) {
  const { data } = await apiClient.put<AccountingFeeItemDto>(
    `accounting/fee-items/${id}`,
    payload
  );
  return data;
}

export async function deleteFeeItem(_sub: string, id: string) {
  await apiClient.delete(`accounting/fee-items/${id}`);
}

/* ================================================================== */
/*  Exchange Rates                                                     */
/* ================================================================== */

export async function listExchangeRates(_sub: string) {
  const { data } = await apiClient.get<AccountingExchangeRateDto[]>(
    "accounting/exchange-rates"
  );
  return data;
}

/* ================================================================== */
/*  Account Transfers                                                  */
/* ================================================================== */

export async function createAccountTransfer(
  _sub: string,
  payload: CreateAccountTransferCommand
) {
  const { data } = await apiClient.post<AccountingAccountTransferDto>(
    "accounting/account-transfers",
    payload
  );
  return data;
}

/* ================================================================== */
/*  Specialized Posting Helpers                                        */
/* ================================================================== */

/** Post a student payment as a pending cash transaction */
export async function postStudentPayment(
  _sub: string,
  payload: PostStudentPaymentCommand
) {
  const { data } = await apiClient.post<AccountingCashTransactionDto>(
    "accounting/cash-transactions",
    payload
  );
  return data;
}

/** Post an income cash transaction */
export async function postIncomeTransaction(
  _sub: string,
  payload: PostIncomeCommand
) {
  const { data } = await apiClient.post<AccountingCashTransactionDto>(
    "accounting/cash-transactions",
    payload
  );
  return data;
}

/** Post an expense cash transaction */
export async function postExpenseTransaction(
  _sub: string,
  payload: PostExpenseCommand
) {
  const { data } = await apiClient.post<AccountingCashTransactionDto>(
    "accounting/cash-transactions",
    payload
  );
  return data;
}

/** Post a general journal entry (manual debit/credit) */
export async function postGeneralJournalEntry(
  _sub: string,
  payload: PostGeneralTransactionCommand
) {
  const { data } = await apiClient.post<AccountingJournalEntryDto>(
    "accounting/journal-entries",
    payload
  );
  return data;
}
