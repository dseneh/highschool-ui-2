export interface EmployeeAttendanceDto {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeNumber: string | null;
  attendanceDate: string;
  status: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  hoursWorked: number;
  notes: string | null;
}

export interface CreateEmployeeAttendanceCommand {
  employeeId: string;
  attendanceDate: string;
  status: string;
  checkInTime?: string | null;
  checkOutTime?: string | null;
  notes?: string | null;
}

export interface ListEmployeeAttendanceParams {
  employeeId?: string;
  status?: string;
  attendanceDate?: string;
  search?: string;
}
