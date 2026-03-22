import { z } from "zod";

export const studentPaymentSchema = z.object({
  student_id: z.string().min(1, "Student ID is required"),
  bank_account: z.string().min(1, "Bank account is required"),
  payment_method: z.string().optional().nullable(),
  currency: z.string().min(1, "Currency is required"),
  amount: z.coerce.number().positive("Amount must be positive"),
  entry_date: z.string().min(1, "Date is required"),
  description: z.string().min(1, "Description is required"),
});

export const accountTransferSchema = z
  .object({
    from_account: z.string().min(1, "Source account is required"),
    to_account: z.string().min(1, "Destination account is required"),
    currency: z.string().min(1, "Currency is required"),
    amount: z.coerce.number().positive("Amount must be positive"),
    entry_date: z.string().min(1, "Date is required"),
    description: z.string().min(1, "Description is required"),
  })
  .refine((values) => values.from_account !== values.to_account, {
    message: "Source and destination accounts must be different",
    path: ["to_account"],
  });

export const incomeSchema = z.object({
  bank_account: z.string().min(1, "Bank account is required"),
  income_type: z.string().min(1, "Income type is required"),
  currency: z.string().min(1, "Currency is required"),
  amount: z.coerce.number().positive("Amount must be positive"),
  payer: z.string().optional(),
  entry_date: z.string().min(1, "Date is required"),
  description: z.string().min(1, "Description is required"),
});

export const expenseSchema = z.object({
  bank_account: z.string().min(1, "Bank account is required"),
  expense_type: z.string().min(1, "Expense type is required"),
  currency: z.string().min(1, "Currency is required"),
  amount: z.coerce.number().positive("Amount must be positive"),
  payee: z.string().optional(),
  entry_date: z.string().min(1, "Date is required"),
  description: z.string().min(1, "Description is required"),
});

export const generalSchema = z.object({
  debit_account: z.string().min(1, "Debit account is required"),
  credit_account: z.string().min(1, "Credit account is required"),
  currency: z.string().min(1, "Currency is required"),
  amount: z.coerce.number().positive("Amount must be positive"),
  entry_date: z.string().min(1, "Date is required"),
  description: z.string().min(1, "Description is required"),
  notes: z.string().optional(),
});

export type StudentPaymentFormValues = z.infer<typeof studentPaymentSchema>;
export type AccountTransferFormValues = z.infer<typeof accountTransferSchema>;
export type IncomeFormValues = z.infer<typeof incomeSchema>;
export type ExpenseFormValues = z.infer<typeof expenseSchema>;
export type GeneralFormValues = z.infer<typeof generalSchema>;

export type SelectOption = {
  value: string;
  label: string;
};
