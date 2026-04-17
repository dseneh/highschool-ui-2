import apiClient from "@/lib/api2/client";
import type {
  CreateEmployeePerformanceReviewCommand,
  EmployeePerformanceReviewDto,
  ListEmployeePerformanceReviewParams,
} from "./employee-performance-review-types";

interface BackendLookup {
  id?: string;
  full_name?: string;
  employee_number?: string;
}

interface BackendEmployeePerformanceReview {
  id?: string;
  employee?: string | BackendLookup | null;
  reviewer?: string | BackendLookup | null;
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
  overall_score?: number | null;
  rating_score?: number | null;
  is_completed?: boolean;
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

function mapReview(data: BackendEmployeePerformanceReview): EmployeePerformanceReviewDto {
  const employee = typeof data.employee === "object" && data.employee ? data.employee : null;
  const reviewer = typeof data.reviewer === "object" && data.reviewer ? data.reviewer : null;

  return {
    id: data.id ?? "",
    employeeId: employee?.id ?? "",
    employeeName: employee?.full_name ?? "Unknown Employee",
    employeeNumber: employee?.employee_number ?? null,
    reviewerId: reviewer?.id ?? null,
    reviewerName: reviewer?.full_name ?? null,
    reviewTitle: data.review_title ?? "",
    reviewPeriod: data.review_period ?? null,
    reviewDate: data.review_date ?? "",
    nextReviewDate: data.next_review_date ?? null,
    status: toDisplayValue(data.status) || "Draft",
    rating: toDisplayValue(data.rating) || "Meets Expectations",
    goalsSummary: data.goals_summary ?? null,
    strengths: data.strengths ?? null,
    improvementAreas: data.improvement_areas ?? null,
    managerComments: data.manager_comments ?? null,
    employeeComments: data.employee_comments ?? null,
    overallScore: data.overall_score ?? null,
    ratingScore: data.rating_score ?? 0,
    isCompleted: data.is_completed ?? false,
    active: data.active ?? true,
  };
}

function toPayload(payload: CreateEmployeePerformanceReviewCommand) {
  return {
    employee: payload.employeeId,
    reviewer: payload.reviewerId || null,
    review_title: payload.reviewTitle,
    review_period: payload.reviewPeriod ?? null,
    review_date: payload.reviewDate,
    next_review_date: payload.nextReviewDate || null,
    status: toBackendEnum(payload.status) ?? "draft",
    rating: toBackendEnum(payload.rating) ?? "meets_expectations",
    goals_summary: payload.goalsSummary ?? null,
    strengths: payload.strengths ?? null,
    improvement_areas: payload.improvementAreas ?? null,
    manager_comments: payload.managerComments ?? null,
    employee_comments: payload.employeeComments ?? null,
    overall_score: payload.overallScore ?? null,
    active: payload.active ?? true,
  };
}

function mapListParams(params?: ListEmployeePerformanceReviewParams) {
  if (!params) return undefined;

  return {
    employee: params.employeeId,
    status: toBackendEnum(params.status),
    rating: toBackendEnum(params.rating),
    search: params.search,
  };
}

export async function listEmployeePerformanceReviews(
  params?: ListEmployeePerformanceReviewParams
): Promise<EmployeePerformanceReviewDto[]> {
  const { data } = await apiClient.get<
    { results?: BackendEmployeePerformanceReview[] } | BackendEmployeePerformanceReview[]
  >("employee-performance-reviews", { params: mapListParams(params) });
  const records = Array.isArray(data) ? data : data.results ?? [];
  return records.map(mapReview);
}

export async function createEmployeePerformanceReview(
  payload: CreateEmployeePerformanceReviewCommand
): Promise<EmployeePerformanceReviewDto> {
  const { data } = await apiClient.post<BackendEmployeePerformanceReview>(
    "employee-performance-reviews",
    toPayload(payload)
  );
  return mapReview(data);
}

export async function updateEmployeePerformanceReview(
  id: string,
  payload: CreateEmployeePerformanceReviewCommand
): Promise<EmployeePerformanceReviewDto> {
  const { data } = await apiClient.put<BackendEmployeePerformanceReview>(
    `employee-performance-reviews/${id}`,
    toPayload(payload)
  );
  return mapReview(data);
}

export async function deleteEmployeePerformanceReview(id: string): Promise<void> {
  await apiClient.delete(`employee-performance-reviews/${id}`);
}
