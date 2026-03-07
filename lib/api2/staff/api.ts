"use client";
import { useAxiosAuth } from '@/hooks/use-axios-auth'

export const useStaffApi = () => {
    const { get, post, put, patch, delete: del } = useAxiosAuth() 

    const getStaffApi = async (query?: any) => {
        return get(`/staff/`, { params: query })
    }

    const getStaffMemberApi = async (id: string) => {
        return get(`/staff/${id}/`)
    }

    const createStaffApi = async (data: any) => {
        return post(`/staff/`, data)
    }

    const updateStaffApi = async (id: string, data: any) => {
        return put(`/staff/${id}/`, data)
    }

    const patchStaffApi = async (id: string, data: any) => {
        return patch(`/staff/${id}/`, data)
    }

    const deleteStaffApi = async (id: string) => {
        return del(`/staff/${id}/`)
    }

    // Teachers endpoint
    const getTeachersApi = async (query?: any) => {
        return get(`/staff/teachers/`, { params: query })
    }

    // Position endpoints
    const getPositionsApi = async (query?: any) => {
        return get(`/positions/`, { params: query })
    }

    const getPositionApi = async (id: string) => {
        return get(`/positions/${id}/`)
    }

    const createPositionApi = async (data: any) => {
        return post(`/positions/`, data)
    }

    const updatePositionApi = async (id: string, data: any) => {
        return put(`/positions/${id}/`, data)
    }

    const patchPositionApi = async (id: string, data: any) => {
        return patch(`/positions/${id}/`, data)
    }

    const deletePositionApi = async (id: string) => {
        return del(`/positions/${id}/`)
    }

    // Department endpoints
    const getDepartmentsApi = async (query?: any) => {
        return get(`/departments/`, { params: query })
    }

    const getDepartmentApi = async (id: string) => {
        return get(`/departments/${id}/`)
    }

    const createDepartmentApi = async (data: any) => {
        return post(`/departments/`, data)
    }

    const updateDepartmentApi = async (id: string, data: any) => {
        return put(`/departments/${id}/`, data)
    }

    const patchDepartmentApi = async (id: string, data: any) => {
        return patch(`/departments/${id}/`, data)
    }

    const deleteDepartmentApi = async (id: string) => {
        return del(`/departments/${id}/`)
    }

    // Position Category endpoints
    const getPositionCategoriesApi = async (query?: any) => {
        return get(`/position-categories/`, { params: query })
    }

    const getPositionCategoryApi = async (id: string) => {
        return get(`/position-categories/${id}/`)
    }

    const createPositionCategoryApi = async (data: any) => {
        return post(`/position-categories/`, data)
    }

    const updatePositionCategoryApi = async (id: string, data: any) => {
        return put(`/position-categories/${id}/`, data)
    }

    const patchPositionCategoryApi = async (id: string, data: any) => {
        return patch(`/position-categories/${id}/`, data)
    }

    const deletePositionCategoryApi = async (id: string) => {
        return del(`/position-categories/${id}/`)
    }

    // Teacher Schedule endpoints (no school_id needed)
    const getTeacherSchedulesApi = async (query?: any) => {
        return get(`/teacher-schedules/`, { params: query })
    }

    const getTeacherScheduleApi = async (id: string) => {
        return get(`/teacher-schedules/${id}/`)
    }

    const createTeacherScheduleApi = async (data: any) => {
        return post(`/teacher-schedules/`, data)
    }

    const updateTeacherScheduleApi = async (id: string, data: any) => {
        return put(`/teacher-schedules/${id}/`, data)
    }

    const patchTeacherScheduleApi = async (id: string, data: any) => {
        return patch(`/teacher-schedules/${id}/`, data)
    }

    const deleteTeacherScheduleApi = async (id: string) => {
        return del(`/teacher-schedules/${id}/`)
    }

    // Teacher Section endpoints (no school_id needed)
    const getTeacherSectionsApi = async (query?: any) => {
        return get(`/teacher-sections/`, { params: query })
    }

    const getTeacherSectionApi = async (id: string) => {
        return get(`/teacher-sections/${id}/`)
    }

    const createTeacherSectionApi = async (data: any) => {
        return post(`/teacher-sections/`, data)
    }

    const updateTeacherSectionApi = async (id: string, data: any) => {
        return put(`/teacher-sections/${id}/`, data)
    }

    const patchTeacherSectionApi = async (id: string, data: any) => {
        return patch(`/teacher-sections/${id}/`, data)
    }

    const deleteTeacherSectionApi = async (id: string) => {
        return del(`/teacher-sections/${id}/`)
    }

    // Teacher Subject endpoints (no school_id needed)
    const getTeacherSubjectsApi = async (query?: any) => {
        return get(`/teacher-subjects/`, { params: query })
    }

    const getTeacherSubjectApi = async (id: string) => {
        return get(`/teacher-subjects/${id}/`)
    }

    const createTeacherSubjectApi = async (data: any) => {
        return post(`/teacher-subjects/`, data)
    }

    const updateTeacherSubjectApi = async (id: string, data: any) => {
        return put(`/teacher-subjects/${id}/`, data)
    }

    const patchTeacherSubjectApi = async (id: string, data: any) => {
        return patch(`/teacher-subjects/${id}/`, data)
    }

    const deleteTeacherSubjectApi = async (id: string) => {
        return del(`/teacher-subjects/${id}/`)
    }

        return {
        // Staff
        getStaffMemberApi,
        getStaffApi,
        createStaffApi,
        updateStaffApi,
        patchStaffApi,
        deleteStaffApi,
        getTeachersApi,
        // Position
        getPositionApi,
        getPositionsApi,
        createPositionApi,
        updatePositionApi,
        patchPositionApi,
        deletePositionApi,
        // Department
        getDepartmentApi,
        getDepartmentsApi,
        createDepartmentApi,
        updateDepartmentApi,
        patchDepartmentApi,
        deleteDepartmentApi,
        // Position Category
        getPositionCategoryApi,
        getPositionCategoriesApi,
        createPositionCategoryApi,
        updatePositionCategoryApi,
        patchPositionCategoryApi,
        deletePositionCategoryApi,
        // Teacher Schedule
        getTeacherScheduleApi,
        getTeacherSchedulesApi,
        createTeacherScheduleApi,
        updateTeacherScheduleApi,
        patchTeacherScheduleApi,
        deleteTeacherScheduleApi,
        // Teacher Section
        getTeacherSectionApi,
        getTeacherSectionsApi,
        createTeacherSectionApi,
        updateTeacherSectionApi,
        patchTeacherSectionApi,
        deleteTeacherSectionApi,
        // Teacher Subject
        getTeacherSubjectApi,
        getTeacherSubjectsApi,
        createTeacherSubjectApi,
        updateTeacherSubjectApi,
        patchTeacherSubjectApi,
        deleteTeacherSubjectApi,
    }
}

// Add explicit return type for useStaffApi
export type UseStaffApiReturn = ReturnType<typeof useStaffApi>
