"use client";

import { useMemo, useState } from "react";
import { PlusSignIcon, PencilEdit01Icon, Delete01Icon } from "@hugeicons/core-free-icons";
import { ColumnDef } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/ui/status-badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { AccountingAdvancedTable } from "@/components/accounting/accounting-advanced-table";
import type { AccountingLedgerAccountDto, AccountType } from "@/lib/api2/accounting-types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatsCards } from "@/components/shared/stats-cards";
import { ChevronDown, ChevronRight, Pencil, Trash } from "lucide-react";
import EmptyStateComponent from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";

const ACCOUNT_TYPE_OPTIONS: { value: AccountType; label: string }[] = [
  { value: "asset", label: "Asset" },
  { value: "liability", label: "Liability" },
  { value: "equity", label: "Equity" },
  { value: "income", label: "Income" },
  { value: "expense", label: "Expense" },
];

interface LedgerAccountsTableProps {
  accounts: AccountingLedgerAccountDto[];
  isLoading: boolean;
  onEdit: (row: AccountingLedgerAccountDto) => void;
  onDelete: (row: AccountingLedgerAccountDto) => void;
}

type FlatLedgerAccountRow = AccountingLedgerAccountDto & {
  _depth: number;
};

type NestedChildRow = AccountingLedgerAccountDto & {
  _depth: number;
  _parentLabel: string;
};

function buildColumns(
  onEdit: (row: AccountingLedgerAccountDto) => void,
  onDelete: (row: AccountingLedgerAccountDto) => void
): ColumnDef<FlatLedgerAccountRow>[] {
  return [
    {
      accessorKey: "code",
      header: "Code",
      cell: ({ row }) => <span className="font-mono text-primary">{row.original.code}</span>,
    },
    {
      accessorKey: "name",
      header: "Account Name",
      cell: ({ row }) => {
        const account = row.original;
        return (
          <div
            className={cn(
              "flex items-center gap-2",
            )}
            // style={{ paddingLeft: `${account._depth * 16}px` }}
          >
            <span className="h-5 w-5" />
            <span className={account.is_header ? "font-semibold text-muted-foreground" : ""}>{!account.is_header ? "- " : ""}{account.name}</span>
          </div>
        );
      },
    },
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
      cell: ({ row }) => <StatusBadge status={row.original.account_type} showIcon={false} />, 
    },
    { accessorKey: "category", header: "Category" },
    {
      accessorKey: "normal_balance",
      header: "Normal Balance",
      cell: ({ row }) => <span className="capitalize text-muted-foreground">{row.original.normal_balance}</span>,
    },
    {
      accessorKey: "is_active",
      header: "Status",
      filterFn: (row, id, value) => {
        if (!value) return true;
        return String(row.getValue(id)) === value;
      },
      meta: {
        displayName: "Status",
        filterType: "radio",
        filterOptions: [
          { label: "Active", value: "true" },
          { label: "Inactive", value: "false" },
        ],
      } as any,
      cell: ({ row }) => <StatusBadge status={row.original.is_active ? "active" : "inactive"} />, 
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
            onClick={() => onEdit(row.original)}
          />
          <Button
            variant="outline"
            size="icon-sm"
            tooltip="Delete"
            icon={<Trash className="h-4 w-4 text-destructive" />}
            onClick={() => onDelete(row.original)}
          />
        </div>
      ),
    },
  ];
}

