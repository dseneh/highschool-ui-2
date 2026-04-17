import apiClient from "@/lib/api2/client";
import type {
  CreateLeaveRequestCommand,
  CreateLeaveTypeCommand,
  LeaveDecisionCommand,
  LeaveRequestDto,
  LeaveTypeDto,
  ListLeaveRequestParams,
} from "./leave-types";

interface BackendLookup {
  id?: string;
  name?: string;
  code?: string;
  full_name?: string;
  employee_number?: string;
}

interface BackendLeaveType {
  id?: string;
  name?: string | null;
  code?: string | null;
  description?: string | null;
  default_days?: number | null;
  requires_approval?: boolean;
  accrual_frequency?: string | null;
  allow_carryover?: boolean;
  max_carryover_days?: number | null;
  active?: boolean;
}

interface BackendLeaveRequest {
  id?: string;
  employee?: string | BackendLookup | null;
  leave_type?: string | BackendLookup | null;
  start_date?: string | null;
  end_date?: string | null;
  reason?: string | null;
  status?: string | null;
  reviewed_at?: string | null;
  review_note?: string | null;
  total_days?: number | null;
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

function mapLeaveType(data: BackendLeaveType): LeaveTypeDto {
  return {
    id: data.id ?? "",
    name: data.name ?? "Untitled Leave Type",
    code: data.code ?? null,
    description: data.description ?? null,
    defaultDays: data.default_days ?? 1,
    requiresApproval: data.requires_approval ?? true,
    accrualFrequency: toDisplayValue(data.accrual_frequency) || "Upfront",
    allowCarryover: data.allow_carryover ?? false,
    maxCarryoverDays: data.max_carryover_days ?? 0,
    active: data.active ?? true,
  };
}

function mapLeaveRequest(data: BackendLeaveRequest): LeaveRequestDto {
  const employee = typeof data.employee === "object" && data.employee ? data.employee : null;
  const leaveType = typeof data.leave_type === "object" && data.leave_type ? data.leave_type : null;

  return {
    id: data.id ?? "",
    employeeId: employee?.id ?? "",
    employeeName: employee?.full_name ?? "Unknown Employee",
    employeeNumber: employee?.employee_number ?? null,
    leaveTypeId: leaveType?.id ?? "",
    leaveTypeName: leaveType?.name ?? "Leave",
    leaveTypeCode: leaveType?.code ?? null,
    startDate: data.start_date ?? "",
    endDate: data.end_date ?? "",
    totalDays: data.total_days ?? 0,
    reason: data.reason ?? null,
    status: toDisplayValue(data.status) || "Pending",
    reviewedAt: data.reviewed_at ?? null,
    reviewNote: data.review_note ?? null,
  };
}

function toLeaveTypePayload(payload: CreateLeaveTypeCommand) {
  return {
    name: payload.name,
    code: payload.code ?? "",
    description: payload.description ?? null,
    default_days: payload.defaultDays,
    requires_approval: payload.requiresApproval,
    accrual_frequency: toBackendEnum(payload.accrualFrequency) ?? "upfront",
    allow_carryover: payload.allowCarryover,
    max_carryover_days: payload.allowCarryover ? payload.maxCarryoverDays : 0,
  };
}

function toLeaveRequestPayload(payload: CreateLeaveRequestCommand) {
  return {
    employee: payload.employeeId,
    leave_type: payload.leaveTypeId,
    start_date: payload.startDate,
    end_date: payload.endDate,
    reason: payload.reason ?? null,
  };
}

function mapListParams(params?: ListLeaveRequestParams) {
  if (!params) return undefined;

  return {
    status: toBackendEnum(params.status),
    employee: params.employeeId,
    leave_type: params.leaveTypeId,
    search: params.search,
  };
}

export async function listLeaveTypes(): Promise<LeaveTypeDto[]> {
  const { data } = await apiClient.get<{ results?: BackendLeaveType[] } | BackendLeaveType[]>("leave-types");
  const records = Array.isArray(data) ? data : data.results ?? [];
  return records.map(mapLeaveType);
}

export async function createLeaveType(payload: CreateLeaveTypeCommand): Promise<LeaveTypeDto> {
  const { data } = await apiClient.post<BackendLeaveType>("leave-types", toLeaveTypePayload(payload));
  return mapLeaveType(data);
}

export async function updateLeaveType(id: string, payload: CreateLeaveTypeCommand): Promise<LeaveTypeDto> {
  const { data } = await apiClient.put<BackendLeaveType>(`leave-types/${id}`, toLeaveTypePayload(payload));
  return mapLeaveType(data);
}

export async function deleteLeaveType(id: string): Promise<void> {
  await apiClient.delete(`leave-types/${id}`);
}

export async function listLeaveRequests(params?: ListLeaveRequestParams): Promise<LeaveRequestDto[]> {
  const { data } = await apiClient.get<{ results?: BackendLeaveRequest[] } | BackendLeaveRequest[]>("leave-requests", {
    params: mapListParams(params),
  });
  const records = Array.isArray(data) ? data : data.results ?? [];
  return records.map(mapLeaveRequest);
}

export async function createLeaveRequest(payload: CreateLeaveRequestCommand): Promise<LeaveRequestDto> {
  const { data } = await apiClient.post<BackendLeaveRequest>("leave-requests", toLeaveRequestPayload(payload));
  return mapLeaveRequest(data);
}

export async function approveLeaveRequest(id: string, payload?: LeaveDecisionCommand): Promise<LeaveRequestDto> {
  const { data } = await apiClient.post<BackendLeaveRequest>(`leave-requests/${id}/approve`, {
    note: payload?.note ?? null,
  });
  return mapLeaveRequest(data);
}

export async function rejectLeaveRequest(id: string, payload?: LeaveDecisionCommand): Promise<LeaveRequestDto> {
  const { data } = await apiClient.post<BackendLeaveRequest>(`leave-requests/${id}/reject`, {
    note: payload?.note ?? null,
  });
  return mapLeaveRequest(data);
}

export async function cancelLeaveRequest(id: string, payload?: LeaveDecisionCommand): Promise<LeaveRequestDto> {
  const { data } = await apiClient.post<BackendLeaveRequest>(`leave-requests/${id}/cancel`, {
    note: payload?.note ?? null,
  });
  return mapLeaveRequest(data);
}
