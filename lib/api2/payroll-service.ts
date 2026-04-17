import apiClient from "@/lib/api2/client";
import type {
  CreateEmployeeCompensationCommand,
  CreatePayrollComponentCommand,
  CreatePayrollRunCommand,
  EmployeeCompensationDto,
  EmployeeCompensationItemDto,
  PayrollComponentDto,
  PayrollRunDto,
} from "./payroll-types";

interface BackendLookup {
  id?: string;
  full_name?: string;
  employee_number?: string;
  name?: string;
  code?: string;
  component_type?: string;
  calculation_method?: string;
}

interface BackendPayrollComponent {
  id?: string;
  name?: string | null;
  code?: string | null;
  description?: string | null;
  component_type?: string | null;
  calculation_method?: string | null;
  default_value?: string | number | null;
  taxable?: boolean;
  active?: boolean;
}

interface BackendCompensationItem {
  id?: string;
  component?: BackendLookup | string | null;
  override_value?: string | number | null;
  amount?: string | number | null;
}

interface BackendEmployeeCompensation {
  id?: string;
  employee?: BackendLookup | string | null;
  base_salary?: string | number | null;
  currency?: string | null;
  payment_frequency?: string | null;
  effective_date?: string | null;
  notes?: string | null;
  items?: BackendCompensationItem[] | null;
  gross_pay?: string | number | null;
  total_deductions?: string | number | null;
  net_pay?: string | number | null;
  active?: boolean;
}

interface BackendPayrollRun {
  id?: string;
  name?: string | null;
  run_date?: string | null;
  period_start?: string | null;
  period_end?: string | null;
  payment_date?: string | null;
  status?: string | null;
  currency?: string | null;
  notes?: string | null;
  employee_count?: number | null;
  gross_pay?: string | number | null;
  total_deductions?: string | number | null;
  net_pay?: string | number | null;
  active?: boolean;
}

function toNumber(value: string | number | null | undefined): number {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim()) return Number(value);
  return 0;
}

