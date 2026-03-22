"use client";

import { PlusSignIcon, PencilEdit01Icon, Money01Icon } from "@hugeicons/core-free-icons";
import { ColumnDef } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/ui/status-badge";
import { AccountingAdvancedTable } from "@/components/accounting/accounting-advanced-table";
import type {
  AccountingBankAccountDto,
  AccountingBankAccountsSummaryDto,
  BankAccountType,
} from "@/lib/api2/accounting-types";
import { Pencil, Trash } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const ACCOUNT_TYPE_OPTIONS: { value: BankAccountType; label: string }[] = [
  { value: "checking", label: "Checking" },
  { value: "savings", label: "Savings" },
  { value: "cash", label: "Cash" },
  { value: "other", label: "Other" },
];

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "closed", label: "Closed" },
];

interface BankAccountsTableProps {
  accounts: AccountingBankAccountDto[];
  summary?: AccountingBankAccountsSummaryDto;
  isLoading: boolean;
  onEdit: (row: AccountingBankAccountDto) => void;
  onDelete: (row: AccountingBankAccountDto) => void;
  onOpenDetails: (row: AccountingBankAccountDto) => void;
}

function getCurrencyCode(account: AccountingBankAccountDto): string {
  if (typeof account.currency === "string") return account.currency;
  return account.currency.code ?? account.currency.id;
}

function buildColumns(
  onEdit: (row: AccountingBankAccountDto) => void,
  onDelete: (row: AccountingBankAccountDto) => void
): ColumnDef<AccountingBankAccountDto>[] {
  return [
    { accessorKey: "account_number", header: "Account No.", cell: ({ row }) => <span className="font-mono text-xs">{row.original.account_number}</span> },
    { accessorKey: "account_name", header: "Account Name" },
    { accessorKey: "bank_name", header: "Bank" },
    {
      accessorKey: "account_type",
      header: "Type",
      filterFn: (row, id, value) => {
        if (!value) return true;
        return row.getValue(id) === value;
      },
      meta: {
        displayName: "Account Type",
        filterType: "radio",
        filterOptions: ACCOUNT_TYPE_OPTIONS,
      } as any,
      cell: ({ row }) => <span className="capitalize text-sm">{row.original.account_type.replace("_", " ")}</span>,
    },
    { accessorKey: "currency", header: "Currency", cell: ({ row }) => getCurrencyCode(row.original) },
    {
      accessorKey: "current_balance",
      header: "Balance",
      cell: ({ row }) => <span className="font-mono text-sm">{Number(row.original.current_balance ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>,
    },
    {
      accessorKey: "status",
      header: "Status",
      filterFn: (row, id, value) => {
        if (!value) return true;
        return row.getValue(id) === value;
      },
      meta: {
        displayName: "Status",
        filterType: "radio",
        filterOptions: STATUS_OPTIONS,
      } as any,
      cell: ({ row }) => <StatusBadge status={row.original.status} className="capitalize" />,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon-sm"
            tooltip="Edit"
            icon={<Pencil className="h-4 w-4" />}
            onClick={(event) => {
              event.stopPropagation();
              onEdit(row.original);
            }}
          />
          <Button
            variant="outline"
            size="icon-sm"
            tooltip="Delete"
            icon={<Trash className="h-4 w-4 text-destructive" />}
            onClick={(event) => {
              event.stopPropagation();
              onDelete(row.original);
            }}
          />
        </div>
      ),
    },
  ];
}

export function BankAccountsTable({
  accounts,
  summary,
  isLoading,
  onEdit,
  onDelete,
  onOpenDetails,
}: BankAccountsTableProps) {
  const columns = buildColumns(onEdit, onDelete);
  const balancesByCurrency = summary?.balances_by_currency ?? [];
  console.log(balancesByCurrency)
  const currentBalanceValue =
    balancesByCurrency.length > 0
      ? balancesByCurrency
          .map((item) => {
            return (
              <div key={item.currency_id} className="text-lg flex flex-col">
                <div className="flex items-center gap-2">

               <span className="text-muted-foreground">{item.currency_code}:</span> <span>{Number(item.total_balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            );
          })
          // .map((item) => `${item.currency_symbol}: ${Number(item.total_balance || 0).toLocaleString(undefined, {
          //   minimumFractionDigits: 2,
          //   maximumFractionDigits: 2,
          // })}`)
          // .join(" | ")
      : Number(accounts.reduce((sum, account) => sum + Number(account.current_balance ?? 0), 0)).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });

  const statsItems = [
    {
      title: "Total Accounts",
      value: String(summary?.total_accounts ?? accounts.length),
      subtitle: "Bank and cash accounts",
      icon: PlusSignIcon,
    },
    {
      title: "Active Accounts",
      value: String(summary?.active_accounts ?? accounts.filter((account) => account.status === "active").length),
      subtitle: "Available for transactions",
      icon: PencilEdit01Icon,
    },
    {
      title: "Cash Accounts",
      value: String(summary?.cash_accounts ?? accounts.filter((account) => account.account_type === "cash").length),
      subtitle: "On-hand cash ledgers",
      icon: PlusSignIcon,
    },
    {
      title: "Current Balance",
      value: currentBalanceValue,
      subtitle: balancesByCurrency.length > 1 ? "Grouped by currency" : "Sum of account balances",
      icon: Money01Icon,
    },
  ];

  return (
    <AccountingAdvancedTable
      columns={columns}
      data={accounts}
      loading={isLoading}
      onRowClick={onOpenDetails}
      stats={statsItems}
      searchPlaceholder="Search bank accounts..."
      searchPredicate={(account, search) =>
        account.account_name.toLowerCase().includes(search) ||
        account.bank_name.toLowerCase().includes(search) ||
        account.account_number.toLowerCase().includes(search) ||
        account.status.toLowerCase().includes(search)
      }
    />
  );
}
