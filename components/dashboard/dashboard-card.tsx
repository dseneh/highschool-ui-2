"use client";

import { ReactNode } from "react";

interface DashboardCardProps {
  children: ReactNode;
  gradientFrom?: string;
  gradientTo?: string;
  className?: string;
  disableHoverAccent?: boolean;
}

export function DashboardCard({
  children,
  gradientFrom = "from-blue-500/20",
  gradientTo = "to-purple-500/20",
  className = "",
  disableHoverAccent = false,
}: DashboardCardProps) {
  return (
    <div
      className={`group relative flex flex-col rounded-xl border border-border bg-card shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 overflow-hidden ${className}`}
    >
      {!disableHoverAccent && (
        <>
          <div
            className={`absolute -top-10 -left-10 size-24 rounded-full bg-linear-to-br ${gradientFrom} ${gradientTo} opacity-0 blur-2xl group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}
          />
          <div
            className={`absolute top-0 left-0 h-0.5 w-0 bg-linear-to-r ${gradientFrom} ${gradientTo} group-hover:w-24 transition-all duration-300 pointer-events-none`}
          />
        </>
      )}

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
