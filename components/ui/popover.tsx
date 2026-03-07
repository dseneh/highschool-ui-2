"use client"

import * as React from "react"
import { Popover as PopoverPrimitive } from "@base-ui/react/popover"

import { cn } from "@/lib/utils"

function Popover({ ...props }: PopoverPrimitive.Root.Props) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />
}

function PopoverTrigger({ 
  asChild, 
  children,
  ...props 
}: PopoverPrimitive.Trigger.Props & { asChild?: boolean }) {
  if (asChild) {
    // When asChild is true, use render prop pattern
    return (
      <PopoverPrimitive.Trigger 
        data-slot="popover-trigger" 
        render={(triggerProps) => {
          // Clone the child element and merge props (triggerProps includes ref handling)
          const child = React.Children.only(children) as React.ReactElement;
          return React.cloneElement(child, {
            ...child.props,
            ...triggerProps,
          });
        }}
        {...props}
      />
    );
  }
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props}>{children}</PopoverPrimitive.Trigger>
}

function PopoverContent({
  className,
  sideOffset = 4,
  side = "bottom",
  align = "start",
  ...props
}: PopoverPrimitive.Popup.Props &
  Pick<PopoverPrimitive.Positioner.Props, "side" | "sideOffset" | "align">) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        className="z-50"
      >
        <PopoverPrimitive.Popup
          data-slot="popover-content"
          className={cn(
            "bg-popover text-popover-foreground ring-foreground/10 w-72 rounded-lg p-4 ring-1 shadow-md outline-none origin-(--transform-origin)",
            className
          )}
          {...props}
        />
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  )
}

export { Popover, PopoverTrigger, PopoverContent }
