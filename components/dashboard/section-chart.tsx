"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { SectionDistribution } from "@/lib/api2/dashboard";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Building2 } from "lucide-react";

export function SectionChart({
  data = [],
  isLoading = false,
}: {
  data?: SectionDistribution[];
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
            <Building2 className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-medium">Class Utilization</h3>
          </div>
        </div>
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          No section data available
        </div>
      </div>
    );
  }

  const chartData = data.map((item) => ({
    name: item.section,
    enrolled: item.count,
    capacity: item.capacity,
    utilization: item.utilization,
  }));

  const getBarColor = (utilization: number) => {
    if (utilization >= 90) return "#ef4444"; // Red for overcrowded
    if (utilization >= 75) return "#f59e0b"; // Yellow for full
    return "#10b981"; // Green for good capacity
  };

  const avgUtilization = 
    chartData.reduce((sum, item) => sum + item.utilization, 0) / chartData.length;

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Building2 className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-medium">Class Utilization</h3>
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
            <p className="text-sm text-muted-foreground mb-1">Average Utilization</p>
            <p className="text-3xl font-semibold tracking-tight">{avgUtilization.toFixed(0)}%</p>
          </div>
          <div className="text-sm space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-muted-foreground">Good (&lt;75%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="text-muted-foreground">Full (75-90%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-muted-foreground">Crowded (&gt;90%)</span>
            </div>
          </div>
        </div>

        {/* Chart */}
        <ResponsiveContainer 
          width="100%" 
          height={120}
          minWidth="100%"
          minHeight={120}
          className="min-[520px]:w-[280px] lg:w-full xl:w-[280px]"
        >
          <BarChart
            data={chartData}
            layout="horizontal"
            margin={{ top: 5, right: 10, left: 60, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis type="number" tick={{ fontSize: 12 }} hide />
            <YAxis dataKey="name" type="category" width={55} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(value) => `${value} students`} />
            <Bar dataKey="enrolled" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={getBarColor(entry.utilization)}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
