"use client";

import * as React from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
} from "@/components/ui/combobox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectFieldItem {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectFieldProps extends React.ComponentProps<typeof Select> {
  items: SelectFieldItem[];
  type?: "select" | "checkbox";
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
  searchable?: boolean;
  emptyText?: string;
  checkedValues?: string[];
  defaultCheckedValues?: string[];
  onCheckedValuesChange?: (values: string[]) => void;
}

export function SelectField({
  items,
  type = "select",
  placeholder = "Select an option",
  className,
  triggerClassName,
  searchable = false,
  emptyText = "No results found.",
  checkedValues,
  defaultCheckedValues,
  onCheckedValuesChange,
  ...selectProps
}: SelectFieldProps) {
  const {
    value,
    onValueChange,
    disabled,
    defaultValue,
    ...restSelectProps
  } = selectProps;
  const [localValue, setLocalValue] = React.useState(
    typeof defaultValue === "string" ? defaultValue : ""
  );
  const [query, setQuery] = React.useState("");
  const [localCheckedValues, setLocalCheckedValues] = React.useState<string[]>(
    defaultCheckedValues ?? []
  );

  const isCheckboxMode = type === "checkbox";

  const currentValue = typeof value === "string" ? value : localValue;
  const currentCheckedValues = checkedValues ?? localCheckedValues;

  const setValue = React.useCallback(
    (nextValue: string) => {
      if (onValueChange) {
        onValueChange(nextValue, {} as any);
        return;
      }
      setLocalValue(nextValue);
    },
    [onValueChange]
  );

  const setCheckedValue = React.useCallback(
    (nextValues: string[]) => {
      if (onCheckedValuesChange) {
        onCheckedValuesChange(nextValues);
        return;
      }
      setLocalCheckedValues(nextValues);
    },
    [onCheckedValuesChange]
  );

  const comboboxPlaceholder = React.useMemo(() => {
    if (!placeholder) return "Search...";
    return placeholder.replace(/^Select/i, "Search");
  }, [placeholder]);

  const filteredItems = React.useMemo(() => {
    const trimmedQuery = query.trim().toLowerCase();
    if (!trimmedQuery) return items;
    return items.filter((item) =>
      item.label.toLowerCase().includes(trimmedQuery)
    );
  }, [items, query]);

  const selectedLabel = React.useMemo(() => {
    return items.find((item) => item.value === currentValue)?.label ?? "";
  }, [items, currentValue]);

  React.useEffect(() => {
    if (isCheckboxMode) return;

    if (currentValue) {
      setQuery(selectedLabel);
      return;
    }
    setQuery("");
  }, [currentValue, selectedLabel, isCheckboxMode]);

  const selectedCheckboxLabels = React.useMemo(() => {
    if (!currentCheckedValues.length) return [];
    return items
      .filter((item) => currentCheckedValues.includes(item.value))
      .map((item) => item.label);
  }, [items, currentCheckedValues]);

  const checkboxButtonLabel = React.useMemo(() => {
    if (selectedCheckboxLabels.length === 0) return placeholder;
    if (selectedCheckboxLabels.length <= 2) {
      return selectedCheckboxLabels.join(", ");
    }
    return `${selectedCheckboxLabels.length} selected`;
  }, [selectedCheckboxLabels, placeholder]);

  const toggleCheckedValue = React.useCallback(
    (itemValue: string, checked: boolean) => {
      if (checked) {
        setCheckedValue([...currentCheckedValues, itemValue]);
        return;
      }
      setCheckedValue(currentCheckedValues.filter((value) => value !== itemValue));
    },
    [currentCheckedValues, setCheckedValue]
  );

  if (isCheckboxMode) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn("w-full justify-between font-normal", triggerClassName)}
            disabled={disabled}
          >
            <span className="truncate text-left">{checkboxButtonLabel}</span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-60" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className={cn("w-72 p-3", className)} align="start">
          <div className="space-y-3">
            {searchable && (
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search options..."
                className="h-9"
              />
            )}

            <div className="max-h-64 space-y-1 overflow-auto">
              {filteredItems.length === 0 ? (
                <p className="py-2 text-sm text-muted-foreground">{emptyText}</p>
              ) : (
                filteredItems.map((item) => {
                  const isChecked = currentCheckedValues.includes(item.value);

                  return (
                    <label
                      key={item.value}
                      className={cn(
                        "flex cursor-pointer items-center gap-2 rounded-sm px-1 py-1.5 text-sm hover:bg-muted/50 hover:text-accent-foreground",
                        item.disabled && "cursor-not-allowed opacity-60",
                      )}
                    >
                      <Checkbox
                        checked={isChecked}
                        disabled={item.disabled}
                        onCheckedChange={(checked) =>
                          toggleCheckedValue(item.value, Boolean(checked))
                        }
                      />
                      <span className="truncate">{item.label}</span>
                    </label>
                  );
                })
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  if (searchable) {
    return (
      <Combobox
        value={currentValue || null}
        onValueChange={(next) => {
          const nextValue = next ? String(next) : "";
          setValue(nextValue);
          const nextLabel = items.find((item) => item.value === nextValue)?.label ?? "";
          setQuery(nextLabel);
        }}
        disabled={disabled}
        itemToStringLabel={(val) =>
          items.find((item) => item.value === String(val))?.label ?? String(val)
        }
      >
        <ComboboxInput
          placeholder={comboboxPlaceholder}
          className={cn("w-full", triggerClassName)}
          showClear={!!currentValue}
          showTrigger
          onChange={(event) => setQuery(event.target.value)}
          value={query}
        />
        <ComboboxContent
          className={cn("animate-in fade-in slide-in-from-top-2 duration-200", className)}
        >
          <ComboboxList>
            {filteredItems.map((item) => (
              <ComboboxItem key={item.value} value={item.value} disabled={item.disabled}>
                {item.label}
              </ComboboxItem>
            ))}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    );
  }

  return (
    <Select
      items={items}
      {...restSelectProps}
      value={currentValue}
      onValueChange={(nextValue) => setValue(String(nextValue ?? ""))}
      disabled={disabled}
    >
      <SelectTrigger className={cn("w-full", triggerClassName)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className={className}>
        {items.map((item) => (
          <SelectItem
            key={item.value}
            value={item.value}
            disabled={item.disabled}
          >
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