export function LedgerAccountsTable({ accounts, isLoading, onEdit, onDelete }: LedgerAccountsTableProps) {
  const [showAllAccounts, setShowAllAccounts] = useState(false);
  const [groupedSearch, setGroupedSearch] = useState("");
  
  const accountById = useMemo(
    () => new Map(accounts.map((account) => [account.id, account])),
    [accounts]
  );
  
  const childrenByParent = useMemo(() => {
    const map = new Map<string, AccountingLedgerAccountDto[]>();
    for (const account of accounts) {
      if (!account.parent_account) continue;
      const siblings = map.get(account.parent_account) ?? [];
      siblings.push(account);
      map.set(account.parent_account, siblings);
    }
    return map;
  }, [accounts]);
  
  const flatVisibleAccounts = useMemo<FlatLedgerAccountRow[]>(() => {
    const allRoots = accounts.filter(
      (account) => !account.parent_account || !accountById.has(account.parent_account)
    );
    
    const rows: FlatLedgerAccountRow[] = [];
    const visited = new Set<string>();
    
    const addNode = (account: AccountingLedgerAccountDto, depth: number) => {
      if (visited.has(account.id)) return;
      visited.add(account.id);
      
      const children = childrenByParent.get(account.id) ?? [];
      rows.push({
        ...account,
        _depth: depth,
      });
      
      for (const child of children) {
        addNode(child, depth + 1);
      }
    };
    
    for (const account of allRoots) {
      addNode(account, 0);
    }
    
    for (const account of accounts) {
      if (!visited.has(account.id)) {
        addNode(account, 0);
      }
    }
    
    return rows;
  }, [accounts, accountById, childrenByParent]);
  
  const groupedRoots = useMemo(
    () =>
      accounts.filter((account) => {
        if (!account.is_header) return false;
        if (!account.parent_account) return true;
        
        const parent = accountById.get(account.parent_account);
        if (!parent) return true;
        
        return !parent.is_header;
      }),
      [accountById, accounts]
    );
    
    const groupedSearchNormalized = groupedSearch.trim().toLowerCase();
    
    const groupedRows = useMemo(() => {
      const matchesSearch = (account: AccountingLedgerAccountDto) => {
        if (!groupedSearchNormalized) return true;
        return (
          account.name.toLowerCase().includes(groupedSearchNormalized) ||
          account.code.toLowerCase().includes(groupedSearchNormalized) ||
          account.account_type.toLowerCase().includes(groupedSearchNormalized) ||
          (account.category ?? "").toLowerCase().includes(groupedSearchNormalized)
        );
      };
      
      const collectDescendants = (
        parentId: string,
        depth: number,
        parentLabel: string
      ): NestedChildRow[] => {
        const directChildren = childrenByParent.get(parentId) ?? [];
        const result: NestedChildRow[] = [];
        
        for (const child of directChildren) {
          const row: NestedChildRow = {
            ...child,
            _depth: depth,
            _parentLabel: parentLabel,
          };
          
          const childLabel = `${child.code} - ${child.name}`;
          const descendants = collectDescendants(child.id, depth + 1, childLabel);
          
          if (!groupedSearchNormalized || matchesSearch(child) || descendants.length > 0) {
            result.push(row);
            result.push(...descendants);
          }
        }
        
        return result;
      };
      
      return groupedRoots
      .map((header) => {
        const descendants = collectDescendants(header.id, 0, `${header.code} - ${header.name}`);
        const includeHeader = !groupedSearchNormalized || matchesSearch(header) || descendants.length > 0;
        
        if (!includeHeader) {
          return null;
        }
        
        return {
          header,
          children: descendants,
        };
      })
      .filter((group): group is { header: AccountingLedgerAccountDto; children: NestedChildRow[] } => Boolean(group));
    }, [childrenByParent, groupedRoots, groupedSearchNormalized]);
    
    const [expandedHeaderIds, setExpandedHeaderIds] = useState<Set<string>>(groupedRows[0]?.header.id ? new Set([groupedRows[0].header.id]) : new Set());
  const columns = useMemo(
    () => buildColumns(onEdit, onDelete),
    [onEdit, onDelete]
  );

  const statsItems = [
    {
      title: "Total Accounts",
      value: String(accounts.length),
      subtitle: "Chart of accounts size",
      icon: PlusSignIcon,
    },
    {
      title: "Active",
      value: String(accounts.filter((account) => account.is_active).length),
      subtitle: "Usable for postings",
      icon: PencilEdit01Icon,
    },
    {
      title: "Header Accounts",
      value: String(accounts.filter((account) => account.is_header).length),
      subtitle: "Grouping accounts",
      icon: PlusSignIcon,
    },
    {
      title: "Income + Expense",
      value: String(accounts.filter((account) => account.account_type === "income" || account.account_type === "expense").length),
      subtitle: "P&L related accounts",
      icon: Delete01Icon,
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-end gap-2">
        <span className="text-sm text-muted-foreground">Show all accounts</span>
        <Switch
          checked={showAllAccounts}
          onCheckedChange={(checked) => setShowAllAccounts(Boolean(checked))}
        />
      </div>

      {showAllAccounts ? (
        <AccountingAdvancedTable
          columns={columns}
          data={flatVisibleAccounts}
          loading={isLoading}
          stats={statsItems}
          searchPlaceholder="Search ledger accounts..."
          searchPredicate={(account, search) =>
            account.name.toLowerCase().includes(search) ||
            account.code.toLowerCase().includes(search) ||
            account.account_type.toLowerCase().includes(search) ||
            (account.category ?? "").toLowerCase().includes(search)
          }
        />
      ) : (
        <div className="space-y-4">
          <StatsCards items={statsItems} />
          <div className="rounded-lg border bg-card p-3">
            <Input
              value={groupedSearch}
              onChange={(event) => setGroupedSearch(event.target.value)}
              placeholder="Search header and child accounts..."
              className="max-w-sm"
            />
          </div>
          {groupedRows.length === 0 ? (
           <EmptyStateComponent
              title="No accounts found"
              description="Try adjusting your search criteria."
            />
          ) : (
            <>
          <div className="space-y-3">
            {groupedRows.map(({ header, children }) => {
              const isExpanded = expandedHeaderIds.has(header.id);

              return (
                <div key={header.id} className="overflow-hidden rounded-lg border bg-card">
                  <div className="flex items-center justify-between gap-3 px-3 py-3">
                    <button
                      type="button"
                      onClick={() => {
                        setExpandedHeaderIds((previous) => {
                          const next = new Set(previous);
                          if (next.has(header.id)) {
                            next.delete(header.id);
                          } else {
                            next.add(header.id);
                          }
                          return next;
                        });
                      }}
                      className="flex min-w-0 flex-1 items-center gap-2 text-left"
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="font-mono text-primary">{header.code}</span>
                      <span className="font-medium">{header.name}</span>
                      <StatusBadge status={header.account_type} showIcon={false} />
                      <span className="text-xs text-muted-foreground">
                        {children.length} child{children.length === 1 ? "" : "ren"}
                      </span>
                    </button>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon-sm"
                        tooltip="Edit"
                        icon={<Pencil className="h-4 w-4" />}
                        onClick={() => onEdit(header)}
                      />
                      <Button
                        variant="outline"
                        size="icon-sm"
                        tooltip="Delete"
                        icon={<Trash className="h-4 w-4 text-destructive" />}
                        onClick={() => onDelete(header)}
                      />
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t bg-muted/30 fpx-3 fpy-3">
                      {children.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No child accounts under this header.</p>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Code</TableHead>
                              <TableHead>Account Name</TableHead>
                              <TableHead>Parent</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead>Category</TableHead>
                              <TableHead>Normal Balance</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {children.map((child) => (
                              <TableRow key={child.id}>
                                <TableCell>
                                  <span className="font-mono ">{child.code}</span>
                                </TableCell>
                                <TableCell>
                                  <div
                                    className="font-medium"
                                    style={{ paddingLeft: `${child._depth * 16}px` }}
                                  >
                                    {child.name}
                                  </div>
                                </TableCell>
                                <TableCell className="text-muted-foreground">{child._parentLabel}</TableCell>
                                <TableCell>
                                  <StatusBadge status={child.account_type} showIcon={false} />
                                </TableCell>
                                <TableCell>{child.category}</TableCell>
                                <TableCell className="capitalize text-muted-foreground">
                                  {child.normal_balance}
                                </TableCell>
                                <TableCell>
                                  <StatusBadge status={child.is_active ? "active" : "inactive"} />
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center justify-end gap-2">
                                    <Button
                                      variant="outline"
                                      size="icon-sm"
                                      tooltip="Edit"
                                      icon={<Pencil className="h-4 w-4" />}
                                      onClick={() => onEdit(child)}
                                    />
                                    <Button
                                      variant="outline"
                                      size="icon-sm"
                                      tooltip="Delete"
                                      icon={<Trash className="h-4 w-4 text-destructive" />}
                                      onClick={() => onDelete(child)}
                                    />
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          </>
          )}
        </div>
      )}
    </div>
  );
}
