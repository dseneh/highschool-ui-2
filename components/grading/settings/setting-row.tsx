"use client";

import type React from "react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { SelectField } from "@/components/ui/select-field";

interface SettingRowProps {
  label: string;
  description: string;
  children: React.ReactNode;
  onClick?: () => void;
  clickable?: boolean;
}

export function SettingRow({
  label,
  description,
  children,
  onClick,
  clickable = false,
}: SettingRowProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 rounded-lg px-4 py-4 transition md:grid-cols-3 md:items-center",
        clickable &&
          "cursor-pointer hover:bg-muted/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
      )}
      onClick={clickable ? onClick : undefined}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={
        clickable && onClick
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      <div className="md:col-span-2">
        <div className="text-sm font-semibold text-foreground">{label}</div>
        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
      <div className="flex items-center justify-end">{children}</div>
    </div>
  );
}

interface ToggleSettingProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function ToggleSetting({
  label,
  description,
  checked,
  onChange,
}: ToggleSettingProps) {
  return (
    <SettingRow
      label={label}
      description={description}
      onClick={() => onChange(!checked)}
      clickable
    >
      <Switch
        checked={checked}
        onCheckedChange={onChange}
        onClick={(event) => event.stopPropagation()}
      />
    </SettingRow>
  );
}

interface SelectSettingProps {
  label: string;
  description: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function SelectSetting({
  label,
  description,
  value,
  options,
  onChange,
  disabled,
}: SelectSettingProps) {
  return (
    <SettingRow label={label} description={description}>
      <SelectField
        items={options}
        value={value}
        onValueChange={(next) => onChange(next as string)}
        disabled={disabled}
      />
    </SettingRow>
  );
}

interface TextSettingProps {
  label: string;
  description: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function TextSetting({
  label,
  description,
  value,
  onChange,
  placeholder,
  disabled,
}: TextSettingProps) {
  return (
    <SettingRow label={label} description={description}>
      <Input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
      />
    </SettingRow>
  );
}
