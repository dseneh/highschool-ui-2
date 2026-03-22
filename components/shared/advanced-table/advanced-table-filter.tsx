"use client"

import * as React from "react"
import { Column } from "@tanstack/react-table"
import { ChevronDown, Plus } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import {
  FilterType,
  FilterOption,
  ConditionFilter,
  DateRangeFilter,
  FilterValue,
  NumberCondition,
} from "./types"
import { SelectField } from "@/components/ui/select-field"
import { RangeFilter } from "./range-filter"
import { Separator } from "@/components/ui/separator"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { format } from "date-fns"

const focusRing = "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"

interface AdvancedTableFilterProps<TData, TValue> {
  column: Column<TData, TValue> | undefined
  title?: string
  filterType?: FilterType
  options?: FilterOption[]
  conditions?: NumberCondition[]
  formatter?: (value: any) => string
  summaryMode?: "labels" | "count" | "dot"
  disabled?: boolean
}

const ColumnFiltersLabel = ({
  columnFilterLabels,
  className,
}: {
  columnFilterLabels: string[] | undefined
  className?: string
}) => {
  if (!columnFilterLabels) return null

  if (columnFilterLabels.length < 3) {
    return (
      <span className={cn("truncate", className)}>
        {columnFilterLabels.map((value, index) => (
          <span
            key={value}
            className={cn("font-semibold text-primary")}
          >
            {value}
            {index < columnFilterLabels.length - 1 && ", "}
          </span>
        ))}
      </span>
    )
  }

  return (
    <>
      <span
        className={cn(
          "font-semibold text-primary",
          className,
        )}
      >
        {columnFilterLabels[0]} and {columnFilterLabels.length - 1} more
      </span>
    </>
  )
}

function areFilterValuesEqual(a: FilterValue | undefined, b: FilterValue | undefined): boolean {
  if (Object.is(a, b)) return true

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false
    return a.every((value, index) => Object.is(value, b[index]))
  }

  if (
    a &&
    b &&
    typeof a === "object" &&
    typeof b === "object" &&
    !Array.isArray(a) &&
    !Array.isArray(b)
  ) {
    const aWithCondition = a as ConditionFilter
    const bWithCondition = b as ConditionFilter
    if ("condition" in aWithCondition || "condition" in bWithCondition) {
      const aValue = aWithCondition.value ?? ["", ""]
      const bValue = bWithCondition.value ?? ["", ""]
      return (
        (aWithCondition.condition ?? "") === (bWithCondition.condition ?? "") &&
        (aValue[0] ?? "") === (bValue[0] ?? "") &&
        (aValue[1] ?? "") === (bValue[1] ?? "")
      )
    }

    const aDate = a as DateRangeFilter
    const bDate = b as DateRangeFilter
    if ("value" in aDate || "value" in bDate) {
      const aValue = aDate.value ?? ["", ""]
      const bValue = bDate.value ?? ["", ""]
      return (aValue[0] ?? "") === (bValue[0] ?? "") && (aValue[1] ?? "") === (bValue[1] ?? "")
    }
  }

  return false
}

