"use client";

import type { LucideIcon } from "lucide-react";
import { DashboardCard } from "./dashboard-card";

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  bgColor: string;
  iconColor: string;
  gradientFrom?: string;
  gradientTo?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  bgColor,
  iconColor,
  gradientFrom,
  gradientTo,
}: StatCardProps) {
  return (
    <DashboardCard gradientFrom={gradientFrom} gradientTo={gradientTo} className="p-4">
      <div className="flex items-center gap-3">
        <div className={`size-10 shrink-0 rounded-lg ${bgColor} flex items-center justify-center`}>
          <Icon className={`size-5 ${iconColor}`} />
        </div>
        <p className="text-2xl font-bold text-foreground leading-none">{value}</p>
      </div>
      <div className="mt-2.5 space-y-0.5">
        <p className="text-xs font-medium text-muted-foreground">{title}</p>
        {subtitle && <p className="text-xs text-muted-foreground/70">{subtitle}</p>}
      </div>
    </DashboardCard>
  );
}
