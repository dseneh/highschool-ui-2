export interface EmployeeWorkflowTaskDto {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeNumber: string | null;
  assignedToId: string | null;
  assignedToName: string | null;
  workflowType: string;
  category: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  status: string;
  completedAt: string | null;
  notes: string | null;
  isOverdue: boolean;
  active: boolean;
}

export interface CreateEmployeeWorkflowTaskCommand {
  employeeId: string;
  assignedToId?: string | null;
  workflowType: string;
  category: string;
  title: string;
  description?: string | null;
  dueDate?: string | null;
  status: string;
  notes?: string | null;
  active?: boolean;
}

export interface ListEmployeeWorkflowTaskParams {
  employeeId?: string;
  workflowType?: string;
  status?: string;
  category?: string;
  search?: string;
}
