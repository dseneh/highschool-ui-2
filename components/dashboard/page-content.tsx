"use client";

import { cn } from "@/lib/utils";
import { useDashboardStore } from "@/store/dashboard-store";

export function PageContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const layoutDensity = useDashboardStore((state) => state.layoutDensity);

  return (
    <main
      className={cn(
        "w-full flex-1 min-h-0 overflow-auto px-1 sm:px-4 lg:px-6",
        layoutDensity === "compact" && "p-2 sm:p-4 space-y-4",
        layoutDensity === "default" && "p-4 sm:p-4 space-y-4 sm:space-y-6",
        layoutDensity === "comfortable" && "p-6 sm:p-8 space-y-8 sm:space-y-10",
        className
      )}
    >
      {children}
    </main>
  );
}
