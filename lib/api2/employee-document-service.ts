import apiClient from "@/lib/api2/client";
import type {
  CreateEmployeeDocumentCommand,
  EmployeeDocumentDto,
  ListEmployeeDocumentsParams,
} from "./employee-document-types";

interface BackendLookup {
  id?: string;
  full_name?: string;
  employee_number?: string;
}

interface BackendEmployeeDocument {
  id?: string;
  employee?: string | BackendLookup | null;
  title?: string | null;
  document_type?: string | null;
  document_number?: string | null;
  issue_date?: string | null;
  expiry_date?: string | null;
  issuing_authority?: string | null;
  document_url?: string | null;
  notes?: string | null;
  compliance_status?: string | null;
  days_until_expiry?: number | null;
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

function mapDocument(data: BackendEmployeeDocument): EmployeeDocumentDto {
  const employee = typeof data.employee === "object" && data.employee ? data.employee : null;

  return {
    id: data.id ?? "",
    employeeId: employee?.id ?? "",
    employeeName: employee?.full_name ?? "Unknown Employee",
    employeeNumber: employee?.employee_number ?? null,
    title: data.title ?? "",
    documentType: toDisplayValue(data.document_type) || "Other",
    documentNumber: data.document_number ?? null,
    issueDate: data.issue_date ?? null,
    expiryDate: data.expiry_date ?? null,
    issuingAuthority: data.issuing_authority ?? null,
    documentUrl: data.document_url ?? null,
    notes: data.notes ?? null,
    complianceStatus: toDisplayValue(data.compliance_status) || "Valid",
    daysUntilExpiry: data.days_until_expiry ?? null,
    active: data.active ?? true,
  };
}

function toPayload(payload: CreateEmployeeDocumentCommand) {
  return {
    employee: payload.employeeId,
    title: payload.title,
    document_type: toBackendEnum(payload.documentType) ?? "other",
    document_number: payload.documentNumber ?? null,
    issue_date: payload.issueDate || null,
    expiry_date: payload.expiryDate || null,
    issuing_authority: payload.issuingAuthority ?? null,
    document_url: payload.documentUrl ?? null,
    notes: payload.notes ?? null,
    active: payload.active ?? true,
  };
}

function mapListParams(params?: ListEmployeeDocumentsParams) {
  if (!params) return undefined;

  return {
    employee: params.employeeId,
    document_type: toBackendEnum(params.documentType),
    compliance_status: toBackendEnum(params.complianceStatus),
    search: params.search,
  };
}

export async function listEmployeeDocuments(
  params?: ListEmployeeDocumentsParams
): Promise<EmployeeDocumentDto[]> {
  const { data } = await apiClient.get<{ results?: BackendEmployeeDocument[] } | BackendEmployeeDocument[]>(
    "employee-documents",
    { params: mapListParams(params) }
  );
  const records = Array.isArray(data) ? data : data.results ?? [];
  return records.map(mapDocument);
}

export async function createEmployeeDocument(
  payload: CreateEmployeeDocumentCommand
): Promise<EmployeeDocumentDto> {
  const { data } = await apiClient.post<BackendEmployeeDocument>("employee-documents", toPayload(payload));
  return mapDocument(data);
}

export async function updateEmployeeDocument(
  id: string,
  payload: CreateEmployeeDocumentCommand
): Promise<EmployeeDocumentDto> {
  const { data } = await apiClient.put<BackendEmployeeDocument>(`employee-documents/${id}`, toPayload(payload));
  return mapDocument(data);
}

export async function deleteEmployeeDocument(id: string): Promise<void> {
  await apiClient.delete(`employee-documents/${id}`);
}
