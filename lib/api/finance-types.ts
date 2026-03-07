/* ------------------------------------------------------------------ */
/*  Types for Finance API endpoints                                    */
/*  Covers: Transactions, Bank Accounts, Fees, Installments,           */
/*          Payment Methods, Transaction Types, Currencies,             */
/*          Billing Summary, Payment Status                             */
/* ------------------------------------------------------------------ */

/** Paginated response envelope (re-exported for convenience) */
export interface PaginatedResponse<T> {
  results: T[];
  count: number;
  next: string | null;
  previous: string | null;
}

/* ------------------------------------------------------------------ */
/*  Bank Account                                                       */
/* ------------------------------------------------------------------ */

export interface CurrencyDto {
  id: string;
  name: string;
  symbol: string;
  code: string;
}
type BankAccountTotals = {
  total_income: number;
  total_expense: number;
  net_balance: number;
  balance: number;
}
export interface BankAccountBasicAnalysis {
  total_income: number;
  total_expenses: number;
  balance: number;
  transaction_count: number;
  totals: BankAccountTotals;
}

export interface MonthlyTrend {
  month: string;
  type: "income" | "expense";
  total: number;
  count: number;
}

export interface TypeBreakdown {
  type: "income" | "expense";
  total: number;
  count: number;
}

export interface PaymentMethodBreakdown {
  payment_method: string;
  total: number;
  count: number;
}

export interface BankAccountAnalysis {
  monthly_trends: MonthlyTrend[];
  type_breakdown: TypeBreakdown[];
  payment_method_breakdown: PaymentMethodBreakdown[];
}

export interface BankAccountDto {
  id: string;
  number: string;
  name: string;
  description: string | null;
  bank_number: string | null;
  active: boolean;
  status: string;
  balance: number;
  currency: CurrencyDto | null;
  basic_analysis?: BankAccountBasicAnalysis;
  analysis?: BankAccountAnalysis;
}

export interface BankAccountDetailDto extends BankAccountDto {
  transactions: TransactionDto[];
}

export interface CreateBankAccountCommand {
  name: string;
  description?: string;
  bank_number?: string;
}

export interface UpdateBankAccountCommand {
  name?: string;
  description?: string;
  bank_number?: string;
}

/* ------------------------------------------------------------------ */
/*  Payment Method                                                     */
/* ------------------------------------------------------------------ */

export interface PaymentMethodDto {
  id: string;
  name: string;
  description: string | null;
  is_editable: boolean;
  active: boolean;
  status: string;
}

export interface CreatePaymentMethodCommand {
  name: string;
  description?: string;
}

export interface UpdatePaymentMethodCommand {
  name?: string;
  description?: string;
  active?: boolean;
}

/* ------------------------------------------------------------------ */
/*  Transaction Type                                                   */
/* ------------------------------------------------------------------ */

export interface TransactionTypeDto {
  id: string;
  name: string;
  type: "income" | "expense";
  type_code: string;
  is_hidden: boolean;
  is_editable: boolean;
  description: string | null;
  active: boolean;
  status: string;
}

export interface CreateTransactionTypeCommand {
  name: string;
  type: "income" | "expense";
  description?: string;
  is_hidden?: boolean;
}

export interface UpdateTransactionTypeCommand {
  name?: string;
  type?: "income" | "expense";
  description?: string;
  is_hidden?: boolean;
}

/* ------------------------------------------------------------------ */
/*  Transaction                                                        */
/* ------------------------------------------------------------------ */

export interface TransactionDto {
  id: string;
  transaction_id: string;
  type: string;
  reference: string | null;
  amount: number;
  date: string;
  description: string | null;
  notes: string | null;
  status: "pending" | "approved" | "canceled";
  student: {
    id: string;
    id_number: string;
    full_name: string;
  } | null;
  transaction_type: {
    id: string;
    name: string;
    type_code: string;
    type: string;
  };
  payment_method: {
    id: string;
    name: string;
  } | null;
  account: {
    id: string;
    number: string;
    name: string;
  } | null;
  academic_year: {
    id: string;
    name: string;
  } | null;
  currency: CurrencyDto | null;
  meta: {
    created_at?: string;
    updated_at?: string;
    created_by?: { id: string; username: string } | null;
    updated_by?: { id: string; username: string } | null;
  };
}

export type TransactionStatus = TransactionDto["status"];

export interface CreateTransactionCommand {
  type: string;
  student?: string;
  account: string;
  payment_method: string;
  amount: number;
  date: string;
  description: string;
  reference?: string;
  notes?: string;
}

export interface UpdateTransactionCommand
  extends Partial<CreateTransactionCommand> {
  status?: TransactionStatus;
}

export interface AccountTransferCommand {
  from_account: string;
  to_account: string;
  amount: number;
  date: string;
  payment_method: string;
  description?: string;
  reference?: string;
}

/* ------------------------------------------------------------------ */
/*  Bulk Transaction                                                   */
/* ------------------------------------------------------------------ */

