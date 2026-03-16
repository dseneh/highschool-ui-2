'use client'

import React from 'react'
import {HugeiconsIcon} from '@hugeicons/react';
import {BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, TooltipProps} from 'recharts';
import {cn, getGradeTextColorClass} from '@/lib/utils';

type StatCardProps = {
  title: string;
  value: number | null;
  subtitle: string;
  chartData: { subject: string; average: number | null; fullName?: string }[];
  icon: readonly (readonly [string, { readonly [key: string]: string | number }])[];
  isDark: boolean;
  gradientId: string;
  gradientStart: string;
  gradientEnd: string;
  gradientEndOpacity?: number;
  barName?: string;
}

function GradeTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null
  const fullName = (payload[0]?.payload as { fullName?: string })?.fullName
  return (
    <div className="bg-popover border border-border rounded-lg px-3 py-2 shadow-sm">
      {fullName && <p className="text-xs text-muted-foreground mb-1">{fullName}</p>}
      {payload.map((entry, index) => (
        <p key={index} className="text-xs font-medium" style={{ color: entry.color }}>
          {entry.name}: {entry.value?.toFixed(1)}%
        </p>
      ))}
    </div>
  )
}

export default function StatCard({ 
  title, 
  value, 
  subtitle, 
  chartData, 
  icon, 
  isDark,
  gradientId,
  gradientStart,
  gradientEnd,
  gradientEndOpacity = 0.5,
  barName = 'Score'
}: StatCardProps) {
  return (
    <div className="flex-1 rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 text-muted-foreground">
        <HugeiconsIcon icon={icon} className="size-5" />
        <span className="font-medium text-sm">{title}</span>
      </div>

      <div className="flex flex-col min-[520px]:flex-row min-[520px]:items-end min-[520px]:justify-between lg:flex-col lg:items-stretch xl:flex-row xl:items-end xl:justify-between gap-4">
        <div className="space-y-2 min-[520px]:space-y-3">
          <p className={cn("text-3xl font-semibold tracking-tight", getGradeTextColorClass(value))}>
            {value != null ? `${value.toFixed(1)}%` : "-"}
          </p>
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-muted-foreground">
              {subtitle}
            </span>
          </div>
        </div>

        <div className="w-full min-[520px]:w-70 lg:w-full xl:w-70 h-20">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={gradientStart} />
                  <stop offset="100%" stopColor={gradientEnd} stopOpacity={gradientEndOpacity} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="subject"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: isDark ? "#9ca3af" : "#868c98" }}
                interval={0}
              />
              <Tooltip content={<GradeTooltip />} cursor={false} />
              <Bar
                dataKey="average"
                name={barName}
                fill={`url(#${gradientId})`}
                radius={[2, 2, 0, 0]}
                maxBarSize={14}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
