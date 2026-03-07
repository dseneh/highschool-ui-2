import type { ComponentProps } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "@/lib/utils";

export type SummaryCardItem = {
  title: string;
  value: string;
  subtitle: string;
  icon: ComponentProps<typeof HugeiconsIcon>["icon"];
};

export function SummaryCardGrid({
  items,
  className,
}: {
  items: SummaryCardItem[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6",
        className
      )}
    >
      {items.map((item) => (
        <div
          key={item.title}
          className="relative p-3 rounded-xl border bg-card overflow-hidden"
        >
          <div className="absolute inset-0 bg-linear-to-br from-black/5 to-transparent pointer-events-none" />
          <div className="relative flex items-start justify-between gap-4">
            <div className="flex flex-col gap-3">
              <p className="text-sm font-medium text-muted-foreground">
                {item.title}
              </p>
              <p className="text-2xl sm:text-[26px] font-semibold tracking-tight">
                {item.value}
              </p>
              <p className="text-sm text-muted-foreground">{item.subtitle}</p>
            </div>
            <div className="size-10 rounded-md border bg-background/60 shadow-xs flex items-center justify-center">
              <HugeiconsIcon icon={item.icon} className="size-5" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
