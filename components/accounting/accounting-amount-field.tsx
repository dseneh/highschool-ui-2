"use client";

import { Input } from "@/components/ui/input";
import { NumericFormat } from "react-number-format";
import type { ControllerRenderProps, FieldValues, Path } from "react-hook-form";

interface AccountingAmountFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends Path<TFieldValues> = Path<TFieldValues>
> {
  /** Currency code to display as prefix (e.g., "USD", "EUR") */
  currencyCode?: string | null;
  
  /** Placeholder text when empty */
  placeholder?: string;
  
  /** Whether to allow negative amounts */
  allowNegative?: boolean;
  
  /** React Hook Form field props */
  field: ControllerRenderProps<TFieldValues, TName>;
}

/**
 * Reusable amount field component with currency support.
 * Formats amounts with thousand separators, fixed 2 decimal places,
 * and optional currency code prefix.
 * 
 * Usage:
 * ```tsx
 * <AccountingAmountField
 *   field={field}
 *   currencyCode="USD"
 *   placeholder="0.00"
 * />
 * ```
 */
export function AccountingAmountField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends Path<TFieldValues> = Path<TFieldValues>
>({
  currencyCode,
  placeholder,
  allowNegative = false,
  field,
}: AccountingAmountFieldProps<TFieldValues, TName>) {
  const displayPlaceholder = currencyCode 
    ? `${currencyCode} ${placeholder ?? "0.00"}` 
    : placeholder ?? "0.00";

  const normalizedValue =
    field.value === undefined ||
    field.value === null ||
    field.value === "" ||
    field.value === 0
      ? ""
      : field.value;

  return (
    <NumericFormat
      customInput={Input}
      thousandSeparator=","
      decimalSeparator="."
      decimalScale={2}
      allowNegative={allowNegative}
      placeholder={displayPlaceholder}
      prefix={currencyCode ? `${currencyCode} ` : undefined}
      value={normalizedValue}
      onValueChange={({ floatValue }) =>
        field.onChange(floatValue ?? ("" as unknown as number))
      }
      autoComplete="off"
      onBlur={field.onBlur}
      name={field.name}
      getInputRef={field.ref}
    />
  );
}
