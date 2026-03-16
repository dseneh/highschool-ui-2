'use client'

import React from 'react'
import {HugeiconsIcon} from '@hugeicons/react';
import {ComposedChart, Bar, Line, XAxis, Tooltip, ResponsiveContainer, TooltipProps} from 'recharts';
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
  const firstValueEntry = payload.find((entry) => typeof entry.value === 'number')

  return (
    <div className="bg-popover border border-border rounded-lg px-3 py-2 shadow-sm">
      {fullName && <p className="text-xs text-muted-foreground mb-1">{fullName}</p>}
      {firstValueEntry && (
        <p className="text-xs font-medium" style={{ color: firstValueEntry.color }}>
          {firstValueEntry.name}: {firstValueEntry.value?.toFixed(1)}%
        </p>
      )}
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
            <ComposedChart data={chartData} margin={{ top: 4, right: 2, left: 2, bottom: 0 }}>
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
                tick={{ fontSize: 10, fill: isDark ? "#9ca3af" : "#868c98" }}
                interval={0}
              />
              <Tooltip content={<GradeTooltip />} cursor={false} />
              <Bar
                dataKey="average"
                name={barName}
                fill={`url(#${gradientId})`}
                radius={[2, 2, 0, 0]}
                maxBarSize={14}
                fillOpacity={0.9}
                activeBar={{
                  fill: `url(#${gradientId})`,
                  fillOpacity: 1,
                  stroke: 'hsl(var(--primary))',
                  strokeWidth: 1.5,
                  cursor: 'pointer',
                }}
              />
              <Line
                type="monotone"
                dataKey="average"
                stroke="#f59e0b"
                strokeWidth={3}
                strokeOpacity={1}
                // strokeDasharray="5 4"
                dot={false}
                activeDot={{ r: 4, fill: '#f59e0b', stroke: isDark ? '#020817' : '#ffffff', strokeWidth: 1.5 }}
                connectNulls
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
