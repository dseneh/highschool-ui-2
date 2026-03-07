"use client";

import { MoreVertical, TrendingUp } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
} from "recharts";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { StudentDto } from "@/lib/api/student-types";
import { Invoice01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

interface StudentFeesBreakdownChartProps {
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
      <p className="text-xs text-muted-foreground mb-1.5">{label}</p>
      <div className="space-y-1">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="size-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-xs text-muted-foreground">
              {entry.name}:
            </span>
            <span className="text-xs font-semibold text-foreground">
              ${entry.value?.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function StudentFeesBreakdownChart({ student }: StudentFeesBreakdownChartProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const data = (student?.enrollments || [])
    .slice()
    .sort((a, b) => {
      const dateA = a.academic_year?.start_date ? new Date(a.academic_year.start_date).getTime() : 0;
      const dateB = b.academic_year?.start_date ? new Date(b.academic_year.start_date).getTime() : 0;
      return dateA - dateB;
    })
    .map((enrollment) => ({
      year: enrollment.academic_year?.name || "N/A",
      tuition: enrollment.billing_summary?.tuition || 0,
      // Assuming 'Other Fees' = total_bill - tuition.
      other: (enrollment.billing_summary?.total_bill || 0) - (enrollment.billing_summary?.tuition || 0),
    }));

    // Check if empty
    if (data.length === 0 && student?.current_enrollment) {
        const e = student.current_enrollment;
        data.push({
            year: e.academic_year?.name || "Current",
            tuition: e.billing_summary?.tuition || 0,
            other: (e.billing_summary?.total_bill || 0) - (e.billing_summary?.tuition || 0),
        });
    }

  const totalFees = data.reduce((sum, item) => sum + item.tuition + item.other, 0);
  const totalTuition = data.reduce((sum, item) => sum + item.tuition, 0);
  const tuitionPercentage = totalFees > 0 ? Math.round((totalTuition / totalFees) * 100) : 0;

  return (
    <div className="flex-1 rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 text-muted-foreground">
          <HugeiconsIcon icon={Invoice01Icon} className="size-5" />
          <span className="font-medium">Fee Structure</span>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger>
            <span className="inline-flex size-8 items-center justify-center rounded-md hover:bg-muted">
              <MoreVertical className="size-4 text-muted-foreground rotate-90" />
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Download Report</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex flex-col min-[520px]:flex-row min-[520px]:items-end min-[520px]:justify-between lg:flex-col lg:items-stretch xl:flex-row xl:items-end xl:justify-between gap-4">
        <div className="space-y-4 min-[520px]:space-y-6">
          <p className="text-3xl font-semibold tracking-tight">
            ${totalFees.toLocaleString()}
          </p>
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-0.5 text-blue-500">
              <TrendingUp className="size-4" />
              <span className="font-semibold text-sm">{tuitionPercentage}%</span>
            </div>
            <span className="text-sm text-muted-foreground">Tuition Portion</span>
          </div>
        </div>

        <div className="w-full min-[520px]:w-[280px] lg:w-full xl:w-[280px] h-[100px]">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                barSize={12}
                barGap={2}
              >
                <XAxis
                  dataKey="year"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: isDark ? "#9ca3af" : "#6b7280", fontSize: 11 }}
                  interval={0}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "transparent" }} />
                <Bar
                  dataKey="tuition"
                  stackId="a"
                  fill="#3b82f6"
                  radius={[0, 0, 2, 2]}
                />
                <Bar
                  dataKey="other"
                  stackId="a"
                  fill="#f59e0b"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full w-full flex items-center justify-center text-muted-foreground text-sm">
               No fee data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
