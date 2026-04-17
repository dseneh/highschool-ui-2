import apiClient from "@/lib/api2/client";
import type {
  CreateEmployeeWorkflowTaskCommand,
  EmployeeWorkflowTaskDto,
  ListEmployeeWorkflowTaskParams,
} from "./employee-workflow-types";

interface BackendLookup {
  id?: string;
  full_name?: string;
  employee_number?: string;
}

interface BackendEmployeeWorkflowTask {
  id?: string;
  employee?: string | BackendLookup | null;
  assigned_to?: string | BackendLookup | null;
  workflow_type?: string | null;
  category?: string | null;
  title?: string | null;
  description?: string | null;
  due_date?: string | null;
  status?: string | null;
  completed_at?: string | null;
  notes?: string | null;
  is_overdue?: boolean;
  active?: boolean;
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

function mapWorkflowTask(data: BackendEmployeeWorkflowTask): EmployeeWorkflowTaskDto {
  const employee = typeof data.employee === "object" && data.employee ? data.employee : null;
  const assignedTo = typeof data.assigned_to === "object" && data.assigned_to ? data.assigned_to : null;

  return {
    id: data.id ?? "",
    employeeId: employee?.id ?? "",
    employeeName: employee?.full_name ?? "Unknown Employee",
    employeeNumber: employee?.employee_number ?? null,
    assignedToId: assignedTo?.id ?? null,
    assignedToName: assignedTo?.full_name ?? null,
    workflowType: toDisplayValue(data.workflow_type) || "Onboarding",
    category: toDisplayValue(data.category) || "Other",
    title: data.title ?? "",
    description: data.description ?? null,
    dueDate: data.due_date ?? null,
    status: toDisplayValue(data.status) || "Pending",
    completedAt: data.completed_at ?? null,
    notes: data.notes ?? null,
    isOverdue: data.is_overdue ?? false,
    active: data.active ?? true,
  };
}

function toPayload(payload: CreateEmployeeWorkflowTaskCommand) {
  return {
    employee: payload.employeeId,
    assigned_to: payload.assignedToId || null,
    workflow_type: toBackendEnum(payload.workflowType) ?? "onboarding",
    category: toBackendEnum(payload.category) ?? "other",
    title: payload.title,
    description: payload.description ?? null,
    due_date: payload.dueDate || null,
    status: toBackendEnum(payload.status) ?? "pending",
    notes: payload.notes ?? null,
    active: payload.active ?? true,
  };
}

function mapListParams(params?: ListEmployeeWorkflowTaskParams) {
  if (!params) return undefined;

  return {
    employee: params.employeeId,
    workflow_type: toBackendEnum(params.workflowType),
    status: toBackendEnum(params.status),
    category: toBackendEnum(params.category),
    search: params.search,
  };
}

export async function listEmployeeWorkflowTasks(
  params?: ListEmployeeWorkflowTaskParams
): Promise<EmployeeWorkflowTaskDto[]> {
  const { data } = await apiClient.get<{ results?: BackendEmployeeWorkflowTask[] } | BackendEmployeeWorkflowTask[]>(
    "employee-workflow-tasks",
    { params: mapListParams(params) }
  );
  const records = Array.isArray(data) ? data : data.results ?? [];
  return records.map(mapWorkflowTask);
}

export async function createEmployeeWorkflowTask(
  payload: CreateEmployeeWorkflowTaskCommand
): Promise<EmployeeWorkflowTaskDto> {
  const { data } = await apiClient.post<BackendEmployeeWorkflowTask>("employee-workflow-tasks", toPayload(payload));
  return mapWorkflowTask(data);
}

export async function updateEmployeeWorkflowTask(
  id: string,
  payload: CreateEmployeeWorkflowTaskCommand
): Promise<EmployeeWorkflowTaskDto> {
  const { data } = await apiClient.put<BackendEmployeeWorkflowTask>(`employee-workflow-tasks/${id}`, toPayload(payload));
  return mapWorkflowTask(data);
}

export async function deleteEmployeeWorkflowTask(id: string): Promise<void> {
  await apiClient.delete(`employee-workflow-tasks/${id}`);
}
