/* ------------------------------------------------------------------ */
/*  Accounting Types                                                   */
/* ------------------------------------------------------------------ */

// ── Enums ──────────────────────────────────────────────────────────

export type AccountType = "asset" | "liability" | "equity" | "income" | "expense";
export type NormalBalance = "debit" | "credit";
export type LedgerAccountTemplateKey =
  | "manual"
  | "bank_account"
  | "petty_cash"
  | "accounts_receivable"
  | "accounts_payable"
  | "general_income"
  | "other_income"
  | "tuition_revenue"
  | "general_expense"
  | "utilities_expense"
  | "salary_expense";
export type JournalEntryStatus = "draft" | "posted" | "reversed";
export type JournalEntrySource =
  | "manual"
  | "student_payment"
  | "payroll"
  | "bank_transfer"
  | "concession"
  | "fee_adjustment";
export type CashTransactionStatus = "pending" | "approved" | "rejected";
export type TransactionCategory = "income" | "expense" | "transfer";
export type FeeItemCategory = FeeCategory;
export type BillStatus = "draft" | "issued" | "paid" | "overdue" | "cancelled";
export type ARPaymentStatus = "paid_in_full" | "on_time" | "overdue" | "not_billed";
export type ExpenseStatus = "draft" | "submitted" | "approved" | "rejected" | "posted";

// ── Currency ──────────────────────────────────────────────────────

export interface AccountingCurrencyDto {
  id: string;
  name: string;
  code: string;
  symbol: string;
  is_base_currency: boolean;
  is_active: boolean;
  decimal_places: number;
  created_at: string;
  updated_at: string;
}

export interface CreateAccountingCurrencyCommand {
  name: string;
  code: string;
  symbol: string;
  is_base_currency?: boolean;
  is_active?: boolean;
  decimal_places?: number;
}

export type UpdateAccountingCurrencyCommand = Partial<CreateAccountingCurrencyCommand>;

// ── Ledger Account (Chart of Accounts) ───────────────────────────

