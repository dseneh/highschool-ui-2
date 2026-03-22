"use client"

import * as React from "react"
import { format } from "date-fns"
import { type DateRange } from "react-day-picker"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { HugeiconsIcon } from "@hugeicons/react"
import { Calendar03Icon } from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"

interface DateRangePickerProps {
  value?: DateRange
  onChange: (range: DateRange | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function DateRangePicker({
  value,
  onChange,
  placeholder = "Select date range",
  disabled = false,
  className,
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false)

  const normalizedValue = React.useMemo(() => {
    if (!value?.from && !value?.to) return undefined
    return value
  }, [value])

  const label = React.useMemo(() => {
    if (normalizedValue?.from && normalizedValue?.to) {
      return `${format(normalizedValue.from, "MMM d, yyyy")} - ${format(normalizedValue.to, "MMM d, yyyy")}`
    }
    if (normalizedValue?.from) {
      return `From ${format(normalizedValue.from, "MMM d, yyyy")}`
    }
    if (normalizedValue?.to) {
      return `To ${format(normalizedValue.to, "MMM d, yyyy")}`
    }
    return placeholder
  }, [placeholder, normalizedValue])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-between px-3 font-normal",
            !normalizedValue?.from && !normalizedValue?.to && "text-muted-foreground",
            className
          )}
        >
          <span className="truncate text-left">{label}</span>
          <HugeiconsIcon icon={Calendar03Icon} className="ml-2 size-4 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selected={normalizedValue}
          onSelect={(range) => {
            if (!range?.from && !range?.to) {
              onChange(undefined)
              return
            }
            onChange(range)
          }}
          numberOfMonths={2}
          captionLayout="dropdown"
          defaultMonth={normalizedValue?.from}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  )
}