/**
 * Shared type definitions for reusable data select components.
 * Ported from ui-2 DataReusable — adapted for ezyschool-ui.
 */

/**
 * Base props shared by ALL data select components.
 */
export type DataSelectBaseProps = {
  /** Persist value in URL search params via nuqs (default: true). */
  useUrlState?: boolean;
  /** Controlled value (used when useUrlState is false). */
  value?: string;
  /** Controlled change handler (used when useUrlState is false). */
  onChange?: (value: string) => void;

  /** Label rendered above the select. */
  title?: string;
  /** Extra className on the trigger. */
  selectClassName?: string;
  /** Override loading state. */
  loading?: boolean;
  /** Text shown while loading. */
  loadingText?: string;
  /** Placeholder when nothing is selected. */
  placeholder?: string;
  /** Disable the select. */
  disabled?: boolean;
  /** Custom background colour class for the trigger. */
  bgColorClass?: string;
  /** Hide the title label. */
  noTitle?: boolean;
  /** Only show items where `active === true`. */
  showActiveOnly?: boolean;
  /** When true, renders a searchable combobox instead of a plain select. */
  searchable?: boolean;
};

/**
 * Props for components that can auto-select the "current" item
 * (e.g. current academic year / semester).
 */
export type DataSelectWithCurrentProps = DataSelectBaseProps & {
  autoSelectCurrent?: boolean;
};

/**
 * Props for components that can auto-select the first item.
 */
export type DataSelectWithFirstProps = DataSelectBaseProps & {
  autoSelectFirst?: boolean;
};

/**
 * Props for components with a single dependency
 * (e.g. section depends on gradeLevelId, markingPeriod depends on semesterId).
 */
export type DataSelectWithDependencyProps<
  TDependency extends string = "dependencyId",
> = DataSelectBaseProps & {
  [K in TDependency]: string;
};
