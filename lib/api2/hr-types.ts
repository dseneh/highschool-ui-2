/* ------------------------------------------------------------------ */
/*  Types for HR Documents & Performance Reviews                       */
/* ------------------------------------------------------------------ */

export type DocumentType =
  | "Contract"
  | "Identification"
  | "Certification"
  | "License"
  | "Permit"
  | "Other";

export type ComplianceStatus = "valid" | "expired" | "expiring_soon";

export interface EmployeeDocumentDto {
  id: string;
  employeeId: string;
  employeeName: string;
  title: string;
  documentType: DocumentType;
  documentNumber: string | null;
  issueDate: string | null;
  expiryDate: string | null;
  issuingAuthority: string | null;
  documentUrl: string | null;
  notes: string | null;
  complianceStatus: ComplianceStatus | null;
  daysUntilExpiry: number | null;
}

export interface CreateEmployeeDocumentCommand {
  employeeId: string;
  title: string;
  documentType: string;
  documentNumber?: string | null;
  issueDate?: string | null;
  expiryDate?: string | null;
  issuingAuthority?: string | null;
  documentUrl?: string | null;
  notes?: string | null;
}

export type ReviewStatus = "Draft" | "In Progress" | "Completed" | "Acknowledged";
export type ReviewRating =
  | "Needs Improvement"
  | "Meets Expectations"
  | "Exceeds Expectations"
  | "Outstanding";

export interface PerformanceReviewDto {
  id: string;
  employeeId: string;
  employeeName: string;
  reviewerId: string | null;
  reviewerName: string | null;
  reviewTitle: string;
  reviewPeriod: string | null;
  reviewDate: string;
  nextReviewDate: string | null;
  status: ReviewStatus;
  rating: ReviewRating | null;
  goalsSummary: string | null;
  strengths: string | null;
  improvementAreas: string | null;
  managerComments: string | null;
  employeeComments: string | null;
  overallScore: number | null;
  ratingScore: number | null;
  isCompleted: boolean;
}

export interface CreatePerformanceReviewCommand {
  employeeId: string;
  reviewerId?: string | null;
  reviewTitle: string;
  reviewPeriod?: string | null;
  reviewDate: string;
  nextReviewDate?: string | null;
  status: string;
  rating?: string | null;
  goalsSummary?: string | null;
  strengths?: string | null;
  improvementAreas?: string | null;
  managerComments?: string | null;
  employeeComments?: string | null;
  overallScore?: number | null;
}
