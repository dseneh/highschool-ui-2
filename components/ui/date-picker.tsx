"use client"

import * as React from "react"
import { isValid, addDays, addMonths } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { HugeiconsIcon } from "@hugeicons/react"
import { Calendar03Icon } from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import moment from "moment"

interface DatePickerProps {
  value?: Date
  onChange: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  /** Date format string for display & typing. Defaults to "MM/dd/yyyy". */
  dateFormat?: string
  presets?: Array<{ label: string; value: Date }>
  yearRange?: { from: number; to: number }
  allowPastDates?: boolean
  allowFutureDates?: boolean
  /** Custom validation function. Return true if date is valid, false otherwise. */
  validate?: (date: Date) => boolean
}

/**
 * Applies a date mask (MM/DD/YYYY) to raw digit input.
 * Keeps only digits and inserts `/` at positions 2 and 5.
 */
function applyDateMask(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8)
  let masked = ""
  for (let i = 0; i < digits.length; i++) {
    if (i === 2 || i === 4) masked += "/"
    masked += digits[i]
  }
  return masked
}

function DatePicker({
  value,
  onChange,
  placeholder = "MM/DD/YYYY",
  disabled = false,
  className,
  dateFormat = "MM/DD/YYYY",
  presets,
  yearRange,
  allowPastDates = true,
  allowFutureDates = true,
  validate,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState("")
  const [isTyping, setIsTyping] = React.useState(false)
  const [calendarMonth, setCalendarMonth] = React.useState<Date>(
    value ?? new Date()
  )
  
  const formatDate = (date: Date | undefined) => {
    if (!date) return ""
    return moment(date).format("MM/DD/YYYY")
  }

  const presetsToUse = React.useMemo(() => {
    if (presets && presets.length > 0) return presets
    const today = new Date()
    const passedPresets = [
      { label: "1 week ago", value: addDays(today, -7) },
      { label: "Yesterday", value: addDays(today, -1) },
    ]
    const futurePresets = [
      { label: "Tomorrow", value: addDays(today, 1) },
      { label: "In 1 week", value: addDays(today, 7) },
      { label: "In 1 month", value: addMonths(today, 1) },
      { label: "In 3 months", value: addMonths(today, 3) },
    ]
    const pre = [{ label: "Today", value: today }]
    if (allowPastDates) {
      pre.push(...passedPresets)
    }
    if (allowFutureDates) {
      pre.push(...futurePresets)
    }

    return pre.filter((preset) => !validate || validate(preset.value))
  }, [presets, allowPastDates, allowFutureDates, validate])

  const isDateDisabled = React.useCallback(
    (date: Date) => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const dateToCheck = new Date(date)
      dateToCheck.setHours(0, 0, 0, 0)

      // Check past/future constraints
      if (!allowPastDates && dateToCheck < today) return true
      if (!allowFutureDates && dateToCheck > today) return true

      // Check custom validation
      if (validate && !validate(date)) return true

      return false
    },
    [allowPastDates, allowFutureDates, validate]
  )

  // Sync input value from prop when not actively typing
  React.useEffect(() => {
    if (!isTyping) {
      setInputValue(value ? formatDate(value) : "")
    }
  }, [value, dateFormat, isTyping])

  // Ensure calendar month follows selected date when it changes
  React.useEffect(() => {
    if (value) {
      setCalendarMonth(value)
    }
  }, [value])

  React.useEffect(() => {
    if (open && value) {
      setCalendarMonth(value)
    }
  }, [open, value])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = applyDateMask(e.target.value)
    setInputValue(masked)

    // Try to parse when we have a full date (10 chars: MM/DD/YYYY)
    if (masked.length === 10) {
      const parsed = moment(masked, dateFormat, true).toDate()
      if (isValid(parsed) && !isDateDisabled(parsed)) {
        onChange(parsed)
      }
    }
  }

  const handleInputFocus = () => {
    setIsTyping(true)
  }

  const handleInputBlur = () => {
    setIsTyping(false)
    // On blur, if the typed value doesn't parse to a valid date, reset to current value
    if (inputValue.length > 0 && inputValue.length < 10) {
      setInputValue(value ? formatDate(value) : "")
    } else if (inputValue.length === 10) {
      const parsed = moment(inputValue, dateFormat, true).toDate()
      if (!isValid(parsed)) {
        setInputValue(value ? formatDate(value) : "")
      }
    }
  }

  const handleCalendarSelect = (date: Date | undefined) => {
    if (date && !isDateDisabled(date)) {
      onChange(date)
      setOpen(false)
    }
  }

  const handlePresetSelect = (date: Date) => {
    if (!isDateDisabled(date)) {
      onChange(date)
      setOpen(false)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className={cn("relative flex items-center", className)}>
        <Input
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          disabled={disabled}
          className="pr-10"
        />
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            disabled={disabled}
            className="absolute right-1 text-muted-foreground hover:text-foreground"
            type="button"
          >
            <HugeiconsIcon icon={Calendar03Icon} className="size-4" />
          </Button>
        </PopoverTrigger>
      </div>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex flex-col gap-3 p-3 sm:flex-row">
          <div className="flex flex-wrap gap-2 sm:w-40 sm:flex-col sm:gap-1">
            {presetsToUse.map((preset) => (
              <Button
                key={preset.label}
                type="button"
                variant="ghost"
                size="sm"
                className="justify-start"
                onClick={() => handlePresetSelect(preset.value)}
              >
                {preset.label}
              </Button>
            ))}
          </div>
          <div className="rounded-md border">
            <Calendar
              mode="single"
              selected={value}
              onSelect={handleCalendarSelect}
              month={calendarMonth}
              onMonthChange={setCalendarMonth}
              captionLayout="dropdown"
              fromYear={yearRange?.from ?? 1900}
              toYear={yearRange?.to ?? new Date().getFullYear() + 10}
              disabled={isDateDisabled}
              autoFocus
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export { DatePicker }
