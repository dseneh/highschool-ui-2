"use client";
import { useAxiosAuth } from '@/hooks/use-axios-auth'

/**
 * Attendance API (New for backend-v2)
 * All endpoints use /api/v1/students/attendance/ prefix
 * Tenant is determined by X-Tenant header (no workspace in URL)
 */
export const useAttendanceApi = () => {
    const { get, post, put, patch, delete: del } = useAxiosAuth()
    const baseUrl = '/students/attendance'

    // List attendance records with query parameters
    const getAttendanceApi = async (query?: any) => {
        return get(`${baseUrl}/`, { params: query })
    }

    // Get attendance for a specific enrollment
    const getEnrollmentAttendanceApi = async (enrollmentId: string, query?: any) => {
        return get(`${baseUrl}/`, { 
            params: { ...query, enrollment_id: enrollmentId } 
        })
    }

    // Get single attendance record by ID
    const getAttendanceRecordApi = async (id: string) => {
        return get(`${baseUrl}/${id}/`)
    }

    // Create new attendance record
    const createAttendanceApi = async (data: any) => {
        return post(`${baseUrl}/`, data)
    }

    // Update attendance record (full update)
    const editAttendanceApi = async (id: string, data: any) => {
        return put(`${baseUrl}/${id}/`, data)
    }

    // Partial update attendance record
    const patchAttendanceApi = async (id: string, data: any) => {
        return patch(`${baseUrl}/${id}/`, data)
    }

    // Delete attendance record
    const deleteAttendanceApi = async (id: string) => {
        return del(`${baseUrl}/${id}/`)
    }

    return {
        getAttendanceApi,
        getEnrollmentAttendanceApi,
        getAttendanceRecordApi,
        createAttendanceApi,
        editAttendanceApi,
        patchAttendanceApi,
        deleteAttendanceApi,
    }
}

