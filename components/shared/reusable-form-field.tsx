"use client";

import type { ReactNode } from "react";
import type { Control, FieldPath, FieldValues } from "react-hook-form";

import { AccountingAmountField } from "@/components/accounting/accounting-amount-field";
import { Input } from "@/components/ui/input";
import { SelectField } from "@/components/ui/select-field";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

type SelectItem = { value: string; label: string };

type FieldType = "input" | "number" | "amount" | "textarea" | "select" | "switch" | "custom";

type CustomRenderArgs = {
  field: {
    value: unknown;
    onChange: (...event: unknown[]) => void;
    onBlur: () => void;
    name: string;
    ref: (instance: unknown) => void;
  };
};

interface ReusableFormFieldProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
> {
  control: Control<TFieldValues>;
  name: TName;
  label: string;
  type?: FieldType;
  placeholder?: string;
  description?: string;
  disabled?: boolean;
  required?: boolean;
  selectItems?: SelectItem[];
  inputType?: "text" | "email" | "password" | "date";
  step?: string;
  currencyCode?: string | null;
  allowNegative?: boolean;
  customRender?: (args: CustomRenderArgs) => ReactNode;
}

export function ReusableFormField<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
>({
  control,
  name,
  label,
  type = "input",
  placeholder,
  description,
  disabled,
  required,
  selectItems,
  inputType = "text",
  step,
  currencyCode,
  allowNegative = false,
  customRender,
}: ReusableFormFieldProps<TFieldValues, TName>) {
  const renderField = (field: CustomRenderArgs["field"]) => {
    if (type === "select") {
      return (
        <SelectField
          items={selectItems ?? []}
          value={String(field.value ?? "")}
          onValueChange={field.onChange}
          placeholder={placeholder}
          disabled={disabled}
        />
      );
    }

    if (type === "textarea") {
      return (
        <Textarea
          value={String(field.value ?? "")}
          onChange={field.onChange}
          onBlur={field.onBlur}
          name={field.name}
          ref={field.ref}
          placeholder={placeholder}
          disabled={disabled}
        />
      );
    }

    if (type === "switch") {
      return (
        <Switch
          checked={Boolean(field.value)}
          onCheckedChange={field.onChange}
          disabled={disabled}
        />
      );
    }

    if (type === "number") {
      return (
        <Input
          type="number"
          step={step ?? "0.01"}
          value={field.value as string | number | readonly string[] | undefined}
          onChange={field.onChange}
          onBlur={field.onBlur}
          name={field.name}
          ref={field.ref}
          placeholder={placeholder}
          disabled={disabled}
        />
      );
    }

    if (type === "amount") {
      return (
        <AccountingAmountField
          field={field}
          currencyCode={currencyCode}
          placeholder={placeholder}
          allowNegative={allowNegative}
        />
      );
    }

    if (type === "custom" && customRender) {
      return customRender({ field });
    }

    return (
      <Input
        type={inputType}
        value={field.value as string | number | readonly string[] | undefined}
        onChange={field.onChange}
        onBlur={field.onBlur}
        name={field.name}
        ref={field.ref}
        placeholder={placeholder}
        disabled={disabled}
      />
    );
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {label}
            {required ? <span className="ml-0.5 text-destructive">*</span> : null}
          </FormLabel>
          <FormControl>{renderField(field)}</FormControl>
          {description ? <FormDescription className="text-[11px] -mt-2 ps-2">{description}</FormDescription> : null}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
