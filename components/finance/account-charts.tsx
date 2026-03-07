"use client";

import * as React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import type { BankAccountAnalysis } from "@/lib/api2/finance-types";
import { formatCurrency } from "@/lib/utils";

interface AccountChartsProps {
  analysis: BankAccountAnalysis;
  currency?: string;
}

const INCOME_COLOR = "#10b981";
const EXPENSE_COLOR = "#ef4444";
const PIE_COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#06b6d4", "#84cc16"];

export function AccountCharts({ analysis, currency = "USD" }: AccountChartsProps) {
  /* ---- Monthly Trends ---- */
  const monthlyData = React.useMemo(() => {
    if (!analysis.monthly_trends?.length) return [];

    const monthsMap = new Map<string, { month: string; income: number; expense: number }>();

    for (const trend of analysis.monthly_trends) {
      if (!monthsMap.has(trend.month)) {
        // Format "2025-10" → "Oct 2025"
        const [year, m] = trend.month.split("-");
        const label = new Date(Number(year), Number(m) - 1).toLocaleDateString(
          "en-US",
          { month: "short", year: "numeric" }
        );
        monthsMap.set(trend.month, { month: label, income: 0, expense: 0 });
      }
      const entry = monthsMap.get(trend.month)!;
      if (trend.type === "income") entry.income = trend.total;
      if (trend.type === "expense") entry.expense = Math.abs(trend.total);
    }

    return Array.from(monthsMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, v]) => v);
  }, [analysis.monthly_trends]);

  /* ---- Type Breakdown ---- */
  const typeData = React.useMemo(() => {
    if (!analysis.type_breakdown?.length) return [];
    return analysis.type_breakdown.map((item) => ({
      name: item.type === "income" ? "Income" : "Expense",
      value: Math.abs(item.total),
      color: item.type === "income" ? INCOME_COLOR : EXPENSE_COLOR,
    }));
  }, [analysis.type_breakdown]);

  /* ---- Payment Method Breakdown ---- */
  const paymentData = React.useMemo(() => {
    if (!analysis.payment_method_breakdown?.length) return [];
    return analysis.payment_method_breakdown.map((item, i) => ({
      name: item.payment_method,
      value: Math.abs(item.total),
      color: PIE_COLORS[i % PIE_COLORS.length],
    }));
  }, [analysis.payment_method_breakdown]);

  const hasNoData = !monthlyData.length && !typeData.length && !paymentData.length;
  if (hasNoData) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
      {/* Monthly Trends — 2 col span */}
      {monthlyData.length > 0 && (
        <div className="lg:col-span-2 rounded-xl border bg-card p-4">
          <h3 className="text-sm font-semibold mb-3">Monthly Trends</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthlyData} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11 }}
                className="fill-muted-foreground"
              />
              <YAxis
                tick={{ fontSize: 11 }}
                className="fill-muted-foreground"
                tickFormatter={(v: number) => `${currency}${v.toLocaleString()}`}
              />
              <Tooltip
                formatter={(value: number) => formatCurrency(value, currency)}
                contentStyle={{
                  borderRadius: 8,
                  fontSize: 12,
                  border: "1px solid var(--color-border)",
                  background: "var(--color-card)",
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="income" name="Income" fill={INCOME_COLOR} radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" name="Expense" fill={EXPENSE_COLOR} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Transaction Type Breakdown — 1 col */}
      {typeData.length > 0 && (
        <div className="rounded-xl border bg-card p-4">
          <h3 className="text-sm font-semibold mb-3">Transaction Type</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={typeData}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={75}
                dataKey="value"
                paddingAngle={2}
                label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
              >
                {typeData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatCurrency(value, currency)} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Payment Method Breakdown — 1 col */}
      {paymentData.length > 0 && (
        <div className="rounded-xl border bg-card p-4">
          <h3 className="text-sm font-semibold mb-3">Payment Methods</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={paymentData}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={75}
                dataKey="value"
                paddingAngle={2}
                label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
              >
                {paymentData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatCurrency(value, currency)} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