export interface AccountingLedgerAccountDto {
  id: string;
  code: string;
  name: string;
  account_type: AccountType;
  category: string;
  parent_account: string | null;
  normal_balance: NormalBalance;
  is_active: boolean;
  is_header: boolean;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateAccountingLedgerAccountCommand {
  code?: string;
  name: string;
  account_type: AccountType;
  category?: string;
  parent_account?: string | null;
  normal_balance: NormalBalance;
  is_active?: boolean;
  is_header?: boolean;
  description?: string | null;
  template_key?: LedgerAccountTemplateKey;
}

export type UpdateAccountingLedgerAccountCommand = Partial<CreateAccountingLedgerAccountCommand>;

// ── Bank Account ──────────────────────────────────────────────────

export type BankAccountStatus = "active" | "inactive" | "closed";
export type BankAccountType = "checking" | "savings" | "cash" | "other";

export interface AccountingBankAccountCurrencyRef {
  id: string;
  code?: string;
  name?: string;
  symbol?: string;
}

export interface AccountingBankAccountDto {
  id: string;
  account_number: string;
  account_name: string;
  bank_name: string;
  account_type: BankAccountType;
  currency: AccountingBankAccountCurrencyRef | string;
  ledger_account: string | null;
  current_balance: string;
  opening_balance?: number;
  status: BankAccountStatus;
  description?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AccountingBankAccountBalanceByCurrencyDto {
  currency_id: string;
  currency_code: string;
  currency_symbol: string;
  total_balance: string;
}

export interface AccountingBankAccountsSummaryDto {
  total_accounts: number;
  active_accounts: number;
  cash_accounts: number;
  balances_by_currency: AccountingBankAccountBalanceByCurrencyDto[];
}

export interface AccountingBankAccountsListDto {
  results: AccountingBankAccountDto[];
  summary: AccountingBankAccountsSummaryDto;
}

export interface AccountingBankAccountRecentActivityDto {
  id: string;
  transaction_date: string;
  reference_number: string;
  transaction_type: string | AccountingTransactionTypeRef;
  payment_method: string | AccountingPaymentMethodRef;
  amount: string;
  base_amount: string;
  status: CashTransactionStatus;
  payer_payee: string;
  description: string;
  journal_entry: string | null;
  posted: boolean;
  created_at: string;
}

export interface AccountingBankAccountMonthlyActivityDto {
  month: string;
  income: string;
  expense: string;
}

export interface AccountingBankAccountDetailDto extends AccountingBankAccountDto {
  opening_amount: string;
  total_income: string;
  total_expense: string;
  net_balance: string;
  activity_breakdown: {
    approved: number;
    pending: number;
    rejected: number;
  };
  monthly_activity: AccountingBankAccountMonthlyActivityDto[];
  recent_activities: AccountingBankAccountRecentActivityDto[];
  ledger_account_detail: {
    id: string;
    code: string;
    name: string;
    account_type: AccountType;
    normal_balance: NormalBalance;
  } | null;
}

export interface CreateAccountingBankAccountCommand {
  account_number: string;
  account_name: string;
  bank_name?: string;
  account_type: BankAccountType;
  currency: AccountingBankAccountCurrencyRef;
  ledger_account?: string | null;
  opening_balance?: number;
  opening_balance_date?: string | null;
  status?: BankAccountStatus;
  description?: string | null;
}

export type UpdateAccountingBankAccountCommand = Partial<CreateAccountingBankAccountCommand>;

// ── Transaction Type ──────────────────────────────────────────────

export interface AccountingTransactionTypeDto {
  id: string;
  name: string;
  code: string;
  transaction_category: TransactionCategory;
  description: string | null;
  default_ledger_account: string | null;
  default_ledger_account_name?: string | null;
  is_active: boolean;
}

export interface CreateAccountingTransactionTypeCommand {
  name: string;
  code: string;
  transaction_category: TransactionCategory;
  description?: string | null;
  default_ledger_account?: string | null;
  is_active?: boolean;
}

export type UpdateAccountingTransactionTypeCommand = Partial<CreateAccountingTransactionTypeCommand>;

// ── Payment Method ────────────────────────────────────────────────

export interface AccountingPaymentMethodDto {
  id: string;
  name: string;
  code: string;
  description: string | null;
  is_active: boolean;
}

// ── Cash Transaction ──────────────────────────────────────────────
export interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  decimal_places: number;
}

export interface AccountingTransactionTypeRef {
  id: string;
  name: string;
  code: string;
  transaction_category: TransactionCategory;
  description: string | null;
}

export interface AccountingPaymentMethodRef {
  id: string;
  name: string;
  code: string;
  description: string | null;
}

export interface AccountingBankAccountRef {
  id: string;
  account_number: string;
  account_name: string;
  bank_name: string;
  account_type: BankAccountType;
  status: BankAccountStatus;
}

export interface AccountingLedgerAccountRef {
  id: string;
  code: string;
  name: string;
  account_type: AccountType;
}

export interface AccountingJournalEntryRef {
  id: string;
  reference_number: string;
  posting_date: string;
  status: JournalEntryStatus;
}

export interface AccountingCashTransactionDto {
  id: string;
  bank_account: string | AccountingBankAccountRef;
  transaction_date: string;
  reference_number: string;
  transaction_type: string | AccountingTransactionTypeRef;
  payment_method: string | AccountingPaymentMethodRef;
  ledger_account: string | AccountingLedgerAccountRef | null;
  amount: string;
  currency: Currency;
  exchange_rate: string;
  base_amount: string;
  payer_payee: string;
  description: string;
  status: CashTransactionStatus;
  approved_by: string | null;
  approved_at: string | null;
  rejection_reason: string | null;
  source_reference: string | null;
  journal_entry: string | AccountingJournalEntryRef | null;
  created_at: string;
  updated_at: string;
}

export interface CreateAccountingCashTransactionCommand {
  bank_account: string;
  transaction_date: string;
  reference_number: string;
  transaction_type: string;
  payment_method: string;
  ledger_account?: string | null;
  amount: number;
  currency: string;
  exchange_rate?: number;
  base_amount?: number;
  payer_payee?: string;
  description: string;
  source_reference?: string | null;
}

export type UpdateAccountingCashTransactionCommand = Partial<CreateAccountingCashTransactionCommand>;

// ── Journal Entry ─────────────────────────────────────────────────

export interface AccountingJournalEntryDto {
  id: string;
  posting_date: string;
  reference_number: string;
  source: JournalEntrySource;
  description: string;
  status: JournalEntryStatus;
  academic_year: string;
  posted_by: string | null;
  posted_at: string | null;
  reversal_of: string | null;
  source_reference: string | null;
  total_debit?: string;
  total_credit?: string;
  created_at: string;
  updated_at: string;
}

export interface AccountingJournalEntryDetailDto extends AccountingJournalEntryDto {
  lines: AccountingJournalLineDto[];
}

export interface CreateAccountingJournalEntryCommand {
  posting_date: string;
  reference_number: string;
  source: JournalEntrySource;
  description: string;
  status?: JournalEntryStatus;
  source_reference?: string | null;
}

export type UpdateAccountingJournalEntryCommand = Partial<CreateAccountingJournalEntryCommand>;

// ── Journal Line ──────────────────────────────────────────────────

export interface AccountingJournalLineDto {
  id: string;
  journal_entry: string;
  ledger_account: string;
  ledger_account_name?: string;
  ledger_account_code?: string;
  currency: string;
  currency_code?: string;
  amount: string;
  debit_amount: string;
  credit_amount: string;
  exchange_rate?: string;
  base_amount?: string;
  description: string;
  line_sequence: number;
}

export interface CreateAccountingJournalLineCommand {
  ledger_account: string;
  currency: string;
  amount: number;
  debit_amount: number;
  credit_amount: number;
  exchange_rate?: number;
  base_amount: number;
  description?: string;
  line_sequence: number;
}

export type UpdateAccountingJournalLineCommand = Partial<CreateAccountingJournalLineCommand>;

// ── Fee Item ──────────────────────────────────────────────────────

export type FeeCategory = "tuition" | "general" | "activity" | "other";

export interface AccountingFeeItemDto {
  id: string;
  name: string;
  code: string;
  category: FeeCategory;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateAccountingFeeItemCommand {
  name: string;
  code: string;
  category: FeeCategory;
  description?: string | null;
  is_active?: boolean;
}

export type UpdateAccountingFeeItemCommand = Partial<CreateAccountingFeeItemCommand>;

// ── Exchange Rate ─────────────────────────────────────────────────

export interface AccountingExchangeRateDto {
  id: string;
  from_currency: string;
  to_currency: string;
  rate: string;
  effective_date: string;
  end_date: string | null;
  notes: string | null;
}

// ── Shared: list query params ─────────────────────────────────────

export interface CashTransactionListParams {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
  status?: CashTransactionStatus;
  category?: TransactionCategory;
  bank_account?: string;
  transaction_type?: string;
  transaction_type_code?: string;
  start_date?: string;
  end_date?: string;
  amount?: string;
  amount_min?: string;
  amount_max?: string;
}

export interface CashTransactionListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: AccountingCashTransactionDto[];
}

export interface JournalEntryListParams {
  status?: JournalEntryStatus;
  source?: JournalEntrySource;
  academic_year?: string;
  start_date?: string;
  end_date?: string;
}

// ── Post-to-journal action response ──────────────────────────────

export interface PostTransactionResponse {
  detail: string;
  journal_entry_id: string;
  transaction: AccountingCashTransactionDto;
}

// ── Account Transfer ──────────────────────────────────────────────

export type AccountTransferStatus = "pending" | "approved" | "rejected";

export interface AccountingAccountTransferDto {
  id: string;
  from_account: string | AccountingBankAccountRef;
  to_account: string | AccountingBankAccountRef;
  from_currency: string | Currency;
  to_currency: string | Currency;
  amount: string;
  to_amount: string;
  exchange_rate: string;
  transfer_date: string;
  status: AccountTransferStatus;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateAccountTransferCommand {
  from_account: string;
  to_account: string;
  from_currency: string;
  to_currency: string;
  amount: number;
  to_amount?: number;
  exchange_rate?: number;
  transfer_date: string;
  description?: string | null;
}

// ── Specialized Posting Commands ──────────────────────────────────

export interface PostStudentPaymentCommand {
  bank_account: string;
  transaction_date: string;
  reference_number: string;
  transaction_type: string;
  payment_method: string;
  ledger_account?: string | null;
  amount: number;
  currency: string;
  exchange_rate?: number;
  base_amount?: number;
  payer_payee: string;
  description: string;
  /** student id */
  source_reference?: string | null;
}

export interface PostIncomeCommand {
  bank_account: string;
  transaction_date: string;
  reference_number: string;
  transaction_type: string;
  payment_method: string;
  ledger_account?: string | null;
  amount: number;
  currency: string;
  exchange_rate?: number;
  base_amount?: number;
  payer_payee: string;
  description: string;
  source_reference?: string | null;
}

export interface PostExpenseCommand {
  bank_account: string;
  transaction_date: string;
  reference_number: string;
  transaction_type: string;
  payment_method: string;
  ledger_account?: string | null;
  amount: number;
  currency: string;
  exchange_rate?: number;
  base_amount?: number;
  payer_payee: string;
  description: string;
  source_reference?: string | null;
}

export interface PostGeneralTransactionCommand {
  posting_date: string;
  reference_number: string;
  description: string;
  lines: CreateAccountingJournalLineCommand[];
}