export function AdvancedTableFilter<TData, TValue>({
  column,
  title,
  filterType = "select",
  options,
  conditions,
  formatter = (value) => value.toString(),
  summaryMode = "labels",
  disabled = false,
}: AdvancedTableFilterProps<TData, TValue>) {
  const columnFilters = column?.getFilterValue() as FilterValue
  const [selectedValues, setSelectedValues] = React.useState<FilterValue | any>(columnFilters)

  const activeFilterCount = React.useMemo(() => {
    if (!selectedValues) return 0
    if (Array.isArray(selectedValues)) return selectedValues.length
    if (typeof selectedValues === "string") return selectedValues !== "" ? 1 : 0
    if (typeof selectedValues === "object" && "value" in selectedValues && !("condition" in selectedValues)) {
      return selectedValues.value?.some((value: string) => Boolean(value)) ? 1 : 0
    }
    if (typeof selectedValues === "object" && "condition" in selectedValues) {
      return selectedValues.condition ? 1 : 0
    }
    return 0
  }, [selectedValues])

  const columnFilterLabels = React.useMemo(() => {
    if (!selectedValues) return undefined

    if (Array.isArray(selectedValues)) {
      return selectedValues.map((value) => formatter(value))
    }

    if (typeof selectedValues === "string") {
      return [formatter(selectedValues)]
    }

    if (typeof selectedValues === "object" && "value" in selectedValues && !("condition" in selectedValues)) {
      const from = selectedValues.value?.[0]
      const to = selectedValues.value?.[1]
      if (!from && !to) return undefined
      if (from && to) return [`${formatter(from)} to ${formatter(to)}`]
      if (from) return [`From ${formatter(from)}`]
      return [`To ${formatter(to)}`]
    }

    if (typeof selectedValues === "object" && "condition" in selectedValues) {
      const conditionLabel = conditions?.find(
        (c) => c.value === selectedValues.condition
      )?.selectedLabel ?? conditions?.find((c) => c.value === selectedValues.condition)?.label
      if (!conditionLabel) return undefined
      if (!selectedValues.value?.[0] && !selectedValues.value?.[1])
        return [`${conditionLabel}`]
      if (!selectedValues.value?.[1])
        return [`${conditionLabel} ${formatter(selectedValues.value?.[0])}`]
      return [
        `${conditionLabel} ${formatter(selectedValues.value?.[0])} and ${formatter(
          selectedValues.value?.[1]
        )}`,
      ]
    }

    return undefined
  }, [selectedValues, conditions, formatter])

  const renderFilter = () => {
    switch (filterType) {
      case "select":
        return (
          <SelectField
            value={selectedValues as string}
            onValueChange={(value: any) => setSelectedValues(value!)}
            placeholder="Select..."
            disabled={disabled}
            items={(options ?? []).map((option) => ({
              value: option.value,
              label: option.label,
            }))}
          />
        )

      case "checkbox":
        return (
          <div className="space-y-2 pt-2 max-h-64 overflow-y-auto">
            {options?.map((option) => (
              <div key={option.value} className="hover:text-primary cursor-pointer">
              <div key={option.value} className="flex items-center gap-2">
                <Checkbox
                  id={option.value}
                  checked={(selectedValues as string[])?.includes(option.value) ?? false}
                  disabled={disabled}
                  onCheckedChange={(checked) => {
                    setSelectedValues((prev: any) => {
                      const current = (prev as string[]) ?? []
                      if (checked) {
                        return [...current, option.value]
                      }
                      return current.filter((v) => v !== option.value)
                    })
                  }}
                />
                <Label htmlFor={option.value} className="text-sm font-normal cursor-pointer">
                  {option.label}
                </Label>
              </div>
                {option.label.includes("All") && (
                  <Separator className="my-1" />
                )}
              </div>
            ))}
          </div>
        )

      case "radio":
        return (
          <div className="space-y-2 pt-2 max-h-64 overflow-y-auto">
            {options?.map((option) => (
              <div key={option.value} className="hover:text-primary cursor-pointer">
              <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name={`radio-filter-${column?.id ?? title ?? "filter"}`}
                  value={option.value}
                  checked={(selectedValues as string) === option.value}
                  disabled={disabled}
                  onChange={() => setSelectedValues(option.value)}
                  className="size-4 border-input text-primary"
                />
                <span className="text-sm font-normal">{option.label}</span>
              </label>
                {option.label.includes("All") && (
                  <Separator className="my-1" />
                )}
              </div>
            ))}
          </div>
        )

      case "number":
        const selectedCondition = (selectedValues as ConditionFilter)?.condition ?? ""
        const isBetween = selectedCondition === "is-between" || selectedCondition === "pct-is-between"
        const hasCondition = Boolean((selectedValues as ConditionFilter)?.condition)
        return (
          <div className="space-y-3 pt-2">
            {/* <Select
              value={(selectedValues as ConditionFilter)?.condition ?? ""}
              disabled={disabled}
              onValueChange={(value) => {
                setSelectedValues({
                  condition: value ?? "",
                  value: ["", ""],
                })
              }}
            >
              <SelectTrigger className="h-8">
                {selectedConditionLabel ? (
                  <span className="text-sm">{selectedConditionLabel}</span>
                ) : (
                  <span className="text-sm text-muted-foreground">Select condition...</span>
                )}
              </SelectTrigger>
              <SelectContent>
                {conditions?.map((condition) => (
                  <SelectItem key={condition.value} value={condition.value}>
                    {condition.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select> */}
            <SelectField
              value={(selectedValues as ConditionFilter)?.condition ?? ""}
              items={conditions ?? []}
              className="w-full"
              disabled={disabled}
              onValueChange={(value) => {
                setSelectedValues({
                  condition: value ?? "",
                  value: ["", ""],
                })
              }}
            />

            <RangeFilter
              minValue={(selectedValues as ConditionFilter)?.value?.[0] ?? ""}
              maxValue={(selectedValues as ConditionFilter)?.value?.[1] ?? ""}
              onMinChange={(minValue) => {
                setSelectedValues((prev: any) => ({
                  condition: (prev as ConditionFilter)?.condition,
                  value: [minValue, (prev as ConditionFilter)?.value?.[1] ?? ""],
                }))
              }}
              onMaxChange={(maxValue) => {
                setSelectedValues((prev: any) => ({
                  condition: (prev as ConditionFilter)?.condition,
                  value: [(prev as ConditionFilter)?.value?.[0] ?? "", maxValue],
                }))
              }}
              minPlaceholder="Min value"
              maxPlaceholder="Max value"
              showMax={isBetween}
              disabled={disabled || !hasCondition}
            />
          </div>
        )

      case "daterange":
        return (
          <div className="pt-2">
            <DateRangePicker
              value={{
                from: (selectedValues as DateRangeFilter | undefined)?.value?.[0]
                  ? new Date((selectedValues as DateRangeFilter).value[0])
                  : undefined,
                to: (selectedValues as DateRangeFilter | undefined)?.value?.[1]
                  ? new Date((selectedValues as DateRangeFilter).value[1])
                  : undefined,
              }}
              onChange={(range) => {
                setSelectedValues({
                  value: [
                    range?.from ? format(range.from, "yyyy-MM-dd") : "",
                    range?.to ? format(range.to, "yyyy-MM-dd") : "",
                  ],
                })
              }}
              placeholder="Select date range"
              disabled={disabled}
              className="h-8"
            />
          </div>
        )

      default:
        return null
    }
  }

  const handleReset = () => {
    column?.setFilterValue("")
    setSelectedValues(
      filterType === "checkbox"
        ? []
        : filterType === "number"
          ? { condition: "", value: ["", ""] }
          : filterType === "daterange"
            ? { value: ["", ""] }
          : ""
    )
  }

  React.useEffect(() => {
    setSelectedValues((previousValues: FilterValue | undefined) => {
      if (areFilterValuesEqual(previousValues, columnFilters)) {
        return previousValues
      }
      return columnFilters
    })
  }, [columnFilters])

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "flex w-full items-center gap-x-1.5 whitespace-nowrap rounded-md border px-2 py-1.5 font-medium hover:bg-accent sm:w-fit sm:text-xs",
            selectedValues &&
              ((typeof selectedValues === "object" &&
                "value" in selectedValues &&
                !("condition" in selectedValues) &&
                Boolean(selectedValues.value?.[0] || selectedValues.value?.[1])) ||
                (typeof selectedValues === "object" &&
                "condition" in selectedValues &&
                selectedValues.condition !== "") ||
                (typeof selectedValues === "string" && selectedValues !== "") ||
                (Array.isArray(selectedValues) && selectedValues.length > 0))
              ? "border-input"
              : "border-dashed border-input",
            disabled && "cursor-not-allowed opacity-60 hover:bg-transparent",
            focusRing,
          )}
        >
          <span
            aria-hidden="true"
            onClick={(e) => {
              if (selectedValues && 
                ((typeof selectedValues === "object" && "value" in selectedValues && !("condition" in selectedValues) && Boolean(selectedValues.value?.[0] || selectedValues.value?.[1])) ||
                (typeof selectedValues === "object" && "condition" in selectedValues && selectedValues.condition !== "") ||
                (typeof selectedValues === "string" && selectedValues !== "") ||
                (Array.isArray(selectedValues) && selectedValues.length > 0))) {
                e.stopPropagation()
                column?.setFilterValue("")
                setSelectedValues(
                  filterType === "checkbox"
                    ? []
                    : filterType === "number"
                      ? { condition: "", value: ["", ""] }
                      : filterType === "daterange"
                        ? { value: ["", ""] }
                      : ""
                )
              }
            }}
          >
            <Plus
              className={cn(
                "-ml-px size-5 shrink-0 transition sm:size-4",
                selectedValues && 
                  ((typeof selectedValues === "object" && "value" in selectedValues && !("condition" in selectedValues) && Boolean(selectedValues.value?.[0] || selectedValues.value?.[1])) ||
                  ((typeof selectedValues === "object" && "condition" in selectedValues && selectedValues.condition !== "") ||
                  (typeof selectedValues === "string" && selectedValues !== "") ||
                  (Array.isArray(selectedValues) && selectedValues.length > 0))) && 
                  "rotate-45 hover:text-destructive",
              )}
              aria-hidden="true"
            />
          </span>
          {activeFilterCount > 0 ? (
            <span>{title}</span>
          ) : (
            <span className="w-full text-left sm:w-fit">{title}</span>
          )}
          {activeFilterCount > 0 && (
            <span
              className="h-4 w-px bg-border"
              aria-hidden="true"
            />
          )}
          {activeFilterCount > 0 && summaryMode === "labels" && (
            <ColumnFiltersLabel
              columnFilterLabels={columnFilterLabels}
              className="w-full text-left sm:w-fit"
            />
          )}
          {activeFilterCount > 0 && summaryMode === "count" && (
            <span className="inline-flex items-center justify-center rounded-full bg-primary/10 px-1.5 py-0.5 text-xs font-semibold text-primary">
              {activeFilterCount}
            </span>
          )}
          {activeFilterCount > 0 && summaryMode === "dot" && (
            <span className="inline-block size-2 rounded-full bg-primary" aria-hidden="true" />
          )}
          <ChevronDown
            className="size-5 shrink-0 text-muted-foreground sm:size-4"
            aria-hidden="true"
          />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={7}
        className="w-[90vw] max-w-sm sm:min-w-56 sm:max-w-56"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault()
            column?.setFilterValue(selectedValues)
          }}
        >
          <div className="space-y-1">
            <div>
              <Label className="text-base font-medium sm:text-sm">
                Filter by {title}
              </Label>
              {renderFilter()}
            </div>
            <Button type="submit" className="w-full " size="sm" disabled={disabled}>
              Apply
            </Button>
            {columnFilterLabels && columnFilterLabels.length > 0 && (
              <Button
                variant="link"
                size="sm"
                className="w-full h-4"
                type="button"
                onClick={handleReset}
                disabled={disabled}
              >
                Reset
              </Button>
            )}
          </div>
        </form>
      </PopoverContent>
    </Popover>
  )
}
