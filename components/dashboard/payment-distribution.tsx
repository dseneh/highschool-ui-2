"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { CreditCard } from "lucide-react";
import type { PaymentStatusDistribution } from "@/lib/api2/dashboard";

import { DashboardCard } from "./dashboard-card";
interface PaymentDistributionProps {
  data?: PaymentStatusDistribution[];
  isLoading?: boolean;
}

const statusColors: Record<string, string> = {
  paid: "#22c55e",
  pending: "#f97316",
  overdue: "#ef4444",
  partial: "#f59e0b",
  exempted: "#8b5cf6",
  written_off: "#6b7280",
};

export function PaymentDistribution({ data = [], isLoading = false }: PaymentDistributionProps) {
  if (isLoading) {
    return (
      <DashboardCard className="w-full p-6">
        <div className="space-y-4">
          <div className="h-6 bg-muted rounded w-1/3 animate-pulse" />
          <div className="h-48 bg-muted rounded animate-pulse" />
        </div>
      </DashboardCard>
    );
  }

  if (!data || data.length === 0) {
    return (
      <DashboardCard className="w-full p-6">
        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <CreditCard className="size-5" />
          Payment Distribution
        </h3>
        <div className="flex items-center justify-center h-48 text-muted-foreground">
          <p>No payment data available</p>
        </div>
      </DashboardCard>
    );
  }

  // Transform data for chart
  const chartData = data.map((item) => ({
    name: item.status.charAt(0).toUpperCase() + item.status.slice(1).replace(/_/g, " "),
    count: item.count,
    percentage: item.percentage,
    fill: statusColors[item.status] || "#3b82f6",
  }));

  return (
    <DashboardCard
      gradientFrom="from-amber-400/20 dark:from-amber-300/10"
      gradientTo="to-orange-500/20 dark:to-orange-400/10"
      disableHoverAccent
      className="w-full p-6"
    >
      <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
        <CreditCard className="size-5" />
        Payment Distribution
      </h3>

      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground))" opacity={0.1} />
          <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "0.5rem",
            }}
            formatter={(value: any) => [value, "Count"]}
          />
          <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        {data.map((item) => (
          <div key={item.status} className="flex items-center gap-2">
            <div
              className="size-3 rounded-full"
              style={{ backgroundColor: statusColors[item.status] || "#3b82f6" }}
            />
            <span className="text-sm text-muted-foreground">
              {item.status.charAt(0).toUpperCase() + item.status.slice(1).replace(/_/g, " ")}: {item.count} ({item.percentage.toFixed(1)}%)
            </span>
          </div>
        ))}
      </div>
    </DashboardCard>
  );
}
