export interface EmployeeDocumentDto {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeNumber: string | null;
  title: string;
  documentType: string;
  documentNumber: string | null;
  issueDate: string | null;
  expiryDate: string | null;
  issuingAuthority: string | null;
  documentUrl: string | null;
  notes: string | null;
  complianceStatus: string;
  daysUntilExpiry: number | null;
  active: boolean;
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
  active?: boolean;
}

export interface ListEmployeeDocumentsParams {
  employeeId?: string;
  documentType?: string;
  complianceStatus?: string;
  search?: string;
}
