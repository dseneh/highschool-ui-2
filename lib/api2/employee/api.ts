"use client";
import { useAxiosAuth } from '@/hooks/use-axios-auth'

export const useEmployeeApi = () => {
    const { get, post, put, patch, delete: del } = useAxiosAuth()

    // Employee CRUD
    const getEmployeesApi = async (query?: any) => {
        return get(`/employees/`, { params: query })
    }

    const getEmployeeApi = async (id: string) => {
        return get(`/employees/${id}/`)
    }

    const createEmployeeApi = async (data: any) => {
        return post(`/employees/`, data)
    }

    const updateEmployeeApi = async (id: string, data: any) => {
        return put(`/employees/${id}/`, data)
    }

    const patchEmployeeApi = async (id: string, data: any) => {
        return patch(`/employees/${id}/`, data)
    }

    const deleteEmployeeApi = async (id: string) => {
        return del(`/employees/${id}/`)
    }

    // Employee Department endpoints
    const getEmployeeDepartmentsApi = async (query?: any) => {
        return get(`/employee-departments/`, { params: query })
    }

    const getEmployeeDepartmentApi = async (id: string) => {
        return get(`/employee-departments/${id}/`)
    }

    const createEmployeeDepartmentApi = async (data: any) => {
        return post(`/employee-departments/`, data)
    }

    const updateEmployeeDepartmentApi = async (id: string, data: any) => {
        return put(`/employee-departments/${id}/`, data)
    }

    const patchEmployeeDepartmentApi = async (id: string, data: any) => {
        return patch(`/employee-departments/${id}/`, data)
    }

    const deleteEmployeeDepartmentApi = async (id: string) => {
        return del(`/employee-departments/${id}/`)
    }

    // Employee Position endpoints
    const getEmployeePositionsApi = async (query?: any) => {
        return get(`/employee-positions/`, { params: query })
    }

    const getEmployeePositionApi = async (id: string) => {
        return get(`/employee-positions/${id}/`)
    }

    const createEmployeePositionApi = async (data: any) => {
        return post(`/employee-positions/`, data)
    }

    const updateEmployeePositionApi = async (id: string, data: any) => {
        return put(`/employee-positions/${id}/`, data)
    }

    const patchEmployeePositionApi = async (id: string, data: any) => {
        return patch(`/employee-positions/${id}/`, data)
    }

    const deleteEmployeePositionApi = async (id: string) => {
        return del(`/employee-positions/${id}/`)
    }

    return {
        // Employee
        getEmployeesApi,
        getEmployeeApi,
        createEmployeeApi,
        updateEmployeeApi,
        patchEmployeeApi,
        deleteEmployeeApi,
        // Employee Department
        getEmployeeDepartmentsApi,
        getEmployeeDepartmentApi,
        createEmployeeDepartmentApi,
        updateEmployeeDepartmentApi,
        patchEmployeeDepartmentApi,
        deleteEmployeeDepartmentApi,
        // Employee Position
        getEmployeePositionsApi,
        getEmployeePositionApi,
        createEmployeePositionApi,
        updateEmployeePositionApi,
        patchEmployeePositionApi,
        deleteEmployeePositionApi,
    }
}

export type UseEmployeeApiReturn = ReturnType<typeof useEmployeeApi>
