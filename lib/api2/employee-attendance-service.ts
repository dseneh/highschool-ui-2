import apiClient from "@/lib/api2/client";
import type {
  CreateEmployeeAttendanceCommand,
  EmployeeAttendanceDto,
  ListEmployeeAttendanceParams,
} from "./employee-attendance-types";

interface BackendLookup {
  id?: string;
  full_name?: string;
  employee_number?: string;
}

interface BackendEmployeeAttendance {
  id?: string;
  employee?: string | BackendLookup | null;
  attendance_date?: string | null;
  status?: string | null;
  check_in_time?: string | null;
  check_out_time?: string | null;
  hours_worked?: number | null;
  notes?: string | null;
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

function mapAttendance(data: BackendEmployeeAttendance): EmployeeAttendanceDto {
  const employee = typeof data.employee === "object" && data.employee ? data.employee : null;

  return {
    id: data.id ?? "",
    employeeId: employee?.id ?? "",
    employeeName: employee?.full_name ?? "Unknown Employee",
    employeeNumber: employee?.employee_number ?? null,
    attendanceDate: data.attendance_date ?? "",
    status: toDisplayValue(data.status) || "Present",
    checkInTime: data.check_in_time ?? null,
    checkOutTime: data.check_out_time ?? null,
    hoursWorked: data.hours_worked ?? 0,
    notes: data.notes ?? null,
  };
}

function toPayload(payload: CreateEmployeeAttendanceCommand) {
  return {
    employee: payload.employeeId,
    attendance_date: payload.attendanceDate,
    status: toBackendEnum(payload.status) ?? "present",
    check_in_time: payload.checkInTime || null,
    check_out_time: payload.checkOutTime || null,
    notes: payload.notes ?? null,
  };
}

function mapListParams(params?: ListEmployeeAttendanceParams) {
  if (!params) return undefined;

  return {
    employee: params.employeeId,
    status: toBackendEnum(params.status),
    attendance_date: params.attendanceDate,
    search: params.search,
  };
}

export async function listEmployeeAttendance(
  params?: ListEmployeeAttendanceParams
): Promise<EmployeeAttendanceDto[]> {
  const { data } = await apiClient.get<{ results?: BackendEmployeeAttendance[] } | BackendEmployeeAttendance[]>(
    "employee-attendance",
    { params: mapListParams(params) }
  );
  const records = Array.isArray(data) ? data : data.results ?? [];
  return records.map(mapAttendance);
}

export async function createEmployeeAttendance(
  payload: CreateEmployeeAttendanceCommand
): Promise<EmployeeAttendanceDto> {
  const { data } = await apiClient.post<BackendEmployeeAttendance>("employee-attendance", toPayload(payload));
  return mapAttendance(data);
}

export async function updateEmployeeAttendance(
  id: string,
  payload: CreateEmployeeAttendanceCommand
): Promise<EmployeeAttendanceDto> {
  const { data } = await apiClient.put<BackendEmployeeAttendance>(`employee-attendance/${id}`, toPayload(payload));
  return mapAttendance(data);
}

export async function deleteEmployeeAttendance(id: string): Promise<void> {
  await apiClient.delete(`employee-attendance/${id}`);
}
