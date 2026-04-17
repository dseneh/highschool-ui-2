"use client";
import type { EmployeeDto } from './types';
import { useApiMutation, useApiQuery } from '../utils';
import { useEmployeeApi } from './api';

export function useEmployee() {
    /* eslint-disable react-hooks/rules-of-hooks */
    const api = useEmployeeApi()

    // Employee hooks
    const getEmployees = (query: any, options = {}) =>
        useApiQuery(
            ['employees', query],
            () => api.getEmployeesApi(query).then((res: any) => res.data),
            options,
        )

    const getEmployeeMember = (employeeId: string, options = {}) =>
        useApiQuery(
            ['employees', employeeId],
            () => api.getEmployeeApi(employeeId).then((res: any) => res.data as EmployeeDto),
            options,
        )

    const createEmployee = (options = {}) =>
        useApiMutation(
            (data: any) => api.createEmployeeApi(data).then((res: any) => res.data),
            options,
        )

    const updateEmployee = (employeeId: string, options = {}) =>
        useApiMutation(
            (data: any) =>
                api.updateEmployeeApi(employeeId, data).then((res: any) => res.data),
            options,
        )

    const patchEmployee = (employeeId: string, options = {}) =>
        useApiMutation(
            (data: any) =>
                api.patchEmployeeApi(employeeId, data).then((res: any) => res.data),
            options,
        )

    const deleteEmployee = (employeeId: string, options = {}) =>
        useApiMutation(
            () => api.deleteEmployeeApi(employeeId).then((res: any) => res.data),
            options,
        )

    // Employee Department hooks
    const getEmployeeDepartments = (query: any, options = {}) =>
        useApiQuery(
            ['employee-departments', query],
            () => api.getEmployeeDepartmentsApi(query).then((res: any) => res.data),
            options,
        )

    const getEmployeeDepartment = (departmentId: string, options = {}) =>
        useApiQuery(
            ['employee-departments', departmentId],
            () => api.getEmployeeDepartmentApi(departmentId).then((res: any) => res.data),
            options,
        )

    const createEmployeeDepartment = (options = {}) =>
        useApiMutation(
            (data: any) => api.createEmployeeDepartmentApi(data).then((res: any) => res.data),
            options,
        )

    const updateEmployeeDepartment = (departmentId: string, options = {}) =>
        useApiMutation(
            (data: any) =>
                api.updateEmployeeDepartmentApi(departmentId, data).then((res: any) => res.data),
            options,
        )

    const patchEmployeeDepartment = (departmentId: string, options = {}) =>
        useApiMutation(
            (data: any) =>
                api.patchEmployeeDepartmentApi(departmentId, data).then((res: any) => res.data),
            options,
        )

    const deleteEmployeeDepartment = (departmentId: string, options = {}) =>
        useApiMutation(
            () => api.deleteEmployeeDepartmentApi(departmentId).then((res: any) => res.data),
            options,
        )

    // Employee Position hooks
    const getEmployeePositions = (query: any, options = {}) =>
        useApiQuery(
            ['employee-positions', query],
            () => api.getEmployeePositionsApi(query).then((res: any) => res.data),
            options,
        )

    const getEmployeePosition = (positionId: string, options = {}) =>
        useApiQuery(
            ['employee-positions', positionId],
            () => api.getEmployeePositionApi(positionId).then((res: any) => res.data),
            options,
        )

    const createEmployeePosition = (options = {}) =>
        useApiMutation(
            (data: any) => api.createEmployeePositionApi(data).then((res: any) => res.data),
            options,
        )

    const updateEmployeePosition = (positionId: string, options = {}) =>
        useApiMutation(
            (data: any) =>
                api.updateEmployeePositionApi(positionId, data).then((res: any) => res.data),
            options,
        )

    const patchEmployeePosition = (positionId: string, options = {}) =>
        useApiMutation(
            (data: any) =>
                api.patchEmployeePositionApi(positionId, data).then((res: any) => res.data),
            options,
        )

    const deleteEmployeePosition = (positionId: string, options = {}) =>
        useApiMutation(
            () => api.deleteEmployeePositionApi(positionId).then((res: any) => res.data),
            options,
        )

    return {
        // Employee
        getEmployees,
        getEmployeeMember,
        createEmployee,
        updateEmployee,
        patchEmployee,
        deleteEmployee,
        // Employee Department
        getEmployeeDepartments,
        getEmployeeDepartment,
        createEmployeeDepartment,
        updateEmployeeDepartment,
        patchEmployeeDepartment,
        deleteEmployeeDepartment,
        // Employee Position
        getEmployeePositions,
        getEmployeePosition,
        createEmployeePosition,
        updateEmployeePosition,
        patchEmployeePosition,
        deleteEmployeePosition,
    }
}
