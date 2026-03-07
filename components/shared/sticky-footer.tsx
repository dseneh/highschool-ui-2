"use client";

import type React from "react";
import { cn } from "@/lib/utils";

interface StickyFooterProps {
  children: React.ReactNode;
  className?: string;
  stickyClass?: string;
}

export function StickyFooter({ children, className, stickyClass }: StickyFooterProps) {
  return (
    <div className={cn("sticky bottom-0 z-30", stickyClass)}>
      <div className={cn("rounded-xl border bg-background p-2", className)}>
        {children}
      </div>
    </div>
  );
}
