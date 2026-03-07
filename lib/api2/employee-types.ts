/* ------------------------------------------------------------------ */
/*  Types generated from the Employee API Swagger spec                 */
/*  Base URL: /api/v1/employees                                        */
/* ------------------------------------------------------------------ */

/** Shared address sub-object */
export interface Address {
  street: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
}

/** Emergency / related contact */
export interface ContactDto {
  id: string;
  contactType: string | null;
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string | null;
  email: string | null;
  relationship: string | null;
  isPrimary: boolean;
}

/** Dependent (child, spouse, etc.) */
export interface DependentDto {
  id: string;
  firstName: string | null;
  lastName: string | null;
  dateOfBirth: string; // ISO 8601
  relationship: string | null;
  gender: string | null;
  nationalId: string | null;
  photoUrl: string | null;
  hasPhoto: boolean;
}

/** Full employee representation returned by the API */
export interface EmployeeDto {
  id: string;
  employeeNumber: string | null;
  firstName: string | null;
  lastName: string | null;
  middleName: string | null;
  fullName: string | null; // read-only, computed by the API
  email: string | null;
  phoneNumber: string | null;
  dateOfBirth: string; // ISO 8601
  gender: string | null;
  nationalId: string | null;
  passportNumber: string | null;
  hireDate: string; // ISO 8601
  terminationDate: string | null;
  employmentStatus: string | null;
  departmentId: string | null;
  positionId: string | null;
  managerId: string | null;
  jobTitle: string | null;
  employmentType: string | null;
  photoUrl: string | null;
  hasPhoto: boolean;
  contacts: ContactDto[] | null;
  dependents: DependentDto[] | null;
}

/** POST /Employees - body */
export interface CreateEmployeeCommand {
  employeeNumber: string | null;
  firstName: string | null;
  lastName: string | null;
  middleName: string | null;
  email: string | null;
  phoneNumber: string | null;
  dateOfBirth: string;
  gender: string | null;
  nationalId: string | null;
  passportNumber: string | null;
  address: Address | null;
  hireDate: string;
  departmentId: string | null;
  positionId: string | null;
  managerId: string | null;
  jobTitle: string | null;
  employmentType: string | null;
  createdBy: string | null;
}

/** PUT /Employees/{id} - body */
export interface UpdateEmployeeCommand {
  employeeId: string;
  firstName: string | null;
  lastName: string | null;
  middleName: string | null;
  email: string | null;
  phoneNumber: string | null;
  dateOfBirth: string;
  gender: string | null;
  nationalId: string | null;
  passportNumber: string | null;
  address: Address | null;
  departmentId: string | null;
  positionId: string | null;
  managerId: string | null;
  jobTitle: string | null;
  employmentType: string | null;
  modifiedBy: string | null;
}

/** POST /Employees/{id}/terminate - body */
export interface TerminateEmployeeCommand {
  employeeId: string;
  terminationDate: string;
  modifiedBy: string | null;
}

/** POST /Employees/{id}/contacts - body */
export interface AddContactCommand {
  employeeId: string;
  contactType: string | null;
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string | null;
  email: string | null;
  relationship: string | null;
  address: Address | null;
  isPrimary: boolean;
  createdBy: string | null;
}

/** POST /Employees/{id}/dependents - body */
export interface AddDependentCommand {
  employeeId: string;
  firstName: string | null;
  lastName: string | null;
  dateOfBirth: string;
  relationship: string | null;
  gender: string | null;
  nationalId: string | null;
  createdBy: string | null;
}

/** Standard error response from the API */
export interface ProblemDetails {
  type?: string | null;
  title?: string | null;
  status?: number | null;
  detail?: string | null;
  instance?: string | null;
  [key: string]: unknown;
}

/* ------------------------------------------------------------------ */
/*  Query parameter types                                              */
/* ------------------------------------------------------------------ */

export interface ListEmployeesParams {
  departmentId?: string;
  employmentStatus?: string;
  pageNumber?: number;
  pageSize?: number;
}
