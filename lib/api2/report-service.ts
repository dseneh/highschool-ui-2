import apiClient from "@/lib/api2/client";

export type StudentIndividualReportType = "bio" | "financial" | "full";
export type StudentListReportFormat = "xlsx";
export type StudentIndividualReportFormat = "csv" | "json";

export interface StudentListReportBackgroundResult {
  kind: "background";
  taskId: string;
  status: string;
  message: string;
  estimatedRecords?: number;
  checkStatusUrl?: string;
}

export interface StudentListReportDownloadResult {
  kind: "download";
  blob: Blob;
  filename?: string;
}

export type StudentListReportResult =
  | StudentListReportBackgroundResult
  | StudentListReportDownloadResult;

export interface StudentListReportParams {
  search?: string;
  status?: string;
  grade_level?: string;
  section?: string;
  academic_year_id?: string;
  gender?: string;
  balance_owed?: string;
  balance_condition?: string;
  balance_min?: string;
  balance_max?: string;
  include_billing?: string;
  show_rank?: string;
  show_grade_average?: string;
  ordering?: string;
}

function extractFilename(contentDisposition?: string): string | undefined {
  if (!contentDisposition) return undefined;
  const match = contentDisposition.match(/filename="?([^";]+)"?/i);
  return match?.[1];
}

async function parseBlobJson(blob: Blob): Promise<unknown> {
  const text = await blob.text();
  return text ? JSON.parse(text) : null;
}

/** GET /reports/students/?file_format=xlsx */
export async function downloadStudentsListReport(
  subdomain: string,
  params: StudentListReportParams = {},
  format: StudentListReportFormat = "xlsx",
  options?: {
    background?: boolean;
    forceSync?: boolean;
    autoBackground?: boolean;
  }
): Promise<StudentListReportResult> {
  const { background = false, forceSync = false, autoBackground = true } = options ?? {};

  const response = await apiClient.get("reports/students", {
    params: {
      ...params,
      file_format: format,
      ...(background ? { background: "true" } : {}),
      ...(forceSync ? { force_sync: "true" } : {}),
    },
    headers: subdomain ? { "x-tenant": subdomain } : undefined,
    responseType: "blob",
    validateStatus: (status) => status < 500,
  });

  const { data, status, headers } = response;

  if (status === 202) {
    const payload = await parseBlobJson(data as Blob) as {
      task_id: string;
      status: string;
      message: string;
      estimated_records?: number;
      check_status_url?: string;
    };

    return {
      kind: "background",
      taskId: payload.task_id,
      status: payload.status,
      message: payload.message,
      estimatedRecords: payload.estimated_records,
      checkStatusUrl: payload.check_status_url,
    };
  }

  if (status === 413 && autoBackground && !background) {
    return downloadStudentsListReport(subdomain, params, format, {
      background: true,
      forceSync,
      autoBackground: false,
    });
  }

  if (status >= 400) {
    try {
      const payload = await parseBlobJson(data as Blob) as { detail?: string };
      throw new Error(payload?.detail || "Failed to export student report");
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to export student report");
    }
  }

  return {
    kind: "download",
    blob: data as Blob,
    filename: extractFilename(headers["content-disposition"] as string | undefined),
  };
}

/** GET /reports/students/{studentId}/?report_type=...&file_format=... */
export async function downloadStudentIndividualReport(
  subdomain: string,
  studentId: string,
  options: {
    reportType: StudentIndividualReportType;
    format?: StudentIndividualReportFormat;
    academicYearId?: string;
  }
): Promise<Blob> {
  const { reportType, format = "json", academicYearId } = options;

  const { data } = await apiClient.get(`reports/students/${studentId}`, {
    params: {
      report_type: reportType,
      file_format: format,
      academic_year_id: academicYearId,
    },
    headers: subdomain ? { "x-tenant": subdomain } : undefined,
    responseType: "blob",
  });

  return data;
}
