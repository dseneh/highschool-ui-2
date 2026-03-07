"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { PaymentSummary } from "@/lib/api2/dashboard";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, DollarSign } from "lucide-react";

export function PaymentSummaryChart({
  data,
  isLoading = false,
}: {
  data?: PaymentSummary;
  isLoading?: boolean;
}) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-1/3" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <DollarSign className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-medium">Payment Collection</h3>
          </div>
        </div>
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          No payment data available
        </div>
      </div>
    );
  }

  const chartData = [
    {
      name: "Payment Collection",
      paid: data.total_paid,
      pending: data.total_pending,
    },
  ];

  const total = data.total_expected || 1;
  const paidPercent = (data.total_paid / total) * 100;

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <DollarSign className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-medium">Payment Collection Summary</h3>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1 hover:bg-muted rounded-md transition-colors">
              <MoreVertical className="h-4 w-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuItem>View Details</DropdownMenuItem>
              <DropdownMenuItem>Export Data</DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Collection Rate Display */}
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-lg flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">Collection Rate</p>
          <p className="text-3xl font-semibold text-blue-600 dark:text-blue-400">
            {data.collection_rate.toFixed(1)}%
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground mb-1">Payments Received</p>
          <p className="text-2xl font-semibold">
            ${(data.total_paid / 1000).toFixed(1)}k
          </p>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis />
          <Tooltip
            formatter={(value: number) => {
              const formatted = (value / 1000).toFixed(1);
              return `$${formatted}k`;
            }}
          />
          <Legend />
          <Bar dataKey="paid" stackId="a" fill="#10b981" name="Paid" radius={[4, 4, 0, 0]} />
          <Bar dataKey="pending" stackId="a" fill="#f59e0b" name="Pending" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      {/* Breakdown Grid */}
      <div className="mt-6 grid grid-cols-3 gap-3">
        <div className="p-3 bg-muted rounded-lg">
          <p className="text-xs text-muted-foreground mb-1">Total Expected</p>
          <p className="text-lg font-semibold">
            ${(data.total_expected / 1000).toFixed(1)}k
          </p>
        </div>
        <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
          <p className="text-xs text-muted-foreground mb-1">Paid</p>
          <p className="text-lg font-semibold text-green-600 dark:text-green-400">
            ${(data.total_paid / 1000).toFixed(1)}k
          </p>
          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
            {paidPercent.toFixed(1)}%
          </p>
        </div>
        <div className="p-3 bg-amber-50 dark:bg-amber-950 rounded-lg">
          <p className="text-xs text-muted-foreground mb-1">Pending</p>
          <p className="text-lg font-semibold text-amber-600 dark:text-amber-400">
            ${(data.total_pending / 1000).toFixed(1)}k
          </p>
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
            {(100 - paidPercent).toFixed(1)}%
          </p>
        </div>
      </div>
    </div>
  );
}
