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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import {
  FilterType,
  FilterOption,
  ConditionFilter,
  FilterValue,
  NumberCondition,
} from "./types"
import { SelectField } from "@/components/ui/select-field"

const focusRing = "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"

interface AdvancedTableFilterProps<TData, TValue> {
  column: Column<TData, TValue> | undefined
  title?: string
  filterType?: FilterType
  options?: FilterOption[]
  conditions?: NumberCondition[]
  formatter?: (value: any) => string
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

export function AdvancedTableFilter<TData, TValue>({
  column,
  title,
  filterType = "select",
  options,
  conditions,
  formatter = (value) => value.toString(),
}: AdvancedTableFilterProps<TData, TValue>) {
  const columnFilters = column?.getFilterValue() as FilterValue
  const [selectedValues, setSelectedValues] = React.useState<FilterValue>(columnFilters)

  const columnFilterLabels = React.useMemo(() => {
    if (!selectedValues) return undefined

    if (Array.isArray(selectedValues)) {
      return selectedValues.map((value) => formatter(value))
    }

    if (typeof selectedValues === "string") {
      return [formatter(selectedValues)]
    }

    if (typeof selectedValues === "object" && "condition" in selectedValues) {
      const conditionLabel = conditions?.find(
        (c) => c.value === selectedValues.condition
      )?.label
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
            items={(options ?? []).map((option) => ({
              value: option.value,
              label: option.label,
            }))}
          />
        )

      case "checkbox":
        return (
          <div className="space-y-2 p-2 max-h-64 overflow-y-auto">
            {options?.map((option) => (
              <div key={option.value} className="flex items-center gap-2">
                <Checkbox
                  id={option.value}
                  checked={(selectedValues as string[])?.includes(option.value) ?? false}
                  onCheckedChange={(checked) => {
                    setSelectedValues((prev) => {
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
            ))}
          </div>
        )

      case "number":
        const isBetween = (selectedValues as ConditionFilter)?.condition === "is-between"
        return (
          <div className="space-y-3 p-2">
            <Select
              value={(selectedValues as ConditionFilter)?.condition ?? ""}
              onValueChange={(value) => {
                setSelectedValues({
                  condition: value ?? "",
                  value: ["", ""],
                })
              }}
            >
              <SelectTrigger className="h-8">
                <SelectValue placeholder="Select condition..." />
              </SelectTrigger>
              <SelectContent>
                {conditions?.map((condition) => (
                  <SelectItem key={condition.value} value={condition.value}>
                    {condition.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="space-y-2">
              <Input
                type="number"
                placeholder="Value"
                className="h-8"
                disabled={!(selectedValues as ConditionFilter)?.condition}
                value={(selectedValues as ConditionFilter)?.value?.[0] ?? ""}
                onChange={(e) => {
                  setSelectedValues((prev) => ({
                    condition: (prev as ConditionFilter)?.condition,
                    value: [e.target.value, (prev as ConditionFilter)?.value?.[1] ?? ""],
                  }))
                }}
              />

              {isBetween && (
                <Input
                  type="number"
                  placeholder="Max value"
                  className="h-8"
                  value={(selectedValues as ConditionFilter)?.value?.[1] ?? ""}
                  onChange={(e) => {
                    setSelectedValues((prev) => ({
                      condition: (prev as ConditionFilter)?.condition,
                      value: [(prev as ConditionFilter)?.value?.[0] ?? "", e.target.value],
                    }))
                  }}
                />
              )}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const handleReset = () => {
    column?.setFilterValue("")
    setSelectedValues(
      filterType === "checkbox" ? [] : filterType === "number" ? { condition: "", value: ["", ""] } : ""
    )
  }

  React.useEffect(() => {
    setSelectedValues(columnFilters)
  }, [columnFilters])

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex w-full items-center gap-x-1.5 whitespace-nowrap rounded-md border px-2 py-1.5 font-medium hover:bg-accent sm:w-fit sm:text-xs",
            selectedValues &&
              ((typeof selectedValues === "object" &&
                "condition" in selectedValues &&
                selectedValues.condition !== "") ||
                (typeof selectedValues === "string" && selectedValues !== "") ||
                (Array.isArray(selectedValues) && selectedValues.length > 0))
              ? "border-input"
              : "border-dashed border-input",
            focusRing,
          )}
        >
          <span
            aria-hidden="true"
            onClick={(e) => {
              if (selectedValues && 
                ((typeof selectedValues === "object" && "condition" in selectedValues && selectedValues.condition !== "") ||
                (typeof selectedValues === "string" && selectedValues !== "") ||
                (Array.isArray(selectedValues) && selectedValues.length > 0))) {
                e.stopPropagation()
                column?.setFilterValue("")
                setSelectedValues(filterType === "checkbox" ? [] : filterType === "number" ? { condition: "", value: ["", ""] } : "")
              }
            }}
          >
            <Plus
              className={cn(
                "-ml-px size-5 shrink-0 transition sm:size-4",
                selectedValues && 
                  ((typeof selectedValues === "object" && "condition" in selectedValues && selectedValues.condition !== "") ||
                  (typeof selectedValues === "string" && selectedValues !== "") ||
                  (Array.isArray(selectedValues) && selectedValues.length > 0)) && 
                  "rotate-45 hover:text-destructive",
              )}
              aria-hidden="true"
            />
          </span>
          {columnFilterLabels && columnFilterLabels.length > 0 ? (
            <span>{title}</span>
          ) : (
            <span className="w-full text-left sm:w-fit">{title}</span>
          )}
          {columnFilterLabels && columnFilterLabels.length > 0 && (
            <span
              className="h-4 w-px bg-border"
              aria-hidden="true"
            />
          )}
          <ColumnFiltersLabel
            columnFilterLabels={columnFilterLabels}
            className="w-full text-left sm:w-fit"
          />
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
          <div className="space-y-3">
            <div>
              <Label className="text-base font-medium sm:text-sm">
                Filter by {title}
              </Label>
              {renderFilter()}
            </div>
            <Button type="submit" className="w-full " size="sm">
              Apply
            </Button>
            {columnFilterLabels && columnFilterLabels.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="w-full "
                type="button"
                onClick={handleReset}
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
