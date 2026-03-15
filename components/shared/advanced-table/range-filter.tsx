"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"

interface RangeFilterProps {
  minValue: string | number
  maxValue: string | number
  onMinChange: (value: string) => void
  onMaxChange: (value: string) => void
  minPlaceholder?: string
  maxPlaceholder?: string
  showMax?: boolean
  disabled?: boolean
}

export function RangeFilter({
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
  minPlaceholder = "Min",
  maxPlaceholder = "Max",
  showMax = true,
  disabled = false,
}: RangeFilterProps) {
  return (
    <div className="space-y-2">
      <Input
        type="number"
        placeholder={minPlaceholder}
        className="h-8"
        disabled={disabled}
        value={minValue}
        onChange={(event) => onMinChange(event.target.value)}
      />
      {showMax && (
        <Input
          type="number"
          placeholder={maxPlaceholder}
          className="h-8"
          disabled={disabled}
          value={maxValue}
          onChange={(event) => onMaxChange(event.target.value)}
        />
      )}
    </div>
  )
}
