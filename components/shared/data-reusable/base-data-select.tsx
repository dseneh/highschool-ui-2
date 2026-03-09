"use client";

import * as React from "react";
import { useQueryState } from "nuqs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
} from "@/components/ui/combobox";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type SelectOption = {
  value: string;
  label: string;
  is_current?: boolean;
  active?: boolean;
  [key: string]: unknown;
};

type BaseDataSelectProps<T = unknown> = {
  /* ---- State management ---- */
  useUrlState?: boolean;
  urlParamName?: string;
  value?: string;
  onChange?: (value: string) => void;

  /* ---- Data fetching ---- */
  /** A React Query hook — called with `...hookArgs`. Must return `{ data, isLoading }`. */
  useDataHook: (...args: any[]) => {
    data?: T | T[];
    isLoading?: boolean;
    [key: string]: any;
  };
  hookArgs?: unknown[];
  /** If the hook result wraps data under a specific key, e.g. `result[dataKey]`. */
  dataKey?: string;
  enabled?: boolean;

  /* ---- Data transformation ---- */
  mapOptions?: (data: T[] | T) => SelectOption[];

  /* ---- Selection behaviour ---- */
  autoSelectCurrent?: boolean;
  autoSelectFirst?: boolean;
  currentKey?: string;

  /* ---- Select UI props ---- */
  title?: string;
  selectClassName?: string;
  loading?: boolean;
  loadingText?: string;
  placeholder?: string;
  disabled?: boolean;
  bgColorClass?: string;
  noTitle?: boolean;
  showActiveOnly?: boolean;
  /** When true, renders a searchable combobox instead of a plain select. */
  searchable?: boolean;
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function BaseDataSelect<T = unknown>({
  useUrlState = true,
  urlParamName = "value",
  value: controlledValue,
  onChange: controlledOnChange,
  useDataHook,
  hookArgs = [],
  dataKey,
  enabled = true,
  mapOptions,
  autoSelectCurrent = false,
  autoSelectFirst = false,
  currentKey = "is_current",
  title = "Select",
  selectClassName,
  loading: externalLoading,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  loadingText: _loadingText,
  placeholder,
  disabled,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  bgColorClass: _bgColorClass,
  noTitle,
  showActiveOnly,
  searchable = false,
}: BaseDataSelectProps<T>) {
  /* ---- State ---- */
  const [urlValue, setUrlValue] = useQueryState(urlParamName, {
    defaultValue: "",
  });
  const [localValue, setLocalValue] = React.useState("");

  const value = useUrlState ? urlValue : (controlledValue ?? localValue);
  const setValue = React.useCallback(
    (v: string) => {
      if (useUrlState) {
        void setUrlValue(v);
      } else if (controlledOnChange) {
        controlledOnChange(v);
      } else {
        setLocalValue(v);
      }
    },
    [useUrlState, setUrlValue, controlledOnChange]
  );

  /* ---- Data ---- */
  const prevHookArgsRef = React.useRef<unknown[] | undefined>(undefined);

  const hookResult = (useDataHook as any)(...hookArgs, { enabled });
  const rawData = dataKey ? hookResult[dataKey] : hookResult.data;
  const isLoading: boolean = hookResult.isLoading ?? hookResult.isLoadingData ?? false;

  const allOptions: SelectOption[] = React.useMemo(() => {
    if (!rawData) return [];
    if (mapOptions) return mapOptions(rawData);
    return Array.isArray(rawData)
      ? rawData.map((item: Record<string, unknown>) => ({
          value: String(item.id),
          label: String(item.name),
          is_current: Boolean(item.is_current),
          active: Boolean(item.active ?? item.is_active ?? true),
        }))
      : [];
  }, [rawData, mapOptions]);

  const options: SelectOption[] = React.useMemo(() => {
    if (!showActiveOnly) return allOptions;

    const activeOptions = allOptions.filter((opt) => opt.active !== false);
    if (!value) return activeOptions;

    const hasSelectedInActive = activeOptions.some((opt) => opt.value === value);
    if (hasSelectedInActive) return activeOptions;

    const selectedOption = allOptions.find((opt) => opt.value === value);
    return selectedOption ? [selectedOption, ...activeOptions] : activeOptions;
  }, [allOptions, showActiveOnly, value]);

  /* ---- Reset on dependency change ---- */
  React.useEffect(() => {
    const prev = prevHookArgsRef.current;
    if (prev !== undefined) {
      const changed =
        hookArgs.length !== prev.length ||
        hookArgs.some((arg, i) => arg !== prev[i]);
      if (changed && !isLoading) {
        const valid = options.some((o) => o.value === value);
        if (!valid) {
          setValue(options.length === 1 ? (options[0]?.value ?? "") : "");
        }
      }
    }
    prevHookArgsRef.current = hookArgs;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hookArgs, options, isLoading]);

  /* ---- Auto-select ---- */
  React.useEffect(() => {
    if (value) return;
    if (options.length > 0) {
      if (autoSelectCurrent) {
        const current = options.find(
          (o) => o[currentKey as keyof SelectOption]
        );
        if (current) {
          setValue(current.value);
          return;
        }
      }
      if (autoSelectFirst) {
        setValue(options[0]?.value ?? "");
      }
    }
  }, [options, value, setValue, autoSelectCurrent, autoSelectFirst, currentKey]);

  /* ---- Value → label map for combobox display ---- */
  const valueLabelMap = React.useMemo(() => {
    const map = new Map<string, string>();
    for (const opt of allOptions) {
      map.set(opt.value, opt.label);
    }
    return map;
  }, [allOptions]);

  const hasResolvedSelection = React.useMemo(() => {
    if (!value) return false;
    return valueLabelMap.has(value);
  }, [value, valueLabelMap]);

  const resolvedSelectValue = hasResolvedSelection ? value : "";

  /* ---- Render ---- */
  const isComponentLoading = externalLoading ?? isLoading;

  if (isComponentLoading) {
    return (
      <div className={cn("space-y-1.5", selectClassName)}>
        {!noTitle && (
          <span className="text-sm font-medium text-muted-foreground">
            {title}
          </span>
        )}
        <Skeleton className="h-9 w-full rounded-md" />
      </div>
    );
  }

  return (
    <div className={cn(!noTitle && "space-y-1.5")}>
      {!noTitle && (
        <span className="text-sm font-medium text-muted-foreground">
          {title}
        </span>
      )}
      {searchable ? (
        <Combobox
          value={hasResolvedSelection ? value : null}
          onValueChange={(v) => setValue(v ? String(v) : "")}
          disabled={disabled || !enabled}
          itemToStringLabel={(v) => valueLabelMap.get(String(v)) ?? ""}
        >
          <ComboboxInput
            placeholder={placeholder ?? `Search ${title?.toLowerCase()}...`}
            className={cn("w-full", selectClassName)}
            showClear={!!value}
            showTrigger
          />
          <ComboboxContent className="animate-in fade-in slide-in-from-top-2 duration-200">
            <ComboboxList>
              {options.map((opt) => (
                <ComboboxItem key={opt.value} value={opt.value}>
                  {opt.label}
                </ComboboxItem>
              ))}
            {/* <ComboboxEmpty>No results found.</ComboboxEmpty> */}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      ) : (
        <Select
          value={resolvedSelectValue}
          onValueChange={(v) => setValue(v ?? "")}
          disabled={disabled || !enabled}
          items={options.map((opt) => ({ value: opt.value, label: opt.label }))}
        >
          <SelectTrigger className={cn("w-full", selectClassName)}>
            <SelectValue placeholder={placeholder ?? `Select ${title?.toLowerCase()}...`} />
          </SelectTrigger>
          <SelectContent className="animate-in fade-in slide-in-from-top-2 duration-200">
            {options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
