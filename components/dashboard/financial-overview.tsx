"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ChartLineData01Icon,
  ArrowUp01Icon,
  ArrowDown01Icon,
} from "@hugeicons/core-free-icons";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from "recharts";
import { useTheme } from "next-themes";

type ChartPoint = {
  month: string;
  moneyIn: number;
  moneyOut: number;
  moneyInChange?: number;
  moneyOutChange?: number;
};

type Period = "3m" | "6m" | "12m";

const periodLabels: Record<Period, string> = {
  "3m": "3 Months",
  "6m": "6 Months",
  "12m": "12 Months",
};

function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;

  const moneyIn = payload[0]?.value || 0;
  const moneyOut = payload[1]?.value || 0;

  return (
    <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
      <p className="text-sm font-semibold text-foreground mb-2">{label}</p>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-emerald-500" />
            <span className="text-xs text-muted-foreground">Collected</span>
          </div>
          <span className="text-sm font-semibold">
            ${(Number(moneyIn) / 1000).toFixed(0)}k
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-rose-500" />
            <span className="text-xs text-muted-foreground">Outstanding</span>
          </div>
          <span className="text-sm font-semibold">
            ${(Number(moneyOut) / 1000).toFixed(0)}k
          </span>
        </div>
      </div>
    </div>
  );
}

export function FinancialOverview({ data = [] }: { data?: ChartPoint[] }) {
  const { theme } = useTheme();
  const [period, setPeriod] = useState<Period>("12m");

  const chartData = useMemo(() => {
    if (!data.length) return [];
    
    switch (period) {
      case "3m":
        return data.slice(-3);
      case "6m":
        return data.slice(-6);
      default:
        return data;
    }
  }, [data, period]);

  const summary = useMemo(() => {
    if (!chartData.length) return { totalIn: 0, totalOut: 0, net: 0, trend: 0 };
    
    const totalIn = chartData.reduce((sum, d) => sum + d.moneyIn, 0);
    const totalOut = chartData.reduce((sum, d) => sum + d.moneyOut, 0);
    const net = totalIn - totalOut;
    
    // Calculate trend (compare first vs last month)
    const firstMonth = chartData[0];
    const lastMonth = chartData[chartData.length - 1];
    const firstNet = firstMonth.moneyIn - firstMonth.moneyOut;
    const lastNet = lastMonth.moneyIn - lastMonth.moneyOut;
    const trend = firstNet !== 0 ? ((lastNet - firstNet) / firstNet) * 100 : 0;
    
    return { totalIn, totalOut, net, trend };
  }, [chartData]);

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <HugeiconsIcon icon={ChartLineData01Icon} className="size-5 text-primary" />
            <h3 className="text-lg font-semibold">Fee Collection</h3>
          </div>
          <div className="flex items-center gap-3 mt-3">
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-emerald-500" />
              <span className="text-sm text-muted-foreground">Collected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-rose-500" />
              <span className="text-sm text-muted-foreground">Outstanding</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {(["3m", "6m", "12m"] as Period[]).map((p) => (
            <Button
              key={p}
              variant={period === p ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriod(p)}
              className="h-8 px-3"
            >
              {periodLabels[p]}
            </Button>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Net Collection</p>
          <p className="text-2xl font-bold">
            ${(summary.net / 1000).toFixed(1)}k
          </p>
          <div className="flex items-center gap-1">
            <HugeiconsIcon 
              icon={summary.trend >= 0 ? ArrowUp01Icon : ArrowDown01Icon} 
              className={`size-4 ${summary.trend >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}
            />
            <span className={`text-sm font-medium ${summary.trend >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              {Math.abs(summary.trend).toFixed(1)}%
            </span>
            <span className="text-xs text-muted-foreground">vs previous</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground mb-1">Collected</p>
            <p className="font-semibold text-emerald-600">
              ${(summary.totalIn / 1000).toFixed(1)}k
            </p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1">Outstanding</p>
            <p className="font-semibold text-rose-600">
              ${(summary.totalOut / 1000).toFixed(1)}k
            </p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-60">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradientIn" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="rgb(16, 185, 129)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="rgb(16, 185, 129)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradientOut" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="rgb(244, 63, 94)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="rgb(244, 63, 94)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={theme === "dark" ? "#374151" : "#e5e7eb"} />
              <XAxis 
                dataKey="month" 
                stroke={theme === "dark" ? "#9ca3af" : "#6b7280"}
                fontSize={12}
              />
              <YAxis 
                stroke={theme === "dark" ? "#9ca3af" : "#6b7280"}
                fontSize={12}
                tickFormatter={(value) => `$${value / 1000}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="moneyIn"
                stroke="rgb(16, 185, 129)"
                strokeWidth={2}
                fill="url(#gradientIn)"
              />
              <Area
                type="monotone"
                dataKey="moneyOut"
                stroke="rgb(244, 63, 94)"
                strokeWidth={2}
                fill="url(#gradientOut)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            No financial data available
          </div>
        )}
      </div>
    </Card>
  );
}
