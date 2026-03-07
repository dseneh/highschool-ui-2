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
import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from "recharts";
import type { GradeLevelDistribution } from "@/lib/api2/dashboard";

import { DashboardCard } from "./dashboard-card";
const chartColors = ["#35b9e9", "#6e3ff3", "#375dfb", "#e255f2", "#10b981", "#f59e0b", "#ef4444"];

interface EnrollmentChartProps {
  data?: GradeLevelDistribution[];
}

export function EnrollmentChart({ data = [] }: EnrollmentChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [showLabels, setShowLabels] = useState(true);

  const chartData = data.map((item, index) => ({
    name: item.grade_level,
    value: item.count,
    color: chartColors[index % chartColors.length],
  }));

  const totalEnrolled = chartData.reduce((acc, item) => acc + item.value, 0);

  const onPieEnter = (_: unknown, index: number) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(null);
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
              <DropdownMenuCheckboxItem checked={showLabels} onCheckedChange={setShowLabels}>
                Show labels
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

      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
        <div className="relative shrink-0 size-55">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius="42%"
                  outerRadius="70%"
                  paddingAngle={2}
                  dataKey="value"
                  strokeWidth={0}
                  activeIndex={activeIndex !== null ? activeIndex : undefined}
                  activeShape={renderActiveShape}
                  onMouseEnter={onPieEnter}
                  onMouseLeave={onPieLeave}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="size-full rounded-full border border-dashed flex items-center justify-center text-xs text-muted-foreground">
              No enrollment data
            </div>
          )}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-lg sm:text-xl font-semibold">{totalEnrolled.toLocaleString()}</span>
            <span className="text-[10px] sm:text-xs text-muted-foreground">Students</span>
          </div>
        </div>

        {showLabels && (
          <div className="flex-1 w-full grid grid-cols-2 sm:grid-cols-1 gap-2 sm:gap-4">
            {chartData.map((item, index) => (
              <div
                key={item.name}
                className={`flex items-center gap-2 sm:gap-2.5 cursor-pointer transition-opacity ${activeIndex !== null && activeIndex !== index ? "opacity-50" : ""}`}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                <div className="w-1 h-4 sm:h-5 rounded-sm shrink-0" style={{ backgroundColor: item.color }} />
                <span className="flex-1 text-xs sm:text-sm text-muted-foreground truncate">{item.name}</span>
                <span className="text-xs sm:text-sm font-semibold tabular-nums">{item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <BarChart3 className="size-3" />
        <span>Current academic year</span>
      </div>
    </DashboardCard>
  );
}
