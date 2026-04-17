export interface EmployeePerformanceReviewDto {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeNumber: string | null;
  reviewerId: string | null;
  reviewerName: string | null;
  reviewTitle: string;
  reviewPeriod: string | null;
  reviewDate: string;
  nextReviewDate: string | null;
  status: string;
  rating: string;
  goalsSummary: string | null;
  strengths: string | null;
  improvementAreas: string | null;
  managerComments: string | null;
  employeeComments: string | null;
  overallScore: number | null;
  ratingScore: number;
  isCompleted: boolean;
  active: boolean;
}

export interface CreateEmployeePerformanceReviewCommand {
  employeeId: string;
  reviewerId?: string | null;
  reviewTitle: string;
  reviewPeriod?: string | null;
  reviewDate: string;
  nextReviewDate?: string | null;
  status: string;
  rating: string;
  goalsSummary?: string | null;
  strengths?: string | null;
  improvementAreas?: string | null;
  managerComments?: string | null;
  employeeComments?: string | null;
  overallScore?: number | null;
  active?: boolean;
}

export interface ListEmployeePerformanceReviewParams {
  employeeId?: string;
  status?: string;
  rating?: string;
  search?: string;
}
