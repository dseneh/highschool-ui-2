"use client";

import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

type ActionSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string | React.ReactNode;
  description?: string | React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
};

export function ActionSheet({
  open,
  onOpenChange,
  title,
  description,
  side = "right",
  children,
  footer,
  className,
}: ActionSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={side}
        className={cn("h-full overflow-hidden w-full! sm:max-w-2xl! space-y-0 gap-0", className)}
      >
        <SheetHeader className="border-b">
          <SheetTitle>{title}</SheetTitle>
          {description ? <SheetDescription>{description}</SheetDescription> : null}
        </SheetHeader>

        <ScrollArea className="min-h-0 flex-1 px-1 sm:px-5 ">
          <div className="space-y-4 pr-3 pt-4">{children}</div>
        </ScrollArea>

        {footer ? <SheetFooter className="border-t">{footer}</SheetFooter> : null}
      </SheetContent>
    </Sheet>
  );
}
