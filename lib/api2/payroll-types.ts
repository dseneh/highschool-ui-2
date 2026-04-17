export interface PayrollComponentDto {
  id: string;
  name: string;
  code: string | null;
  description: string | null;
  componentType: string;
  calculationMethod: string;
  defaultValue: number;
  taxable: boolean;
  active: boolean;
}

export interface CompensationItemInput {
  componentId: string;
  overrideValue?: number | null;
}

export interface EmployeeCompensationItemDto {
  id: string;
  componentId: string;
  componentName: string;
  componentCode: string | null;
  componentType: string;
  calculationMethod: string;
  overrideValue: number | null;
  amount: number;
}

export interface EmployeeCompensationDto {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeNumber: string | null;
  baseSalary: number;
  currency: string;
  paymentFrequency: string;
  effectiveDate: string;
  notes: string | null;
  items: EmployeeCompensationItemDto[];
  grossPay: number;
  totalDeductions: number;
  netPay: number;
  active: boolean;
}

export interface PayrollRunDto {
  id: string;
  name: string;
  runDate: string;
  periodStart: string | null;
  periodEnd: string | null;
  paymentDate: string | null;
  status: string;
  currency: string;
  notes: string | null;
  employeeCount: number;
  grossPay: number;
  totalDeductions: number;
  netPay: number;
  active: boolean;
}

export interface CreatePayrollRunCommand {
  name: string;
  runDate: string;
  periodStart?: string | null;
  periodEnd?: string | null;
  paymentDate?: string | null;
  status: string;
  currency: string;
  notes?: string | null;
}

export interface CreatePayrollComponentCommand {
  name: string;
  code?: string | null;
  description?: string | null;
  componentType: string;
  calculationMethod: string;
  defaultValue: number;
  taxable: boolean;
}

export interface CreateEmployeeCompensationCommand {
  employeeId: string;
  baseSalary: number;
  currency: string;
  paymentFrequency: string;
  effectiveDate: string;
  notes?: string | null;
  items?: CompensationItemInput[];
}
