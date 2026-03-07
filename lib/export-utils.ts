/* ------------------------------------------------------------------ */
/*  CSV / data export utilities                                        */
/* ------------------------------------------------------------------ */

import type { StudentDto } from "@/lib/api2/student-types"

/**
 * Escapes a CSV cell value by wrapping in quotes if it contains commas,
 * newlines, or quotes (which are doubled).
 */
function escapeCSV(value: string): string {
  if (value.includes(",") || value.includes("\n") || value.includes('"')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

/**
 * Converts an array of objects into a CSV string.
 */
function toCSV<T>(
  rows: T[],
  columns: { key: string; label: string; format?: (row: T) => string }[]
): string {
  const header = columns.map((c) => escapeCSV(c.label)).join(",")
  const body = rows.map((row) =>
    columns
      .map((col) => {
        const value = col.format ? col.format(row) : String((row as Record<string, unknown>)[col.key] ?? "")
        return escapeCSV(value)
      })
      .join(",")
  )
  return [header, ...body].join("\n")
}

/**
 * Triggers a browser download for the given content.
 */
function downloadFile(content: string, filename: string, mimeType = "text/csv") {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.setAttribute("href", url)
  link.setAttribute("download", filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/* ------------------------------------------------------------------ */
/*  Student-specific exports                                           */
/* ------------------------------------------------------------------ */

/** Column definitions for the student CSV export */
const studentExportColumns: {
  key: string
  label: string
  format?: (row: StudentDto) => string
}[] = [
  { key: "id_number", label: "ID Number" },
  { key: "first_name", label: "First Name" },
  { key: "middle_name", label: "Middle Name", format: (s) => s.middle_name ?? "" },
  { key: "last_name", label: "Last Name" },
  { key: "full_name", label: "Full Name" },
  { key: "gender", label: "Gender", format: (s) => s.gender ?? "" },
  { key: "date_of_birth", label: "Date of Birth" },
  { key: "email", label: "Email", format: (s) => s.email ?? "" },
  { key: "phone_number", label: "Phone", format: (s) => s.phone_number ?? "" },
  { key: "status", label: "Status" },
  {
    key: "grade_level",
    label: "Grade Level",
    format: (s) => s.current_grade_level?.name ?? "",
  },
  {
    key: "section",
    label: "Section",
    format: (s) => s.current_enrollment?.section?.name ?? "",
  },
  {
    key: "enrollment_status",
    label: "Enrollment Status",
    format: (s) => s.current_enrollment?.status ?? "Not enrolled",
  },
  {
    key: "date_enrolled",
    label: "Date Enrolled",
    format: (s) => s.current_enrollment?.date_enrolled ?? "",
  },
  {
    key: "balance",
    label: "Balance",
    format: (s) =>
      s.current_enrollment?.billing_summary?.balance?.toString() ?? "",
  },
  {
    key: "address",
    label: "Address",
    format: (s) =>
      [s.address, s.city, s.state, s.postal_code, s.country]
        .filter(Boolean)
        .join(", "),
  },
  {
    key: "entry_date",
    label: "Entry Date",
    format: (s) => s.entry_date ?? "",
  },
  {
    key: "entry_as",
    label: "Entry As",
    format: (s) => s.entry_as ?? "",
  },
]

/**
 * Export a list of students to CSV and trigger download.
 */
export function exportStudentsToCSV(students: StudentDto[], filename?: string) {
  const timestamp = new Date().toISOString().slice(0, 10)
  const csv = toCSV(students, studentExportColumns)
  downloadFile(csv, filename ?? `students-${timestamp}.csv`)
}

/**
 * Export a single student's data as CSV.
 */
export function exportSingleStudentCSV(student: StudentDto) {
  const csv = toCSV([student], studentExportColumns)
  downloadFile(csv, `student-${student.id_number}.csv`)
}

/* ------------------------------------------------------------------ */
/*  Transaction-specific exports                                       */
/* ------------------------------------------------------------------ */

import type { TransactionDto } from "@/lib/api2/finance-types"

/** Column definitions for the transaction CSV export */
const transactionExportColumns: {
  key: string
  label: string
  format?: (row: TransactionDto) => string
}[] = [
  { key: "transaction_id", label: "Transaction ID" },
  { key: "date", label: "Date" },
  {
    key: "transaction_type",
    label: "Type",
    format: (t) => t.transaction_type?.name ?? "",
  },
  { key: "description", label: "Description", format: (t) => t.description ?? "" },
  {
    key: "student",
    label: "Student",
    format: (t) => t.student?.full_name ?? "",
  },
  {
    key: "student_id",
    label: "Student ID",
    format: (t) => t.student?.id_number ?? "",
  },
  {
    key: "account",
    label: "Account",
    format: (t) => t.account?.name ?? "",
  },
  {
    key: "payment_method",
    label: "Payment Method",
    format: (t) => t.payment_method?.name ?? "",
  },
  {
    key: "amount",
    label: "Amount",
    format: (t) => t.amount?.toString() ?? "0",
  },
  {
    key: "currency",
    label: "Currency",
    format: (t) => t.currency?.code ?? "USD",
  },
  { key: "status", label: "Status" },
  { key: "reference", label: "Reference", format: (t) => t.reference ?? "" },
  { key: "notes", label: "Notes", format: (t) => t.notes ?? "" },
]

/**
 * Export a list of transactions to CSV and trigger download.
 */
export function exportTransactionsToCSV(
  transactions: TransactionDto[],
  filename?: string
) {
  const timestamp = new Date().toISOString().slice(0, 10)
  const csv = toCSV(transactions, transactionExportColumns)
  downloadFile(csv, filename ?? `transactions-${timestamp}.csv`)
}

/**
 * Export a single transaction's data as CSV.
 */
export function exportSingleTransactionCSV(transaction: TransactionDto) {
  const csv = toCSV([transaction], transactionExportColumns)
  downloadFile(csv, `transaction-${transaction.transaction_id}.csv`)
}
