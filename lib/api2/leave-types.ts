export interface LeaveTypeDto {
  id: string;
  name: string;
  code: string | null;
  description: string | null;
  defaultDays: number;
  requiresApproval: boolean;
  accrualFrequency: string;
  allowCarryover: boolean;
  maxCarryoverDays: number;
  active: boolean;
}

export interface LeaveRequestDto {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeNumber: string | null;
  leaveTypeId: string;
  leaveTypeName: string;
  leaveTypeCode: string | null;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string | null;
  status: string;
  reviewedAt: string | null;
  reviewNote: string | null;
}

export interface CreateLeaveTypeCommand {
  name: string;
  code?: string | null;
  description?: string | null;
  defaultDays: number;
  requiresApproval: boolean;
  accrualFrequency: string;
  allowCarryover: boolean;
  maxCarryoverDays: number;
}

export interface CreateLeaveRequestCommand {
  employeeId: string;
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  reason?: string | null;
}

export interface LeaveDecisionCommand {
  note?: string | null;
}

export interface ListLeaveRequestParams {
  status?: string;
  employeeId?: string;
  leaveTypeId?: string;
  search?: string;
}
