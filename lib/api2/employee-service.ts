import apiClient from "@/lib/api2/client";
import type {
  AddContactCommand,
  AddDependentCommand,
  Address,
  ContactDto,
  CreateEmployeeCommand,
  CreateEmployeeDepartmentCommand,
  CreateEmployeePositionCommand,
  DependentDto,
  EmployeeDepartmentDto,
  EmployeeDto,
  EmployeeLeaveBalanceDto,
  EmployeeLeaveRequestDto,
  EmployeePositionDto,
  ListEmployeesParams,
  TerminateEmployeeCommand,
  UpdateEmployeeCommand,
} from "./employee-types";

interface BackendLookup {
  id?: string;
  name?: string;
  title?: string;
  code?: string;
  full_name?: string;
  employee_number?: string;
}

interface BackendContact {
  id?: string;
  contact_type?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  phone_number?: string | null;
  email?: string | null;
  relationship?: string | null;
  is_primary?: boolean;
}

interface BackendDependent {
  id?: string;
  first_name?: string | null;
  last_name?: string | null;
  date_of_birth?: string | null;
  relationship?: string | null;
  gender?: string | null;
  national_id?: string | null;
  photo_url?: string | null;
  has_photo?: boolean;
}

interface BackendEmployeeLeaveRequest {
  id?: string;
  leave_type?: BackendLookup | null;
  start_date?: string | null;
  end_date?: string | null;
  total_days?: number | null;
  reason?: string | null;
  status?: string | null;
  reviewed_at?: string | null;
  review_note?: string | null;
}

interface BackendEmployeeLeaveBalance {
  year?: number | null;
  leave_type?: string | null;
  leave_type_code?: string | null;
  default_days?: number | null;
  entitled_days?: number | null;
  carried_over_days?: number | null;
  used_days?: number | null;
  remaining_days?: number | null;
  accrual_frequency?: string | null;
  allow_carryover?: boolean;
  max_carryover_days?: number | null;
}

interface BackendEmployee {
  id?: string;
  employee_number?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  middle_name?: string | null;
  full_name?: string | null;
  email?: string | null;
  phone_number?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  country?: string | null;
  place_of_birth?: string | null;
  date_of_birth?: string | null;
  gender?: string | null;
  national_id?: string | null;
  passport_number?: string | null;
  hire_date?: string | null;
  termination_date?: string | null;
  employment_status?: string | null;
  department?: string | BackendLookup | null;
  department_id?: string | null;
  position?: string | BackendLookup | null;
  position_id?: string | null;
  manager?: string | BackendLookup | null;
  manager_id?: string | null;
  job_title?: string | null;
  employment_type?: string | null;
  photo_url?: string | null;
  has_photo?: boolean;
  contacts?: BackendContact[] | null;
  dependents?: BackendDependent[] | null;
  leave_requests?: BackendEmployeeLeaveRequest[] | null;
  leave_balances?: BackendEmployeeLeaveBalance[] | null;
}

interface BackendDepartment {
  id?: string;
  name?: string | null;
  code?: string | null;
  description?: string | null;
  active?: boolean;
}

interface BackendPosition {
  id?: string;
  title?: string | null;
  code?: string | null;
  description?: string | null;
  department?: string | BackendLookup | null;
  department_id?: string | null;
  employment_type?: string | null;
  can_teach?: boolean;
  active?: boolean;
}

