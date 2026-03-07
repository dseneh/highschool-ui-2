"use client";

import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { HugeiconsIcon } from "@hugeicons/react";
import { File01Icon } from "@hugeicons/core-free-icons";

export type StatsCardItem = {
  title: string;
  value: string;
  subtitle: string;
  icon: ComponentProps<typeof HugeiconsIcon>["icon"];
  subtitleIcon?: ComponentProps<typeof HugeiconsIcon>["icon"];
};

export function StatsCards({ items }: { items: StatsCardItem[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {items.map((stat) => (
        <Card
          key={stat.title}
          className="relative p-5"
        >
          <div className="absolute inset-0 bg-linear-to-br from-black/5 to-transparent pointer-events-none" />
          <div className="relative flex items-start justify-between">
            <div className="flex flex-col gap-6">
              <p className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </p>
              <p className="text-2xl sm:text-[26px] font-semibold tracking-tight">
                {stat.value}
              </p>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <HugeiconsIcon
                  icon={stat.subtitleIcon ?? File01Icon}
                  className="size-4"
                />
                <span className="text-sm font-medium">{stat.subtitle}</span>
              </div>
            </div>
            <Button variant="outline" size="icon-lg" icon={<HugeiconsIcon icon={stat.icon} />} />
          </div>
        </Card>
      ))}
    </div>
  );
}
