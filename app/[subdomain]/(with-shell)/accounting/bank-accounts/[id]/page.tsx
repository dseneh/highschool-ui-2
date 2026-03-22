"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Delete01Icon,
  PlusSignIcon,
  PencilEdit01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import PageLayout from "@/components/dashboard/page-layout";
import { StatsCards } from "@/components/shared/stats-cards";
import { Badge } from "@/components/ui/badge";
import StatusBadge from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { DialogBox } from "@/components/ui/dialog-box";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectField } from "@/components/ui/select-field";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { showToast } from "@/lib/toast";
import {
  useAccountingBankAccount,
  useAccountingBankAccountMutations,
  useCashTransactionMutations,
} from "@/hooks/use-accounting";
import type {
  AccountingBankAccountDetailDto,
  AccountingBankAccountRecentActivityDto,
  BankAccountStatus,
  UpdateAccountingBankAccountCommand,
} from "@/lib/api2/accounting-types";
import { getErrorMessage } from "@/lib/utils";

const STATUS_OPTIONS: { value: BankAccountStatus; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "closed", label: "Closed" },
];

const ACTIVITY_COLORS = ["#22c55e", "#f59e0b", "#ef4444"];

function formatMoney(value: number, code: string) {
  return `${code} ${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function currencyCode(account?: AccountingBankAccountDetailDto) {
  if (!account) return "USD";
  if (typeof account.currency === "string") return account.currency;
  return account.currency.code ?? "USD";
}

function currencySymbol(account?: AccountingBankAccountDetailDto) {
  if (!account) return "$";
  if (typeof account.currency === "string") return account.currency;
  return account.currency.symbol ?? "$";
}

function toNumber(value: string | number | undefined | null): number {
  if (typeof value === "number") return value;
  return Number(value ?? 0);
}

export default function AccountingBankAccountDetailPage() {
  const params = useParams();
  const router = useRouter();
  const accountId = String(params.id ?? "");

  const { data: account, isLoading, error, refetch } = useAccountingBankAccount(accountId);
  const { update, remove } = useAccountingBankAccountMutations();
  const cashMutations = useCashTransactionMutations();

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirmed, setDeleteConfirmed] = useState(false);
  const [activityLoadingId, setActivityLoadingId] = useState<string | null>(null);

  const [editForm, setEditForm] = useState({
    account_name: "",
    bank_name: "",
    status: "active" as BankAccountStatus,
    opening_balance: 0,
    description: "",
  });

  useEffect(() => {
    if (!editOpen || !account) return;
    setEditForm({
      account_name: account.account_name,
      bank_name: account.bank_name,
      status: account.status,
      opening_balance: toNumber(account.opening_balance),
      description: account.description ?? "",
    });
  }, [editOpen, account]);

  const code = currencyCode(account);
  const symbol = currencySymbol(account);

  const monthlyData = useMemo(() => {
    if (!account) return [];
    return account.monthly_activity.map((item) => ({
      month: item.month,
      income: toNumber(item.income),
      expense: toNumber(item.expense),
    }));
  }, [account]);

  const activityBreakdownData = useMemo(() => {
    if (!account) return [];
    return [
      { name: "Approved", value: account.activity_breakdown.approved },
      { name: "Pending", value: account.activity_breakdown.pending },
      { name: "Rejected", value: account.activity_breakdown.rejected },
    ];
  }, [account]);

  const statsItems = account
    ? [
        {
          title: "Opening Amount",
          value: formatMoney(toNumber(account.opening_amount), symbol),
          subtitle: "Starting value",
          icon: PlusSignIcon,
        },
        {
          title: "Total Income",
          value: formatMoney(toNumber(account.total_income), symbol),
          subtitle: "Approved income entries",
          icon: PlusSignIcon,
        },
        {
          title: "Total Expense",
          value: formatMoney(toNumber(account.total_expense), symbol),
          subtitle: "Approved expense entries",
          icon: Delete01Icon,
        },
        {
          title: "Net Balance",
          value: formatMoney(toNumber(account.net_balance), symbol),
          subtitle: "Opening + income - expense",
          icon: PencilEdit01Icon,
        },
      ]
    : [];

  async function handleSaveEdit() {
    if (!account) return;

    const payload: UpdateAccountingBankAccountCommand = {
      account_name: editForm.account_name,
      bank_name: editForm.bank_name,
      status: editForm.status,
      opening_balance: editForm.opening_balance,
      description: editForm.description || null,
    };

    try {
      await update.mutateAsync({ id: account.id, payload });
      showToast.success("Bank account updated");
      setEditOpen(false);
      refetch();
    } catch (e) {
      showToast.error("Failed to update bank account", getErrorMessage(e));
    }
  }

  async function handleDelete() {
    if (!account || !deleteConfirmed) return;

    try {
      await remove.mutateAsync(account.id);
      showToast.success("Bank account deleted");
      router.push("/accounting/bank-accounts");
    } catch (e) {
      showToast.error("Failed to delete bank account", getErrorMessage(e));
    }
  }

  async function handleActivityAction(activity: AccountingBankAccountRecentActivityDto) {
    try {
      setActivityLoadingId(activity.id);

      if (activity.status === "pending") {
        await cashMutations.approve.mutateAsync(activity.id);
        showToast.success("Activity approved");
      } else if (activity.status === "approved" && !activity.posted) {
        await cashMutations.post.mutateAsync(activity.id);
        showToast.success("Activity posted to ledger");
      }

      await refetch();
    } catch (e) {
      showToast.error("Failed to process activity action", getErrorMessage(e));
    } finally {
      setActivityLoadingId(null);
    }
  }

  return (
    <>
      <PageLayout
        title={account?.account_name ?? "Bank Account"}
        description={
          account
            ? `${account.bank_name} · ${account.account_number} · ${code}`
            : "Detailed account analytics and recent activities"
        }
        loading={isLoading}
        error={error}
        refreshAction={refetch}
        actions={
          <div className="flex items-center gap-2">
            {/* <Button
              variant="outline"
              iconLeft={<HugeiconsIcon icon={ArrowLeft02Icon} className="size-4" />}
              onClick={() => router.push("/accounting/bank-accounts")}
            >
              Back
            </Button> */}
            <Button
              variant="outline"
              iconLeft={<HugeiconsIcon icon={PencilEdit01Icon} className="size-4" />}
              onClick={() => setEditOpen(true)}
              disabled={!account}
            >
              Edit
            </Button>
            <Button
              variant="destructive"
              iconLeft={<HugeiconsIcon icon={Delete01Icon} className="size-4" />}
              onClick={() => setDeleteOpen(true)}
              disabled={!account}
            >
              Delete
            </Button>
          </div>
        }
      >
        {account ? (
          <>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <StatusBadge status={account.status} className="capitalize" />
              {account.ledger_account_detail ? (
                <Badge variant="outline">
                  {account.ledger_account_detail.code} - {account.ledger_account_detail.name}
                </Badge>
              ) : (
                <Badge variant="outline">No linked ledger account</Badge>
              )}
            </div>

            <StatsCards items={statsItems} />

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
              <Card className="xl:col-span-2">
                <CardHeader>
                  <CardTitle>Income vs Expense Trend</CardTitle>
                  <CardDescription>Monthly movement over approved activity</CardDescription>
                </CardHeader>
                <CardContent>
                  {monthlyData.length ? (
                    <div className="h-72 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={monthlyData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Area type="monotone" dataKey="income" stroke="#22c55e" fill="#22c55e33" />
                          <Area type="monotone" dataKey="expense" stroke="#ef4444" fill="#ef444433" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No approved activity yet.</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Activity Mix</CardTitle>
                  <CardDescription>Recent activity status split</CardDescription>
                </CardHeader>
                <CardContent>
                  {activityBreakdownData.some((item) => item.value > 0) ? (
                    <div className="h-72 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={activityBreakdownData}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={70}
                            outerRadius={100}
                            paddingAngle={3}
                          >
                            {activityBreakdownData.map((entry, index) => (
                              <Cell key={entry.name} fill={ACTIVITY_COLORS[index % ACTIVITY_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No recent activities to visualize.</p>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card className="pb-0 space-y-0">
              <CardHeader className="border-b">
                <CardTitle>Recent Activities</CardTitle>
                <CardDescription>Showing up to 5 latest transactions for this account</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {account.recent_activities.length ? (
                  <>
                    <div className="hidden md:block">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Reference</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Payment Method</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {account.recent_activities.map((activity) => {
                            const canApprove = activity.status === "pending";
                            const canPost = activity.status === "approved" && !activity.posted;
                            const transactionTypeLabel =
                              typeof activity.transaction_type === "string"
                                ? activity.transaction_type
                                : activity.transaction_type.name;
                            const paymentMethodLabel =
                              typeof activity.payment_method === "string"
                                ? activity.payment_method
                                : activity.payment_method.name;

                            return (
                              <TableRow key={activity.id}>
                                <TableCell>
                                  <div className="space-y-1">
                                    <p className="font-medium uppercase">{activity.reference_number}</p>
                                    <p className="text-xs text-muted-foreground">{activity.description}</p>
                                  </div>
                                </TableCell>
                                <TableCell>{activity.transaction_date}</TableCell>
                                <TableCell>
                                  <Badge variant="outline">{transactionTypeLabel}</Badge>
                                </TableCell>
                                <TableCell>{paymentMethodLabel}</TableCell>
                                <TableCell>
                                  <StatusBadge status={activity.status} className="capitalize" />
                                </TableCell>
                                <TableCell className="text-right font-mono">
                                  {formatMoney(toNumber(activity.base_amount), code)}
                                </TableCell>
                                <TableCell className="text-right">
                                  {canApprove ? (
                                    <Button
                                      size="sm"
                                      onClick={() => handleActivityAction(activity)}
                                      loading={activityLoadingId === activity.id}
                                      loadingText="Approving"
                                    >
                                      Approve
                                    </Button>
                                  ) : null}
                                  {canPost ? (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleActivityAction(activity)}
                                      loading={activityLoadingId === activity.id}
                                      loadingText="Posting"
                                    >
                                      Post to Ledger
                                    </Button>
                                  ) : null}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>

                    <div className="space-y-3 md:hidden">
                      {account.recent_activities.map((activity) => {
                        const canApprove = activity.status === "pending";
                        const canPost = activity.status === "approved" && !activity.posted;
                        const transactionTypeLabel =
                          typeof activity.transaction_type === "string"
                            ? activity.transaction_type
                            : activity.transaction_type.name;
                        const paymentMethodLabel =
                          typeof activity.payment_method === "string"
                            ? activity.payment_method
                            : activity.payment_method.name;

                        return (
                          <div
                            key={activity.id}
                            className="flex flex-col gap-3 rounded-lg border p-3"
                          >
                            <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="font-medium">{activity.reference_number}</p>
                                <Badge variant="outline">{transactionTypeLabel}</Badge>
                                <StatusBadge status={activity.status} className="capitalize" />
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {activity.transaction_date} · {paymentMethodLabel}
                                {activity.payer_payee ? ` · ${activity.payer_payee}` : ""}
                              </p>
                              <p className="text-sm">{activity.description}</p>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-mono text-sm font-medium">
                                {formatMoney(toNumber(activity.base_amount), code)}
                              </p>
                              {canApprove ? (
                                <Button
                                  size="sm"
                                  onClick={() => handleActivityAction(activity)}
                                  loading={activityLoadingId === activity.id}
                                  loadingText="Approving"
                                >
                                  Approve
                                </Button>
                              ) : null}
                              {canPost ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleActivityAction(activity)}
                                  loading={activityLoadingId === activity.id}
                                  loadingText="Posting"
                                >
                                  Post to Ledger
                                </Button>
                              ) : null}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">No recent activity found for this account.</p>
                )}
              </CardContent>
            </Card>
          </>
        ) : null}
      </PageLayout>

      <DialogBox
        open={editOpen}
        onOpenChange={setEditOpen}
        title="Edit Bank Account"
        description="Update account profile details."
        actionLabel="Save"
        onAction={handleSaveEdit}
        actionLoading={update.isPending}
      >
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="account_name">Account Name</Label>
            <Input
              id="account_name"
              value={editForm.account_name}
              onChange={(event) => setEditForm((prev) => ({ ...prev, account_name: event.target.value }))}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="bank_name">Bank Name</Label>
            <Input
              id="bank_name"
              value={editForm.bank_name}
              onChange={(event) => setEditForm((prev) => ({ ...prev, bank_name: event.target.value }))}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="status">Status</Label>
            <SelectField
              items={STATUS_OPTIONS}
              value={editForm.status}
              onValueChange={(value) =>
                setEditForm((prev) => ({ ...prev, status: value as BankAccountStatus }))
              }
              placeholder="Select status"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="opening_balance">Opening Balance</Label>
            <Input
              id="opening_balance"
              type="number"
              step="0.01"
              value={editForm.opening_balance}
              onChange={(event) =>
                setEditForm((prev) => ({ ...prev, opening_balance: Number(event.target.value || 0) }))
              }
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={editForm.description}
              onChange={(event) => setEditForm((prev) => ({ ...prev, description: event.target.value }))}
            />
          </div>
        </div>
      </DialogBox>

      <DialogBox
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open);
          if (!open) setDeleteConfirmed(false);
        }}
        title="Delete Bank Account"
        description="This action is irreversible. Existing linked transactions may prevent deletion."
        actionLabel="Delete Account"
        actionVariant="destructive"
        onAction={handleDelete}
        actionDisabled={!deleteConfirmed}
        actionLoading={remove.isPending}
      >
        <div className="space-y-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
          <p className="text-sm text-destructive">
            You are about to permanently delete this bank account and lose access to its configuration.
          </p>
          <div className="flex items-center gap-2">
            <Checkbox
              checked={deleteConfirmed}
              onCheckedChange={(checked) => setDeleteConfirmed(Boolean(checked))}
            />
            <Label>I understand the consequences and want to continue.</Label>
          </div>
        </div>
      </DialogBox>
    </>
  );
}
