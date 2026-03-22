import type { ConditionFilter, NumberCondition } from "./types";

export type NumberConditionValue =
  | "is-between"
  | "is-greater-than"
  | "is-greater-than-or-equal"
  | "is-less-than"
  | "is-less-than-or-equal"
  | "is-equal-to";

type NumberFilterParamKeys = {
  equalKey: string;
  minKey: string;
  maxKey: string;
};

export const DEFAULT_NUMBER_FILTER_CONDITIONS: NumberCondition[] = [
  { label: "Is Equal To", value: "is-equal-to", selectedLabel: "=" },
  { label: "Is Greater Than", value: "is-greater-than", selectedLabel: ">" },
  { label: "Is Greater Than Or Equal To", value: "is-greater-than-or-equal", selectedLabel: ">=" },
  { label: "Is Less Than", value: "is-less-than", selectedLabel: "<" },
  { label: "Is Less Than Or Equal To", value: "is-less-than-or-equal", selectedLabel: "<=" },
  { label: "Is Between", value: "is-between", selectedLabel: "between" },
];

function normalizeValue(value: number | string | undefined): string | undefined {
  if (value === undefined || value === null) return undefined;
  const normalized = String(value).trim();
  return normalized.length > 0 ? normalized : undefined;
}

export function getPrimaryConditionValue(filter: ConditionFilter | undefined): string | undefined {
  if (!filter) return undefined;
  return normalizeValue(filter.value?.[0]) ?? normalizeValue(filter.value?.[1]);
}

export function buildNumberConditionQueryParams(
  filter: ConditionFilter | undefined,
  keys: NumberFilterParamKeys
): Record<string, string | undefined> {
  const condition = filter?.condition as NumberConditionValue | undefined;
  const first = normalizeValue(filter?.value?.[0]);
  const second = normalizeValue(filter?.value?.[1]);
  const primary = first ?? second;

  const params: Record<string, string | undefined> = {
    [keys.equalKey]: undefined,
    [keys.minKey]: undefined,
    [keys.maxKey]: undefined,
  };

  if (!condition) return params;

  if (condition === "is-between") {
    params[keys.minKey] = first;
    params[keys.maxKey] = second;
    return params;
  }

  if (!primary) return params;

  if (condition === "is-equal-to") {
    params[keys.equalKey] = primary;
    return params;
  }

  if (condition === "is-greater-than" || condition === "is-greater-than-or-equal") {
    params[keys.minKey] = primary;
    return params;
  }

  if (condition === "is-less-than" || condition === "is-less-than-or-equal") {
    params[keys.maxKey] = primary;
  }

  return params;
}
