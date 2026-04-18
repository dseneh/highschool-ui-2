import apiClient from "@/lib/api2/client";
import type {
  CreateEmployeeDocumentCommand,
  CreatePerformanceReviewCommand,
  EmployeeDocumentDto,
  PerformanceReviewDto,
} from "./hr-types";

/* ------------------------------------------------------------------ */
/*  Backend interfaces                                                 */
/* ------------------------------------------------------------------ */

interface BackendLookup {
  id?: string;
  full_name?: string;
  employee_number?: string;
}

interface BackendDocument {
  id?: string;
  employee?: BackendLookup | string | null;
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
}

interface BackendPerformanceReview {
  id?: string;
  employee?: BackendLookup | string | null;
  reviewer?: BackendLookup | string | null;
  review_title?: string | null;
  review_period?: string | null;
  review_date?: string | null;
  next_review_date?: string | null;
  status?: string | null;
  rating?: string | null;
  goals_summary?: string | null;
  strengths?: string | null;
  improvement_areas?: string | null;
  manager_comments?: string | null;
  employee_comments?: string | null;
  overall_score?: string | number | null;
  rating_score?: number | null;
  is_completed?: boolean;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function toDisplay(value: string | null | undefined): string {
  if (!value) return "";
  return value
    .split("_")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

function toBackendEnum(value: string | null | undefined): string | null {
  if (!value) return null;
  return value.toLowerCase().replace(/[-\s]+/g, "_");
}

function extractId(value: BackendLookup | string | null | undefined): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value.id ?? "";
}

function extractName(value: BackendLookup | string | null | undefined): string {
  if (!value) return "";
  if (typeof value === "string") return "";
  return value.full_name ?? "";
}

/* ------------------------------------------------------------------ */
/*  Mappers                                                            */
/* ------------------------------------------------------------------ */

function mapDocument(d: BackendDocument): EmployeeDocumentDto {
  return {
    id: d.id ?? "",
    employeeId: extractId(d.employee),
    employeeName: extractName(d.employee),
    title: d.title ?? "Untitled",
    documentType: (toDisplay(d.document_type) || "Other") as EmployeeDocumentDto["documentType"],
    documentNumber: d.document_number ?? null,
    issueDate: d.issue_date ?? null,
    expiryDate: d.expiry_date ?? null,
    issuingAuthority: d.issuing_authority ?? null,
    documentUrl: d.document_url ?? null,
    notes: d.notes ?? null,
    complianceStatus: (d.compliance_status as EmployeeDocumentDto["complianceStatus"]) ?? null,
    daysUntilExpiry: d.days_until_expiry ?? null,
  };
}

function mapReview(r: BackendPerformanceReview): PerformanceReviewDto {
  return {
    id: r.id ?? "",
    employeeId: extractId(r.employee),
    employeeName: extractName(r.employee),
    reviewerId: extractId(r.reviewer) || null,
    reviewerName: extractName(r.reviewer) || null,
    reviewTitle: r.review_title ?? "Untitled Review",
    reviewPeriod: r.review_period ?? null,
    reviewDate: r.review_date ?? "",
    nextReviewDate: r.next_review_date ?? null,
    status: (toDisplay(r.status) || "Draft") as PerformanceReviewDto["status"],
    rating: (toDisplay(r.rating) || null) as PerformanceReviewDto["rating"],
    goalsSummary: r.goals_summary ?? null,
    strengths: r.strengths ?? null,
    improvementAreas: r.improvement_areas ?? null,
    managerComments: r.manager_comments ?? null,
    employeeComments: r.employee_comments ?? null,
    overallScore:
      r.overall_score == null
        ? null
        : typeof r.overall_score === "number"
          ? r.overall_score
          : Number(r.overall_score) || null,
    ratingScore: r.rating_score ?? null,
    isCompleted: r.is_completed ?? false,
  };
}

/* ------------------------------------------------------------------ */
/*  Payloads                                                           */
/* ------------------------------------------------------------------ */

function toDocumentPayload(cmd: CreateEmployeeDocumentCommand) {
  return {
    employee: cmd.employeeId,
    title: cmd.title,
    document_type: toBackendEnum(cmd.documentType) ?? "other",
    document_number: cmd.documentNumber ?? null,
    issue_date: cmd.issueDate ?? null,
    expiry_date: cmd.expiryDate ?? null,
    issuing_authority: cmd.issuingAuthority ?? null,
    document_url: cmd.documentUrl ?? null,
    notes: cmd.notes ?? null,
  };
}

function toReviewPayload(cmd: CreatePerformanceReviewCommand) {
  return {
    employee: cmd.employeeId,
    reviewer: cmd.reviewerId ?? null,
    review_title: cmd.reviewTitle,
    review_period: cmd.reviewPeriod ?? null,
    review_date: cmd.reviewDate,
    next_review_date: cmd.nextReviewDate ?? null,
    status: toBackendEnum(cmd.status) ?? "draft",
    rating: toBackendEnum(cmd.rating) ?? null,
    goals_summary: cmd.goalsSummary ?? null,
    strengths: cmd.strengths ?? null,
    improvement_areas: cmd.improvementAreas ?? null,
    manager_comments: cmd.managerComments ?? null,
    employee_comments: cmd.employeeComments ?? null,
    overall_score: cmd.overallScore ?? null,
  };
}

/* ------------------------------------------------------------------ */
/*  Document API                                                       */
/* ------------------------------------------------------------------ */

export async function listEmployeeDocuments(
  params?: { employeeId?: string },
): Promise<EmployeeDocumentDto[]> {
  const query = params?.employeeId ? `?employee=${params.employeeId}` : "";
  const { data } = await apiClient.get<
    { results?: BackendDocument[] } | BackendDocument[]
  >(`employee-documents${query}`);
  const records = Array.isArray(data) ? data : data.results ?? [];
  return records.map(mapDocument);
}

export async function createEmployeeDocument(
  cmd: CreateEmployeeDocumentCommand,
): Promise<EmployeeDocumentDto> {
  const { data } = await apiClient.post<BackendDocument>(
    "employee-documents",
    toDocumentPayload(cmd),
  );
  return mapDocument(data);
}

export async function updateEmployeeDocument(
  id: string,
  cmd: CreateEmployeeDocumentCommand,
): Promise<EmployeeDocumentDto> {
  const { data } = await apiClient.put<BackendDocument>(
    `employee-documents/${id}`,
    toDocumentPayload(cmd),
  );
  return mapDocument(data);
}

export async function deleteEmployeeDocument(id: string): Promise<void> {
  await apiClient.delete(`employee-documents/${id}`);
}

/* ------------------------------------------------------------------ */
/*  Performance Review API                                             */
/* ------------------------------------------------------------------ */

export async function listPerformanceReviews(
  params?: { employeeId?: string },
): Promise<PerformanceReviewDto[]> {
  const query = params?.employeeId ? `?employee=${params.employeeId}` : "";
  const { data } = await apiClient.get<
    { results?: BackendPerformanceReview[] } | BackendPerformanceReview[]
  >(`employee-performance-reviews${query}`);
  const records = Array.isArray(data) ? data : data.results ?? [];
  return records.map(mapReview);
}

export async function createPerformanceReview(
  cmd: CreatePerformanceReviewCommand,
): Promise<PerformanceReviewDto> {
  const { data } = await apiClient.post<BackendPerformanceReview>(
    "employee-performance-reviews",
    toReviewPayload(cmd),
  );
  return mapReview(data);
}

export async function updatePerformanceReview(
  id: string,
  cmd: CreatePerformanceReviewCommand,
): Promise<PerformanceReviewDto> {
  const { data } = await apiClient.put<BackendPerformanceReview>(
    `employee-performance-reviews/${id}`,
    toReviewPayload(cmd),
  );
  return mapReview(data);
}

export async function deletePerformanceReview(id: string): Promise<void> {
  await apiClient.delete(`employee-performance-reviews/${id}`);
}
