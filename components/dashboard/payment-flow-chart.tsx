"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { Bar, BarChart, Line, LineChart, Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, TooltipProps } from "recharts";
import { BarChart2, MoreHorizontal, ChevronLeft, ChevronRight, BarChart3, LineChartIcon, TrendingUp, Calendar, Grid3X3, RefreshCw, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import type { FinanceDataPoint, PaymentSummary } from "@/lib/api2/dashboard";

import { DashboardCard } from "./dashboard-card";

interface PaymentFlowChartProps {
  data?: FinanceDataPoint[];
  paymentSummary?: PaymentSummary;
}

type PaymentChartPoint = {
  month: string;
  collected: number;
  pending: number;
};

type ChartType = "bar" | "line" | "area";
type TimePeriod = "3months" | "6months" | "year" | "q1" | "q2" | "q3" | "q4";

const periodLabels: Record<TimePeriod, string> = {
  "3months": "Last 3 Months",
  "6months": "Last 6 Months",
  year: "Full Year",
  q1: "Q1 (Jan-Mar)",
  q2: "Q2 (Apr-Jun)",
  q3: "Q3 (Jul-Sep)",
  q4: "Q4 (Oct-Dec)",
};

function getDataForPeriod(data: PaymentChartPoint[], period: TimePeriod) {
  switch (period) {
    case "3months":
      return data.slice(-3);
    case "6months":
      return data.slice(-6);
    case "q1":
      return data.slice(0, 3);
    case "q2":
      return data.slice(3, 6);
    case "q3":
      return data.slice(6, 9);
    case "q4":
      return data.slice(9, 12);
    default:
      return data;
  }
}

function toShortMonth(monthValue: string) {
  if (/^\d{4}-\d{2}/.test(monthValue)) {
    const date = new Date(`${monthValue}-01T00:00:00`);
    return date.toLocaleString("en-US", { month: "short" });
  }
  return monthValue;
}

function buildInsights(data: PaymentChartPoint[]) {
  if (!data.length) {
    return ["No payment data available for the selected period."];
  }

  const totalCollected = data.reduce((sum, item) => sum + item.collected, 0);
  const totalPending = data.reduce((sum, item) => sum + item.pending, 0);
  const peak = data.reduce((prev, current) => (current.collected > prev.collected ? current : prev), data[0]);
  const net = totalCollected - totalPending;

  return [
    `${peak.month} had the highest collections at $${peak.collected.toLocaleString()}.`,
    `Total collected: $${totalCollected.toLocaleString()} across ${data.length} months.`,
    `Total pending: $${totalPending.toLocaleString()} for the same period.`,
    `Net paid position is $${net.toLocaleString()}.`,
  ];
}

function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;

  const collected = payload.find((p) => p.dataKey === "collected")?.value || 0;
  const pending = payload.find((p) => p.dataKey === "pending")?.value || 0;
  const total = Number(collected) - Number(pending);

  return (
    <div className="bg-popover border border-border rounded-lg p-2 sm:p-3 shadow-lg">
      <p className="text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2">{label}</p>
      <div className="space-y-1 sm:space-y-1.5">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="size-2 sm:size-2.5 rounded-full" style={{ background: "#10b981" }} />
          <span className="text-[10px] sm:text-sm text-muted-foreground">Collected:</span>
          <span className="text-[10px] sm:text-sm font-medium text-foreground">${Number(collected).toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="size-2 sm:size-2.5 rounded-full" style={{ background: "#f59e0b" }} />
          <span className="text-[10px] sm:text-sm text-muted-foreground">Pending:</span>
          <span className="text-[10px] sm:text-sm font-medium text-foreground">${Number(pending).toLocaleString()}</span>
        </div>
        <div className="pt-1 border-t border-border mt-1">
          <span className="text-[10px] sm:text-xs font-medium text-blue-500">Net: ${Number(total).toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}

export function PaymentFlowChart({ data = [], paymentSummary }: PaymentFlowChartProps) {
  const { resolvedTheme } = useTheme();
  const [chartType, setChartType] = useState<ChartType>("bar");
  const [period, setPeriod] = useState<TimePeriod>("year");
  const [showGrid, setShowGrid] = useState(true);
  const [showCollected, setShowCollected] = useState(true);
  const [showPending, setShowPending] = useState(true);
  const [smoothCurve, setSmoothCurve] = useState(true);
  const [currentInsight, setCurrentInsight] = useState(0);

  const isDark = resolvedTheme === "dark";
  const axisColor = isDark ? "#71717a" : "#a1a1aa";
  const gridColor = isDark ? "#27272a" : "#f4f4f5";

  const monthlyData: PaymentChartPoint[] = [...data]
    .sort((a, b) => a.month.localeCompare(b.month))
    .map((item) => ({
      month: toShortMonth(item.month),
      collected: Number(item.moneyIn || 0),
      pending: Number(item.moneyOut || 0),
    }));

  const fallbackData: PaymentChartPoint[] = paymentSummary
    ? [
        {
          month: "Current",
          collected: Number(paymentSummary.total_paid || 0),
          pending: Number(paymentSummary.total_pending || 0),
        },
      ]
    : [];

  const fullYearData = monthlyData.length > 0 ? monthlyData : fallbackData;

  const chartData = getDataForPeriod(fullYearData, period);
  const insights = buildInsights(chartData);
  const totalCollected = chartData.reduce((acc, item) => acc + item.collected, 0);

  return (
    <DashboardCard
      gradientFrom="from-amber-400/20 dark:from-amber-300/10"
      gradientTo="to-orange-500/20 dark:to-orange-400/10"
      disableHoverAccent
      className="flex-1 flex flex-col gap-4 sm:gap-6 p-6 min-w-0"
    >
      <div className="flex flex-wrap items-center gap-2 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-2.5 flex-1">
          <Button variant="outline" size="icon" className="size-7 sm:size-8">
            <BarChart2 className="size-4 sm:size-4.5 text-muted-foreground" />
          </Button>
          <span className="text-sm sm:text-base font-medium">Payment Collection</span>
        </div>
        <div className="hidden sm:flex items-center gap-3 sm:gap-5">
          <div className="flex items-center gap-1.5">
            <div className="size-2.5 sm:size-3 rounded-full bg-emerald-500" />
            <span className="text-[10px] sm:text-xs text-muted-foreground">Collected</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="size-2.5 sm:size-3 rounded-full bg-amber-500" />
            <span className="text-[10px] sm:text-xs text-muted-foreground">Pending</span>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-7 sm:size-8">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Chart Options</DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />

            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <BarChart3 className="size-4 mr-2" />
                Chart Type
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => setChartType("bar")}>
                  <BarChart3 className="size-4 mr-2" />
                  Bar Chart
                  {chartType === "bar" && <Check className="size-4 ml-auto" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setChartType("line")}>
                  <LineChartIcon className="size-4 mr-2" />
                  Line Chart
                  {chartType === "line" && <Check className="size-4 ml-auto" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setChartType("area")}>
                  <TrendingUp className="size-4 mr-2" />
                  Area Chart
                  {chartType === "area" && <Check className="size-4 ml-auto" />}
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Calendar className="size-4 mr-2" />
                Time Period
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {(Object.keys(periodLabels) as TimePeriod[]).map((key) => (
                  <DropdownMenuItem key={key} onClick={() => setPeriod(key)}>
                    {periodLabels[key]}
                    {period === key && <Check className="size-4 ml-auto" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSeparator />

            <DropdownMenuCheckboxItem checked={showGrid} onCheckedChange={setShowGrid}>
              <Grid3X3 className="size-4 mr-2" />
              Show Grid Lines
            </DropdownMenuCheckboxItem>

            {(chartType === "line" || chartType === "area") && (
              <DropdownMenuCheckboxItem checked={smoothCurve} onCheckedChange={setSmoothCurve}>
                <TrendingUp className="size-4 mr-2" />
                Smooth Curve
              </DropdownMenuCheckboxItem>
            )}

            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-xs">Data Series</DropdownMenuLabel>

              <DropdownMenuCheckboxItem checked={showCollected} onCheckedChange={setShowCollected}>
                <div className="size-3 rounded-full mr-2" style={{ background: "#10b981" }} />
                Show Collected
              </DropdownMenuCheckboxItem>

              <DropdownMenuCheckboxItem checked={showPending} onCheckedChange={setShowPending}>
                <div className="size-3 rounded-full mr-2" style={{ background: "#f59e0b" }} />
                Show Pending
              </DropdownMenuCheckboxItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => {
                setChartType("bar");
                setPeriod("6months");
                setShowGrid(true);
                setShowCollected(true);
                setShowPending(true);
                setSmoothCurve(true);
              }}
            >
              <RefreshCw className="size-4 mr-2" />
              Reset to Default
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-10 flex-1 min-h-0">
        <div className="flex flex-col gap-4 w-full lg:w-50 xl:w-55 shrink-0">
          <div className="space-y-2 sm:space-y-4">
            <p className="text-xl sm:text-2xl lg:text-[28px] font-semibold leading-tight tracking-tight pt-3">${totalCollected.toLocaleString()}</p>
            <p className="text-xs sm:text-sm text-muted-foreground">Total Collected ({periodLabels[period]})</p>
          </div>

          <div className="bg-muted/50 rounded-lg p-3 sm:p-4 space-y-3 sm:space-y-4">
            <p className="text-xs sm:text-sm font-semibold">📊 Payment Insight</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground leading-relaxed">{insights[currentInsight]}</p>
            <div className="flex items-center gap-2.5 sm:gap-3.5">
              <ChevronLeft
                className="size-3 sm:size-3.5 text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                onClick={() => setCurrentInsight((prev) => (prev === 0 ? insights.length - 1 : prev - 1))}
              />
              <div className="flex-1 flex items-center gap-1">
                {insights.map((_, index) => (
                  <div
                    key={index}
                    className={`flex-1 h-0.5 rounded-full transition-colors ${index === currentInsight ? "bg-foreground" : "bg-muted-foreground/30"}`}
                  />
                ))}
              </div>
              <ChevronRight
                className="size-3 sm:size-3.5 text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                onClick={() => setCurrentInsight((prev) => (prev === insights.length - 1 ? 0 : prev + 1))}
              />
            </div>
          </div>
        </div>

        <div className="flex-1 h-45 sm:h-50 lg:h-60 min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "bar" ? (
              <BarChart data={chartData} barGap={2}>
                <defs>
                  <linearGradient id="collectedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.6} />
                  </linearGradient>
                  <linearGradient id="pendingGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={1} />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
                {showGrid && <CartesianGrid strokeDasharray="0" stroke={gridColor} vertical={false} />}
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: axisColor, fontSize: 10 }} dy={8} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: axisColor, fontSize: 10 }} dx={-5} tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} width={40} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: isDark ? "#27272a" : "#f4f4f5", radius: 4 }} />
                {showCollected && <Bar dataKey="collected" fill="url(#collectedGradient)" radius={[4, 4, 0, 0]} maxBarSize={18} />}
                {showPending && <Bar dataKey="pending" fill="url(#pendingGradient)" radius={[4, 4, 0, 0]} maxBarSize={18} />}
              </BarChart>
            ) : chartType === "line" ? (
              <LineChart data={chartData}>
                {showGrid && <CartesianGrid strokeDasharray="0" stroke={gridColor} vertical={false} />}
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: axisColor, fontSize: 10 }} dy={8} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: axisColor, fontSize: 10 }} dx={-5} tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} width={40} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: isDark ? "#52525b" : "#d4d4d8" }} />
                {showCollected && <Line type={smoothCurve ? "monotone" : "linear"} dataKey="collected" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981", strokeWidth: 0, r: 3 }} activeDot={{ r: 5, fill: "#10b981" }} />}
                {showPending && <Line type={smoothCurve ? "monotone" : "linear"} dataKey="pending" stroke="#f59e0b" strokeWidth={2} dot={{ fill: "#f59e0b", strokeWidth: 0, r: 3 }} activeDot={{ r: 5, fill: "#f59e0b" }} />}
              </LineChart>
            ) : (
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="collectedAreaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="pendingAreaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                {showGrid && <CartesianGrid strokeDasharray="0" stroke={gridColor} vertical={false} />}
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: axisColor, fontSize: 10 }} dy={8} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: axisColor, fontSize: 10 }} dx={-5} tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} width={40} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: isDark ? "#52525b" : "#d4d4d8" }} />
                {showCollected && <Area type={smoothCurve ? "monotone" : "linear"} dataKey="collected" stroke="#10b981" strokeWidth={2} fill="url(#collectedAreaGradient)" />}
                {showPending && <Area type={smoothCurve ? "monotone" : "linear"} dataKey="pending" stroke="#f59e0b" strokeWidth={2} fill="url(#pendingAreaGradient)" />}
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    </DashboardCard>
  );
}
