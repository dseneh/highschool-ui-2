"use client";

import { useState } from "react";
import { MoreVertical, TrendingUp, TrendingDown } from "lucide-react";
import {
  Area,
  AreaChart,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  CartesianGrid
} from "recharts";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import type { StudentDto } from "@/lib/api/student-types";
import { DollarCircleIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

interface StudentFinancialTrendChartProps {
  student: StudentDto;
}

function CustomTooltip({
  active,
  payload,
  label,
}: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-popover border border-border rounded-lg px-3 py-2 shadow-sm">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      {payload.map((entry, index) => (
        <p key={index} className="text-xs font-medium" style={{ color: entry.color }}>
          {entry.name}: {entry.value?.toLocaleString()}
        </p>
      ))}
    </div>
  );
}

export function StudentFinancialTrendChart({ student }: StudentFinancialTrendChartProps) {
  const { resolvedTheme } = useTheme();
  const [lineType, setLineType] = useState<"linear" | "monotone">("monotone");

  const isDark = resolvedTheme === "dark";

  // Transform enrollment data for the chart
  // Sort by date to ensure chronological order
  const data = (student?.enrollments || [])
    .slice()
    .sort((a, b) => {
      const dateA = a.academic_year?.start_date ? new Date(a.academic_year.start_date).getTime() : 0;
      const dateB = b.academic_year?.start_date ? new Date(b.academic_year.start_date).getTime() : 0;
      return dateA - dateB;
    })
    .map((enrollment) => ({
      year: enrollment.academic_year?.name || "N/A",
      billed: enrollment.billing_summary?.total_bill || 0,
      paid: enrollment.billing_summary?.paid || 0,
    }));

  // If we have the current enrollment and it's not in the list (sometimes API behaves differently), add it
  // But usually enrollments array includes current. Let's assume it does or is sufficient.
  // If list is empty, use current enrollment
  if (data.length === 0 && student?.current_enrollment) {
      const e = student.current_enrollment;
      data.push({
          year: e.academic_year?.name || "Current",
          billed: e.billing_summary?.total_bill || 0,
          paid: e.billing_summary?.paid || 0,
      });
  }

  const totalBilled = data.reduce((sum, item) => sum + item.billed, 0);
  const totalPaid = data.reduce((sum, item) => sum + item.paid, 0);
  const collectionRate = totalBilled > 0 ? Math.round((totalPaid / totalBilled) * 100) : 0;

  return (
    <div className="flex-1 rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 text-muted-foreground">
          <HugeiconsIcon icon={DollarCircleIcon} className="size-5" />
          <span className="font-medium">Financial History</span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <span className="inline-flex size-8 items-center justify-center rounded-md hover:bg-muted">
              <MoreVertical className="size-4 text-muted-foreground rotate-90" />
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-xs">
                Line Style
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={lineType === "monotone"}
                onCheckedChange={(checked) =>
                  setLineType(checked ? "monotone" : "linear")
                }
              >
                Smooth Lines
              </DropdownMenuCheckboxItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex flex-col min-[520px]:flex-row min-[520px]:items-end min-[520px]:justify-between lg:flex-col lg:items-stretch xl:flex-row xl:items-end xl:justify-between gap-4">
        <div className="space-y-4 min-[520px]:space-y-6">
          <p className="text-3xl font-semibold tracking-tight">
            ${totalBilled.toLocaleString()}
          </p>
          <div className="flex items-center gap-1.5">
            <div
              className={`flex items-center gap-0.5 ${
                collectionRate >= 90 ? "text-emerald-500" : collectionRate >= 50 ? "text-amber-500" : "text-red-500"
              }`}
            >
              {collectionRate >= 90 ? (
                <TrendingUp className="size-4" />
              ) : (
                <TrendingDown className="size-4" />
              )}
              <span className="font-semibold text-sm">{collectionRate}%</span>
            </div>
            <span className="text-sm text-muted-foreground">Collection Rate</span>
          </div>
        </div>

        <div className="w-full min-[520px]:w-[280px] lg:w-full xl:w-[280px] h-[100px]">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorBilled" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorPaid" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="year"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: isDark ? "#9ca3af" : "#6b7280", fontSize: 11 }}
                  interval={0}
                />
                <Tooltip content={<CustomTooltip />} cursor={false} />
                <Area
                  type={lineType}
                  dataKey="billed"
                  stroke="#2563eb"
                  fillOpacity={1}
                  fill="url(#colorBilled)"
                  strokeWidth={2}
                  dot={false}
                />
                <Area
                  type={lineType}
                  dataKey="paid"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#colorPaid)"
                  strokeWidth={2}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full w-full flex items-center justify-center text-muted-foreground text-sm">
              No history available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
