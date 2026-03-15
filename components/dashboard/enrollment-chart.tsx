"use client";

import { useState } from "react";
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
} from "@/components/ui/dropdown-menu";
import { BarChart3, MoreHorizontal, Download } from "lucide-react";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  PieChart,
  Pie,
  Sector,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  ReferenceLine,
  type TooltipProps,
} from "recharts";
import type { GradeLevelDistribution } from "@/lib/api2/dashboard";

import { DashboardCard } from "./dashboard-card";
const chartColors = ["#35b9e9", "#6e3ff3", "#375dfb", "#e255f2", "#10b981", "#f59e0b", "#ef4444"];

interface EnrollmentChartProps {
  data?: GradeLevelDistribution[];
}

export function EnrollmentChart({ data = [] }: EnrollmentChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [chartView, setChartView] = useState<"bar-line" | "donut">("bar-line");

  const toShortGradeName = (gradeLevel: string) => {
    if (!gradeLevel) return "-";
    const normalized = gradeLevel.trim();
    const lower = normalized.toLowerCase();
    if (lower === "kindergarten") return "K";

    const gradeMatch = normalized.match(/(\d{1,2})/);
    if (gradeMatch) {
      return `G${gradeMatch[1]}`;
    }

    return normalized.length <= 4 ? normalized : normalized.slice(0, 4).toUpperCase();
  };

  const chartData = [...data]
    .sort((a, b) => (a.level ?? 0) - (b.level ?? 0))
    .map((item, index) => ({
      name: toShortGradeName(item.short_name || item.grade_level),
      fullName: item.grade_level,
      students: item.count,
      percentage: Number(item.percentage || 0),
      color: chartColors[index % chartColors.length],
    }));

  const totalEnrolled = chartData.reduce((acc, item) => acc + item.students, 0);
  const avgPerGrade = chartData.length > 0 ? Math.round(totalEnrolled / chartData.length) : 0;

  const onBarEnter = (_: unknown, index: number) => setActiveIndex(index);
  const onBarLeave = () => setActiveIndex(null);

  const renderTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (!active || !payload?.length) return null;
    const item = chartData.find((row) => row.name === label);
    const count = payload[0]?.value ?? 0;
    return (
      <div className="bg-popover border border-border rounded-lg p-3 shadow-lg min-w-35">
        <p className="text-sm font-medium text-foreground mb-2">{item?.fullName ?? String(label)}</p>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="size-2 rounded-full" style={{ backgroundColor: item?.color }} />
            <span className="text-xs text-muted-foreground">Students</span>
          </div>
          <span className="text-sm font-semibold text-foreground">{Number(count).toLocaleString()}</span>
        </div>
      </div>
    );
  };

  const renderActiveShape = (props: unknown) => {
    const typedProps = props as {
      cx: number;
      cy: number;
      innerRadius: number;
      outerRadius: number;
      startAngle: number;
      endAngle: number;
      fill: string;
    };
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = typedProps;
    return (
      <g>
        <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 8} startAngle={startAngle} endAngle={endAngle} fill={fill} />
      </g>
    );
  };

  return (
    <DashboardCard
      gradientFrom="from-amber-400/20 dark:from-amber-300/10"
      gradientTo="to-orange-500/20 dark:to-orange-400/10"
      disableHoverAccent
      className="flex flex-col gap-4 p-6 w-full"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-2.5">
          <Button variant="outline" size="icon" className="size-7 sm:size-8">
            <BarChart3 className="size-4 sm:size-4.5 text-muted-foreground" />
          </Button>
          <span className="text-sm sm:text-base font-medium">Enrollment by Grade</span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-7 sm:size-8">
              <MoreHorizontal className="size-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-45">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Display Options</DropdownMenuLabel>
              <DropdownMenuCheckboxItem
                checked={chartView === "bar-line"}
                onCheckedChange={() => setChartView("bar-line")}
              >
                Bar + Line View
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={chartView === "donut"}
                onCheckedChange={() => setChartView("donut")}
              >
                Donut View
              </DropdownMenuCheckboxItem>
              </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Download className="size-4 mr-2" />
              Export as PNG
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="space-y-4">
        {/* <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div className="rounded-lg border border-border/50 bg-muted/30 p-3">
            <p className="text-xs text-muted-foreground">Total Students</p>
            <p className="text-xl font-semibold">{totalEnrolled.toLocaleString()}</p>
          </div>
          <div className="rounded-lg border border-border/50 bg-muted/30 p-3">
            <p className="text-xs text-muted-foreground">Average per Grade</p>
            <p className="text-xl font-semibold">{avgPerGrade.toLocaleString()}</p>
          </div>
        </div> */}

        <div className="h-72 sm:h-80 w-full">
          {chartData.length > 0 ? chartView === "bar-line" ? (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 16, right: 20, left: 0, bottom: 8 }}>
                {/* <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.35} /> */}
                <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis yAxisId="left" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip content={renderTooltip} />
                <ReferenceLine yAxisId="left" y={avgPerGrade} stroke="#94a3b8" strokeDasharray="4 4" />
                <Bar yAxisId="left" dataKey="students" radius={[6, 6, 0, 0]} onMouseEnter={onBarEnter} onMouseLeave={onBarLeave}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      opacity={activeIndex === null || activeIndex === index ? 1 : 0.35}
                    />
                  ))}
                </Bar>
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="students"
                  stroke="#111827"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 5 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius="42%"
                  outerRadius="72%"
                  paddingAngle={2}
                  dataKey="students"
                  strokeWidth={0}
                  activeIndex={activeIndex !== null ? activeIndex : undefined}
                  activeShape={renderActiveShape}
                  onMouseEnter={onBarEnter}
                  onMouseLeave={onBarLeave}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-donut-${index}`} fill={entry.color} opacity={activeIndex === null || activeIndex === index ? 1 : 0.35} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full w-full rounded-xl border border-dashed flex items-center justify-center text-xs text-muted-foreground">
              No enrollment data
            </div>
          )}
        </div>


      </div>

      {/* <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <BarChart3 className="size-3" />
        <span>Current academic year</span>
      </div> */}
    </DashboardCard>
  );
}