function toDisplayValue(value: string | null | undefined): string {
  if (!value) return "";
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function toBackendEnum(value: string | null | undefined): string | null {
  if (!value) return null;
  return value.toLowerCase().replace(/[-\s]+/g, "_");
}

function mapPayrollComponent(data: BackendPayrollComponent): PayrollComponentDto {
  return {
    id: data.id ?? "",
    name: data.name ?? "Untitled Component",
    code: data.code ?? null,
    description: data.description ?? null,
    componentType: toDisplayValue(data.component_type) || "Earning",
    calculationMethod: toDisplayValue(data.calculation_method) || "Fixed",
    defaultValue: toNumber(data.default_value),
    taxable: data.taxable ?? false,
    active: data.active ?? true,
  };
}

function mapCompensationItem(data: BackendCompensationItem): EmployeeCompensationItemDto {
  const component = typeof data.component === "object" && data.component ? data.component : null;

  return {
    id: data.id ?? "",
    componentId: component?.id ?? "",
    componentName: component?.name ?? "Component",
    componentCode: component?.code ?? null,
    componentType: toDisplayValue(component?.component_type) || "Earning",
    calculationMethod: toDisplayValue(component?.calculation_method) || "Fixed",
    overrideValue: data.override_value == null ? null : toNumber(data.override_value),
    amount: toNumber(data.amount),
  };
}

function mapEmployeeCompensation(data: BackendEmployeeCompensation): EmployeeCompensationDto {
  const employee = typeof data.employee === "object" && data.employee ? data.employee : null;

  return {
    id: data.id ?? "",
    employeeId: employee?.id ?? "",
    employeeName: employee?.full_name ?? "Unknown Employee",
    employeeNumber: employee?.employee_number ?? null,
    baseSalary: toNumber(data.base_salary),
    currency: data.currency ?? "USD",
    paymentFrequency: toDisplayValue(data.payment_frequency) || "Monthly",
    effectiveDate: data.effective_date ?? "",
    notes: data.notes ?? null,
    items: Array.isArray(data.items) ? data.items.map(mapCompensationItem) : [],
    grossPay: toNumber(data.gross_pay),
    totalDeductions: toNumber(data.total_deductions),
    netPay: toNumber(data.net_pay),
    active: data.active ?? true,
  };
}

function mapPayrollRun(data: BackendPayrollRun): PayrollRunDto {
  return {
    id: data.id ?? "",
    name: data.name ?? "Untitled Payroll Run",
    runDate: data.run_date ?? "",
    periodStart: data.period_start ?? null,
    periodEnd: data.period_end ?? null,
    paymentDate: data.payment_date ?? null,
    status: toDisplayValue(data.status) || "Draft",
    currency: data.currency ?? "USD",
    notes: data.notes ?? null,
    employeeCount: data.employee_count ?? 0,
    grossPay: toNumber(data.gross_pay),
    totalDeductions: toNumber(data.total_deductions),
    netPay: toNumber(data.net_pay),
    active: data.active ?? true,
  };
}

function toPayrollComponentPayload(payload: CreatePayrollComponentCommand) {
  return {
    name: payload.name,
    code: payload.code ?? "",
    description: payload.description ?? null,
    component_type: toBackendEnum(payload.componentType) ?? "earning",
    calculation_method: toBackendEnum(payload.calculationMethod) ?? "fixed",
    default_value: payload.defaultValue,
    taxable: payload.taxable,
  };
}

function toEmployeeCompensationPayload(payload: CreateEmployeeCompensationCommand) {
  return {
    employee: payload.employeeId,
    base_salary: payload.baseSalary,
    currency: payload.currency,
    payment_frequency: toBackendEnum(payload.paymentFrequency) ?? "monthly",
    effective_date: payload.effectiveDate,
    notes: payload.notes ?? null,
    items: (payload.items ?? []).map((item) => ({
      component: item.componentId,
      override_value: item.overrideValue ?? null,
    })),
  };
}

function toPayrollRunPayload(payload: CreatePayrollRunCommand) {
  return {
    name: payload.name,
    run_date: payload.runDate,
    period_start: payload.periodStart ?? null,
    period_end: payload.periodEnd ?? null,
    payment_date: payload.paymentDate ?? null,
    status: toBackendEnum(payload.status) ?? "draft",
    currency: payload.currency,
    notes: payload.notes ?? null,
  };
}

export async function listPayrollComponents(): Promise<PayrollComponentDto[]> {
  const { data } = await apiClient.get<{ results?: BackendPayrollComponent[] } | BackendPayrollComponent[]>("payroll-components");
  const records = Array.isArray(data) ? data : data.results ?? [];
  return records.map(mapPayrollComponent);
}

export async function createPayrollComponent(payload: CreatePayrollComponentCommand): Promise<PayrollComponentDto> {
  const { data } = await apiClient.post<BackendPayrollComponent>("payroll-components", toPayrollComponentPayload(payload));
  return mapPayrollComponent(data);
}

export async function updatePayrollComponent(id: string, payload: CreatePayrollComponentCommand): Promise<PayrollComponentDto> {
  const { data } = await apiClient.put<BackendPayrollComponent>(`payroll-components/${id}`, toPayrollComponentPayload(payload));
  return mapPayrollComponent(data);
}

export async function deletePayrollComponent(id: string): Promise<void> {
  await apiClient.delete(`payroll-components/${id}`);
}

export async function listEmployeeCompensations(): Promise<EmployeeCompensationDto[]> {
  const { data } = await apiClient.get<{ results?: BackendEmployeeCompensation[] } | BackendEmployeeCompensation[]>("employee-compensations");
  const records = Array.isArray(data) ? data : data.results ?? [];
  return records.map(mapEmployeeCompensation);
}

export async function createEmployeeCompensation(payload: CreateEmployeeCompensationCommand): Promise<EmployeeCompensationDto> {
  const { data } = await apiClient.post<BackendEmployeeCompensation>("employee-compensations", toEmployeeCompensationPayload(payload));
  return mapEmployeeCompensation(data);
}

export async function updateEmployeeCompensation(id: string, payload: CreateEmployeeCompensationCommand): Promise<EmployeeCompensationDto> {
  const { data } = await apiClient.put<BackendEmployeeCompensation>(`employee-compensations/${id}`, toEmployeeCompensationPayload(payload));
  return mapEmployeeCompensation(data);
}

export async function deleteEmployeeCompensation(id: string): Promise<void> {
  await apiClient.delete(`employee-compensations/${id}`);
}

export async function listPayrollRuns(): Promise<PayrollRunDto[]> {
  const { data } = await apiClient.get<{ results?: BackendPayrollRun[] } | BackendPayrollRun[]>("payroll-runs");
  const records = Array.isArray(data) ? data : data.results ?? [];
  return records.map(mapPayrollRun);
}

export async function createPayrollRun(payload: CreatePayrollRunCommand): Promise<PayrollRunDto> {
  const { data } = await apiClient.post<BackendPayrollRun>("payroll-runs", toPayrollRunPayload(payload));
  return mapPayrollRun(data);
}

export async function updatePayrollRun(id: string, payload: CreatePayrollRunCommand): Promise<PayrollRunDto> {
  const { data } = await apiClient.put<BackendPayrollRun>(`payroll-runs/${id}`, toPayrollRunPayload(payload));
  return mapPayrollRun(data);
}

export async function deletePayrollRun(id: string): Promise<void> {
  await apiClient.delete(`payroll-runs/${id}`);
}

export async function processPayrollRun(id: string): Promise<PayrollRunDto> {
  const { data } = await apiClient.post<BackendPayrollRun>(`payroll-runs/${id}/process`, {});
  return mapPayrollRun(data);
}

export async function markPayrollRunPaid(id: string): Promise<PayrollRunDto> {
  const { data } = await apiClient.post<BackendPayrollRun>(`payroll-runs/${id}/mark-paid`, {});
  return mapPayrollRun(data);
}