export type BulkTransactionType = "TUITION" | "ACCOUNT" | "GENERAL";

export interface BulkTransactionRow {
  student?: string;
  amount: number;
  reference?: string;
  notes?: string;
  status?: string;
  date?: string;
  payment_method?: string;
  account?: string;
  type?: string;
}

export interface BulkTransactionCommand {
  override_existing?: boolean;
  transactions: BulkTransactionRow[];
}

export interface BulkTransactionResponse {
  success: boolean;
  meta?: {
    total_processed: number;
    succeeded: number;
    failed: number;
    created?: number;
    deleted?: number;
  };
  errors?: {
    row_index: number;
    detail: string;
    transaction_data: Record<string, unknown>;
    student?: { id: number; id_number: string; full_name: string };
  }[];
}

export interface TransactionListParams {
  page?: number;
  page_size?: number;
  status?: TransactionStatus;
  transaction_type?: string;
  account?: string;
  student?: string;
  academic_year?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
  ordering?: string;
}

/* ------------------------------------------------------------------ */
/*  General Fee                                                        */
/* ------------------------------------------------------------------ */

export interface GeneralFeeDto {
  id: string;
  name: string;
  description: string | null;
  amount: number;
  student_target: string;
  active: boolean;
  status: string;
}

export interface CreateGeneralFeeCommand {
  name: string;
  amount: number;
  student_target: string;
  description?: string;
  apply_to_all_sections?: boolean;
}

export interface UpdateGeneralFeeCommand {
  name?: string;
  amount?: number;
  student_target?: string;
  description?: string;
  active?: boolean;
  apply_to_all_sections?: boolean;
}

/* ------------------------------------------------------------------ */
/*  Section Fee                                                        */
/* ------------------------------------------------------------------ */

export interface SectionFeeDto {
  id: string;
  section: {
    id: string;
    name: string;
  };
  general_fee: {
    id: string;
    name: string;
    student_target: string;
    description: string | null;
  };
  amount: number;
  active: boolean;
  status: string;
}

/* ------------------------------------------------------------------ */
/*  Payment Installment                                                */
/* ------------------------------------------------------------------ */

export interface PaymentInstallmentDto {
  id: string;
  academic_year: {
    id: string;
    name: string;
    start_date: string;
    end_date: string;
  };
  name: string;
  description: string | null;
  value: number;
  percentage: number;
  cumulative_percentage: number;
  due_date: string;
  sequence: number;
  active: boolean;
  status: string;
}

export interface CreateInstallmentCommand {
  value: number;
  due_date: string;
  name?: string;
  description?: string;
}

export interface UpdateInstallmentCommand {
  id?: string;
  value?: number;
  due_date?: string;
  name?: string;
  description?: string;
}

/* ------------------------------------------------------------------ */
/*  Billing Summary                                                    */
/* ------------------------------------------------------------------ */

export interface BillingSummaryItemDto {
  grade_level?: { id: string; name: string; level: number };
  section?: { id: string; name: string };
  enrolled_as: "new" | "returning" | "transferred";
  enrolled_as_display: string;
  student_count: number;
  total_bills: string;
  total_paid: string;
  balance: number;
  avg_bill_per_student: string;
  percent_paid: string;
  // student-level fields
  full_name?: string;
  id_number?: string;
  first_name?: string;
  last_name?: string;
  detailed_billing?: {
    tuition_fees: string;
    other_fees: string;
  };
  enrollment_info?: {
    id: string;
    status: string;
    date_enrolled: string;
    enrolled_as: "new" | "returning" | "transferred";
  };
}

export interface BillingSummaryParams {
  academic_year_id: string;
  view_type: "grade_level" | "section" | "student";
  grade_level_id?: string;
  section_id?: string;
}

/* ------------------------------------------------------------------ */
/*  Payment Status (fees-payment-tracker)                              */
/* ------------------------------------------------------------------ */

export interface StudentPaymentStatusDto {
  id: string;
  id_number: string;
  full_name: string;
  grade_level: string;
  section: string;
  billing_summary: {
    total_fees: number;
    tuition: number;
    total_bill: number;
    paid: number;
    balance: number;
    payment_status: {
      is_on_time: boolean;
      overdue_count: number;
      overdue_amount: number;
      is_paid_in_full: boolean;
      paid_percentage: number;
      overdue_percentage: number;
      expected_payment_percentage: number;
      next_due_date: string | null;
    };
    payment_plan: {
      installment_name: string;
      expected_amount: number;
      cumulative_expected: number;
      amount_paid: number;
      balance: number;
      due_date: string;
      is_overdue: boolean;
      payment_date: string | null;
    }[];
  };
}

export interface PaymentStatusParams {
  payment_status?: "delinquent" | "paid_in_full" | "on_time" | "all";
  academic_year_id?: string;
  section_id?: string;
  grade_level_id?: string;
  include_payment_plan?: boolean;
  include_payment_status?: boolean;
}
