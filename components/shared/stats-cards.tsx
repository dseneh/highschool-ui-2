"use client";

import type { ComponentProps, ComponentType, ReactNode } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type HugeIconType = ComponentProps<typeof HugeiconsIcon>["icon"];
type IconLike = HugeIconType | ComponentType<{ className?: string }>;

export type StatsCardItem = {
  title: string;
  value: string | ReactNode;
  subtitle: string | ReactNode;
  icon: IconLike;
  subtitleIcon?: IconLike;
};

interface StatsCardsProps {
  items: StatsCardItem[];
  className?: string;
}

function renderIcon(icon: IconLike, className: string) {
  if (Array.isArray(icon)) {
    return <HugeiconsIcon icon={icon} className={className} />;
  }

  const Icon = icon as ComponentType<{ className?: string }>;
  return <Icon className={className} />;
}

export function StatsCards({ items, className }: StatsCardsProps) {
  return (
    <div className={cn("mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4", className)}>
      {items.map((item, index) => (
        <Card
          key={item.title}
          style={{
            animationDelay: `${index * 80}ms`,
            animationFillMode: "both",
          }}
          className="group relative overflow-hidden border-border/80 bg-linear-to-br from-background via-card to-primary/5 px-4 py-3 shadow-sm transition-colors duration-200 hover:border-primary/35 hover:from-primary/5 hover:via-primary/10 hover:to-primary/15 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-500"
        >
          <div className="pointer-events-none absolute inset-0 bg-linear-to-tr from-transparent via-transparent to-primary/6 opacity-80 transition-opacity duration-200 group-hover:opacity-100" />
          <div className="relative flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-1">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/90 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-primary/80">
                {item.title}
              </div>
              <div className="text-2xl font-semibold tracking-tight text-foreground transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-primary sm:text-[28px]">
                {item.value}
              </div>
            </div>

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/15 bg-primary/10 text-primary shadow-xs transition-all duration-200 group-hover:scale-105 group-hover:border-primary/30 group-hover:bg-primary/15">
              {renderIcon(item.icon, "h-5 w-5")}
            </div>
          </div>

          <div className="relative fmt-3 flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-primary/80">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background/80 px-2.5 py-1 backdrop-blur-sm transition-all duration-200 group-hover:border-primary/20 group-hover:bg-primary/5">
              {item.subtitleIcon ? (
                renderIcon(
                  item.subtitleIcon,
                  "h-3.5 w-3.5 text-primary transition-transform duration-200 group-hover:scale-110"
                )
              ) : null}
              <span className="truncate">{item.subtitle}</span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}