function toDisplayValue(value: string | null | undefined): string | null {
  if (!value) return null;
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function toDisplayEmploymentType(value: string | null | undefined): string | null {
  if (!value) return null;
  const normalized = value.toLowerCase();
  if (normalized === "full_time") return "Full-Time";
  if (normalized === "part_time") return "Part-Time";
  return toDisplayValue(normalized);
}

function toBackendEnum(value: string | null | undefined): string | null {
  if (!value) return null;
  return value.toLowerCase().replace(/[-\s]+/g, "_");
}

function flattenAddress(address: Address | null | undefined) {
  return {
    address: address?.street ?? null,
    city: address?.city ?? null,
    state: address?.state ?? null,
    postal_code: address?.postalCode ?? null,
    country: address?.country ?? null,
  };
}

function extractLookupId(value: string | BackendLookup | null | undefined): string | null {
  if (!value) return null;
  return typeof value === "string" ? value : value.id ?? null;
}

function extractLookupLabel(value: string | BackendLookup | null | undefined): string | null {
  if (!value || typeof value === "string") return null;
  return value.name ?? value.title ?? value.full_name ?? value.employee_number ?? null;
}

function normalizeContact(contact: BackendContact): ContactDto {
  return {
    id: contact.id ?? "",
    contactType: contact.contact_type ?? null,
    firstName: contact.first_name ?? null,
    lastName: contact.last_name ?? null,
    phoneNumber: contact.phone_number ?? null,
    email: contact.email ?? null,
    relationship: contact.relationship ?? null,
    isPrimary: Boolean(contact.is_primary),
  };
}

function normalizeDependent(dependent: BackendDependent): DependentDto {
  return {
    id: dependent.id ?? "",
    firstName: dependent.first_name ?? null,
    lastName: dependent.last_name ?? null,
    dateOfBirth: dependent.date_of_birth ?? "",
    relationship: dependent.relationship ?? null,
    gender: dependent.gender ?? null,
    nationalId: dependent.national_id ?? null,
    photoUrl: dependent.photo_url ?? null,
    hasPhoto: Boolean(dependent.has_photo),
  };
}

function normalizeEmployeeLeaveRequest(
  leaveRequest: BackendEmployeeLeaveRequest
): EmployeeLeaveRequestDto {
  return {
    id: leaveRequest.id ?? "",
    leaveTypeName: leaveRequest.leave_type?.name ?? "Leave",
    leaveTypeCode: leaveRequest.leave_type?.code ?? null,
    startDate: leaveRequest.start_date ?? "",
    endDate: leaveRequest.end_date ?? "",
    totalDays: leaveRequest.total_days ?? 0,
    reason: leaveRequest.reason ?? null,
    status: toDisplayValue(leaveRequest.status) ?? "Pending",
    reviewedAt: leaveRequest.reviewed_at ?? null,
    reviewNote: leaveRequest.review_note ?? null,
  };
}

function normalizeEmployeeLeaveBalance(
  leaveBalance: BackendEmployeeLeaveBalance
): EmployeeLeaveBalanceDto {
  return {
    year: leaveBalance.year ?? new Date().getFullYear(),
    leaveType: leaveBalance.leave_type ?? "Leave",
    leaveTypeCode: leaveBalance.leave_type_code ?? null,
    defaultDays: leaveBalance.default_days ?? 0,
    entitledDays: leaveBalance.entitled_days ?? leaveBalance.default_days ?? 0,
    carriedOverDays: leaveBalance.carried_over_days ?? 0,
    usedDays: leaveBalance.used_days ?? 0,
    remainingDays: leaveBalance.remaining_days ?? 0,
    accrualFrequency: toDisplayValue(leaveBalance.accrual_frequency) ?? "Upfront",
    allowCarryover: leaveBalance.allow_carryover ?? false,
    maxCarryoverDays: leaveBalance.max_carryover_days ?? 0,
  };
}

function normalizeEmployee(employee: BackendEmployee): EmployeeDto {
  return {
    id: employee.id ?? "",
    employeeNumber: employee.employee_number ?? null,
    firstName: employee.first_name ?? null,
    lastName: employee.last_name ?? null,
    middleName: employee.middle_name ?? null,
    fullName: employee.full_name ?? null,
    email: employee.email ?? null,
    phoneNumber: employee.phone_number ?? null,
    address: employee.address ?? null,
    city: employee.city ?? null,
    state: employee.state ?? null,
    postalCode: employee.postal_code ?? null,
    country: employee.country ?? null,
    placeOfBirth: employee.place_of_birth ?? null,
    dateOfBirth: employee.date_of_birth ?? "",
    gender: employee.gender ?? null,
    nationalId: employee.national_id ?? null,
    passportNumber: employee.passport_number ?? null,
    hireDate: employee.hire_date ?? "",
    terminationDate: employee.termination_date ?? null,
    employmentStatus: toDisplayValue(employee.employment_status) ?? null,
    departmentId:
      extractLookupId(employee.department) ?? employee.department_id ?? null,
    departmentName: extractLookupLabel(employee.department),
    positionId: extractLookupId(employee.position) ?? employee.position_id ?? null,
    positionName: extractLookupLabel(employee.position),
    managerId: extractLookupId(employee.manager) ?? employee.manager_id ?? null,
    managerName: extractLookupLabel(employee.manager),
    jobTitle:
      employee.job_title ??
      (typeof employee.position === "object" && employee.position ? employee.position.title ?? null : null),
    employmentType: toDisplayEmploymentType(employee.employment_type) ?? null,
    photoUrl: employee.photo_url ?? null,
    hasPhoto: Boolean(employee.has_photo),
    contacts: Array.isArray(employee.contacts)
      ? employee.contacts.map(normalizeContact)
      : [],
    dependents: Array.isArray(employee.dependents)
      ? employee.dependents.map(normalizeDependent)
      : [],
    leaveRequests: Array.isArray(employee.leave_requests)
      ? employee.leave_requests.map(normalizeEmployeeLeaveRequest)
      : [],
    leaveBalances: Array.isArray(employee.leave_balances)
      ? employee.leave_balances.map(normalizeEmployeeLeaveBalance)
      : [],
  };
}

function normalizeDepartment(department: BackendDepartment): EmployeeDepartmentDto {
  return {
    id: department.id ?? "",
    name: department.name ?? "Untitled Department",
    code: department.code ?? null,
    description: department.description ?? null,
    active: department.active ?? true,
  };
}

function normalizePosition(position: BackendPosition): EmployeePositionDto {
  return {
    id: position.id ?? "",
    title: position.title ?? "Untitled Position",
    code: position.code ?? null,
    description: position.description ?? null,
    departmentId:
      extractLookupId(position.department) ?? position.department_id ?? null,
    departmentName: extractLookupLabel(position.department),
    employmentType: toDisplayEmploymentType(position.employment_type) ?? null,
    canTeach: Boolean(position.can_teach),
    active: position.active ?? true,
  };
}

function mapListParams(params?: ListEmployeesParams) {
  if (!params) return undefined;

  return {
    department: params.departmentId,
    employment_status: toBackendEnum(params.employmentStatus),
    page: params.pageNumber,
    page_size: params.pageSize,
  };
}

function toCreatePayload(payload: CreateEmployeeCommand) {
  return {
    employee_number: payload.employeeNumber ?? null,
    first_name: payload.firstName ?? null,
    last_name: payload.lastName ?? null,
    middle_name: payload.middleName ?? null,
    email: payload.email ?? null,
    phone_number: payload.phoneNumber ?? null,
    date_of_birth: payload.dateOfBirth,
    gender: toBackendEnum(payload.gender),
    national_id: payload.nationalId ?? null,
    passport_number: payload.passportNumber ?? null,
    hire_date: payload.hireDate,
    department: payload.departmentId ?? null,
    position: payload.positionId ?? null,
    manager: payload.managerId ?? null,
    job_title: payload.jobTitle ?? null,
    employment_type: toBackendEnum(payload.employmentType),
    ...flattenAddress(payload.address),
  };
}

function toUpdatePayload(payload: UpdateEmployeeCommand) {
  return {
    first_name: payload.firstName ?? null,
    last_name: payload.lastName ?? null,
    middle_name: payload.middleName ?? null,
    email: payload.email ?? null,
    phone_number: payload.phoneNumber ?? null,
    date_of_birth: payload.dateOfBirth,
    gender: toBackendEnum(payload.gender),
    national_id: payload.nationalId ?? null,
    passport_number: payload.passportNumber ?? null,
    department: payload.departmentId ?? null,
    position: payload.positionId ?? null,
    manager: payload.managerId ?? null,
    job_title: payload.jobTitle ?? null,
    employment_type: toBackendEnum(payload.employmentType),
    ...flattenAddress(payload.address),
  };
}

function toDepartmentPayload(payload: CreateEmployeeDepartmentCommand) {
  return {
    name: payload.name,
    code: payload.code ?? "",
    description: payload.description ?? null,
  };
}

function toPositionPayload(payload: CreateEmployeePositionCommand) {
  return {
    title: payload.title,
    code: payload.code ?? "",
    description: payload.description ?? null,
    department: payload.departmentId ?? null,
    employment_type: toBackendEnum(payload.employmentType) ?? "full_time",
    can_teach: payload.canTeach ?? false,
  };
}

export async function listEmployeeDepartments(): Promise<EmployeeDepartmentDto[]> {
  const { data } = await apiClient.get<{ results?: BackendDepartment[] } | BackendDepartment[]>(
    "employee-departments"
  );

  const records = Array.isArray(data) ? data : data.results ?? [];
  return records.map(normalizeDepartment);
}

export async function createEmployeeDepartment(
  _subdomain: string,
  payload: CreateEmployeeDepartmentCommand
): Promise<EmployeeDepartmentDto> {
  const { data } = await apiClient.post<BackendDepartment>(
    "employee-departments",
    toDepartmentPayload(payload)
  );
  return normalizeDepartment(data);
}

export async function updateEmployeeDepartment(
  _subdomain: string,
  id: string,
  payload: CreateEmployeeDepartmentCommand
): Promise<EmployeeDepartmentDto> {
  const { data } = await apiClient.put<BackendDepartment>(
    `employee-departments/${id}`,
    toDepartmentPayload(payload)
  );
  return normalizeDepartment(data);
}

export async function deleteEmployeeDepartment(_subdomain: string, id: string) {
  await apiClient.delete(`employee-departments/${id}`);
}

export async function listEmployeePositions(): Promise<EmployeePositionDto[]> {
  const { data } = await apiClient.get<{ results?: BackendPosition[] } | BackendPosition[]>(
    "employee-positions"
  );

  const records = Array.isArray(data) ? data : data.results ?? [];
  return records.map(normalizePosition);
}

export async function createEmployeePosition(
  _subdomain: string,
  payload: CreateEmployeePositionCommand
): Promise<EmployeePositionDto> {
  const { data } = await apiClient.post<BackendPosition>(
    "employee-positions",
    toPositionPayload(payload)
  );
  return normalizePosition(data);
}

export async function updateEmployeePosition(
  _subdomain: string,
  id: string,
  payload: CreateEmployeePositionCommand
): Promise<EmployeePositionDto> {
  const { data } = await apiClient.put<BackendPosition>(
    `employee-positions/${id}`,
    toPositionPayload(payload)
  );
  return normalizePosition(data);
}

export async function deleteEmployeePosition(_subdomain: string, id: string) {
  await apiClient.delete(`employee-positions/${id}`);
}

export async function listEmployees(
  _subdomain: string,
  params?: ListEmployeesParams
): Promise<EmployeeDto[]> {
  const { data } = await apiClient.get<{ results?: BackendEmployee[] } | BackendEmployee[]>(
    "employees",
    { params: mapListParams(params) }
  );

  const records = Array.isArray(data) ? data : data.results ?? [];
  return records.map(normalizeEmployee);
}

export async function getEmployee(
  _subdomain: string,
  id: string
): Promise<EmployeeDto> {
  const { data } = await apiClient.get<BackendEmployee>(`employees/${id}`);
  return normalizeEmployee(data);
}

export async function getEmployeeByNumber(
  _subdomain: string,
  employeeNumber: string
): Promise<EmployeeDto> {
  const { data } = await apiClient.get<BackendEmployee>(
    `employees/number/${employeeNumber}`
  );
  return normalizeEmployee(data);
}

export async function createEmployee(
  _subdomain: string,
  payload: CreateEmployeeCommand
): Promise<EmployeeDto> {
  const { data } = await apiClient.post<BackendEmployee>(
    "employees",
    toCreatePayload(payload)
  );
  return normalizeEmployee(data);
}

export async function updateEmployee(
  _subdomain: string,
  id: string,
  payload: UpdateEmployeeCommand
): Promise<EmployeeDto> {
  const { data } = await apiClient.put<BackendEmployee>(
    `employees/${id}`,
    toUpdatePayload(payload)
  );
  return normalizeEmployee(data);
}

export async function deleteEmployee(_subdomain: string, id: string) {
  await apiClient.delete(`employees/${id}`);
}

export async function terminateEmployee(
  _subdomain: string,
  id: string,
  payload: TerminateEmployeeCommand
): Promise<EmployeeDto> {
  const { data } = await apiClient.post<BackendEmployee>(
    `employees/${id}/terminate`,
    {
      termination_date: payload.terminationDate,
      modified_by: payload.modifiedBy ?? null,
    }
  );
  return normalizeEmployee(data);
}

export async function addContact(
  _subdomain: string,
  employeeId: string,
  payload: AddContactCommand
): Promise<ContactDto> {
  const { data } = await apiClient.post<BackendContact>(
    `employees/${employeeId}/contacts`,
    {
      contact_type: payload.contactType ?? null,
      first_name: payload.firstName ?? null,
      last_name: payload.lastName ?? null,
      phone_number: payload.phoneNumber ?? null,
      email: payload.email ?? null,
      relationship: payload.relationship ?? null,
      is_primary: payload.isPrimary,
      ...flattenAddress(payload.address),
    }
  );
  return normalizeContact(data);
}

export async function addDependent(
  _subdomain: string,
  employeeId: string,
  payload: AddDependentCommand
): Promise<DependentDto> {
  const { data } = await apiClient.post<BackendDependent>(
    `employees/${employeeId}/dependents`,
    {
      first_name: payload.firstName ?? null,
      last_name: payload.lastName ?? null,
      date_of_birth: payload.dateOfBirth,
      relationship: payload.relationship ?? null,
      gender: toBackendEnum(payload.gender),
      national_id: payload.nationalId ?? null,
    }
  );
  return normalizeDependent(data);
}

export async function uploadEmployeePhoto(
  _subdomain: string,
  employeeId: string,
  file: File
) {
  const form = new FormData();
  form.append("file", file);
  await apiClient.post(`employees/${employeeId}/photo`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

export async function getEmployeePhoto(
  _subdomain: string,
  employeeId: string
): Promise<string | null> {
  try {
    const { data } = await apiClient.get(`employees/${employeeId}/photo`, {
      responseType: "blob",
    });
    return URL.createObjectURL(data);
  } catch {
    return null;
  }
}

export async function deleteEmployeePhoto(
  _subdomain: string,
  employeeId: string
) {
  await apiClient.delete(`employees/${employeeId}/photo`);
}
