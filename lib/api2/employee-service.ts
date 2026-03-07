import apiClient from "@/lib/api2/client";
import type {
  EmployeeDto,
  CreateEmployeeCommand,
  UpdateEmployeeCommand,
  TerminateEmployeeCommand,
  AddContactCommand,
  AddDependentCommand,
  ListEmployeesParams,
} from "./employee-types";

/* ------------------------------------------------------------------ */
/*  Employee CRUD                                                      */
/* ------------------------------------------------------------------ */

/** GET /Employees */
export async function listEmployees(
  _subdomain: string,
  params?: ListEmployeesParams
) {
  const { data } = await apiClient.get<EmployeeDto[]>("Employees", { params });
  return data;
}

/** GET /Employees/{id} */
export async function getEmployee(_subdomain: string, id: string) {
  const { data } = await apiClient.get<EmployeeDto>(`Employees/${id}`);
  return data;
}

/** GET /Employees/number/{employeeNumber} */
export async function getEmployeeByNumber(
  _subdomain: string,
  employeeNumber: string
) {
  const { data } = await apiClient.get<EmployeeDto>(
    `Employees/number/${employeeNumber}`
  );
  return data;
}

/** POST /Employees */
export async function createEmployee(
  _subdomain: string,
  payload: CreateEmployeeCommand
) {
  const { data } = await apiClient.post<string>("Employees", payload);
  return data;
}

/** PUT /Employees/{id} */
export async function updateEmployee(
  _subdomain: string,
  id: string,
  payload: UpdateEmployeeCommand
) {
  await apiClient.put(`Employees/${id}`, payload);
}

/** DELETE /Employees/{id} */
export async function deleteEmployee(_subdomain: string, id: string) {
  await apiClient.delete(`Employees/${id}`);
}

/** POST /Employees/{id}/terminate */
export async function terminateEmployee(
  _subdomain: string,
  id: string,
  payload: TerminateEmployeeCommand
) {
  await apiClient.post(`Employees/${id}/terminate`, payload);
}

/* ------------------------------------------------------------------ */
/*  Contacts                                                           */
/* ------------------------------------------------------------------ */

/** POST /Employees/{id}/contacts */
export async function addContact(
  _subdomain: string,
  employeeId: string,
  payload: AddContactCommand
) {
  const { data } = await apiClient.post<string>(
    `Employees/${employeeId}/contacts`,
    payload
  );
  return data;
}

/* ------------------------------------------------------------------ */
/*  Dependents                                                         */
/* ------------------------------------------------------------------ */

/** POST /Employees/{id}/dependents */
export async function addDependent(
  _subdomain: string,
  employeeId: string,
  payload: AddDependentCommand
) {
  const { data } = await apiClient.post<string>(
    `Employees/${employeeId}/dependents`,
    payload
  );
  return data;
}

/* ------------------------------------------------------------------ */
/*  Photo                                                              */
/* ------------------------------------------------------------------ */

/** POST /Employees/{id}/photo */
export async function uploadEmployeePhoto(
  _subdomain: string,
  employeeId: string,
  file: File
) {
  const form = new FormData();
  form.append("file", file);
  await apiClient.post(`Employees/${employeeId}/photo`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

/** GET /Employees/{id}/photo  -> blob URL */
export async function getEmployeePhoto(
  _subdomain: string,
  employeeId: string
): Promise<string | null> {
  try {
    const { data } = await apiClient.get(`Employees/${employeeId}/photo`, {
      responseType: "blob",
    });
    return URL.createObjectURL(data);
  } catch {
    return null;
  }
}

/** DELETE /Employees/{id}/photo */
export async function deleteEmployeePhoto(
  _subdomain: string,
  employeeId: string
) {
  await apiClient.delete(`Employees/${employeeId}/photo`);
}
