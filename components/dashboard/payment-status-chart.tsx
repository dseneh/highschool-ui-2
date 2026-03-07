"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { PaymentStatusDistribution } from "@/lib/api2/dashboard";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, CreditCard } from "lucide-react";

export function PaymentStatusChart({
  data = [],
  isLoading = false,
}: {
  data?: PaymentStatusDistribution[];
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

  if (!data || data.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <CreditCard className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-medium">Payment Status</h3>
          </div>
        </div>
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          No payment data available
        </div>
      </div>
    );
  }

  const chartData = data.map((item) => ({
    name: item.status,
    value: item.count,
    percentage: item.percentage,
    color: item.color,
  }));

  const paidCount = chartData.find((item) => item.name.toLowerCase() === "paid")?.value || 0;
  const pendingCount = chartData.find((item) => item.name.toLowerCase() === "pending")?.value || 0;

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <CreditCard className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-medium">Payment Status Overview</h3>
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

      {/* Content */}
      <div className="flex flex-col min-[520px]:flex-row min-[520px]:items-end min-[520px]:justify-between lg:flex-col lg:items-stretch xl:flex-row xl:items-end xl:justify-between gap-4">
        {/* Summary */}
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Paid Students</p>
            <p className="text-3xl font-semibold tracking-tight">{paidCount}</p>
          </div>
          <div className="space-y-2">
            {chartData.map((item, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-muted-foreground">{item.name}</span>
                <span className="font-semibold">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart */}
        <ResponsiveContainer 
          width="100%" 
          height={100}
          minWidth="100%"
          minHeight={100}
          className="min-[520px]:w-[280px] lg:w-full xl:w-[280px]"
        >
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={60}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `${value} students`} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
