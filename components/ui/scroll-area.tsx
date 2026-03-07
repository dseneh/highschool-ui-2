"use client";

import * as React from "react";
import { ScrollArea as ScrollAreaPrimitive } from "@base-ui/react/scroll-area";

import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  ScrollArea                                                         */
/* ------------------------------------------------------------------ */

interface ScrollAreaProps extends React.ComponentPropsWithoutRef<"div"> {
  /**
   * Controls which scrollbar(s) to show.
   * @default "vertical"
   */
  orientation?: "vertical" | "horizontal" | "both";
}

function ScrollArea({
  className,
  children,
  orientation = "vertical",
  ...props
}: ScrollAreaProps) {
  return (
    <ScrollAreaPrimitive.Root
      data-slot="scroll-area"
      className={cn("relative overflow-hidden", className)}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        data-slot="scroll-area-viewport"
        className={cn(
          "overscroll-contain rounded-[inherit]",
          orientation === "horizontal"
            ? "overflow-x-auto overflow-y-hidden"
            : orientation === "both"
              ? "overflow-auto"
              : "overflow-y-auto overflow-x-hidden",
          /* fill parent height/width */
          "h-full w-full",
          /* hide native scrollbar */
          "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        )}
      >
        <ScrollAreaPrimitive.Content data-slot="scroll-area-content" className="h-full w-full">
          {children}
        </ScrollAreaPrimitive.Content>
      </ScrollAreaPrimitive.Viewport>

      {(orientation === "vertical" || orientation === "both") && (
        <ScrollBar orientation="vertical" />
      )}
      {(orientation === "horizontal" || orientation === "both") && (
        <ScrollBar orientation="horizontal" />
      )}
      {orientation === "both" && <ScrollAreaPrimitive.Corner />}
    </ScrollAreaPrimitive.Root>
  );
}

/* ------------------------------------------------------------------ */
/*  ScrollBar                                                          */
/* ------------------------------------------------------------------ */

function ScrollBar({
  className,
  orientation = "vertical",
}: {
  className?: string;
  orientation?: "vertical" | "horizontal";
}) {
  return (
    <ScrollAreaPrimitive.Scrollbar
      data-slot="scroll-bar"
      orientation={orientation}
      className={cn(
        "flex touch-none select-none transition-opacity duration-150",
        orientation === "vertical" &&
          "absolute top-0 right-0 bottom-0 w-2 p-px",
        orientation === "horizontal" &&
          "absolute right-0 bottom-0 left-0 h-2 flex-col p-px",
        className
      )}
    >
      <ScrollAreaPrimitive.Thumb
        data-slot="scroll-bar-thumb"
        className={cn(
          "relative flex-1 rounded-full bg-border transition-colors hover:bg-muted-foreground/40",
          orientation === "vertical" && "min-h-8 w-full",
          orientation === "horizontal" && "h-full min-w-8"
        )}
      />
    </ScrollAreaPrimitive.Scrollbar>
  );
}

export { ScrollArea, ScrollBar };
