"use client";
import { useAttendanceApi } from './api'
import { useApiQuery, useApiMutation } from '../utils'

/**
 * Attendance React Query hooks (New for backend-v2)
 * All endpoints use /api/v1/students/attendance/ prefix
 */
export function useAttendance() {
    /* eslint-disable react-hooks/rules-of-hooks */
    const api = useAttendanceApi()

    // Query: Get all attendance records (with optional filters)
    const getAttendance = (query: any = {}, options = {}) =>
        useApiQuery(
            ['attendance', query], () =>
                api.getAttendanceApi(query).then((res: any) => res.data), options)

    // Query: Get attendance for a specific enrollment
    const getEnrollmentAttendance = (enrollmentId: string, query: any = {}, options = {}) =>
        useApiQuery(
            ['attendance', 'enrollment', enrollmentId, query], () =>
                api.getEnrollmentAttendanceApi(enrollmentId, query).then((res: any) => res.data), options)

    // Query: Get single attendance record
    const getAttendanceRecord = (id: string, options = {}) =>
        useApiQuery(
            ['attendance', id], () =>
                api.getAttendanceRecordApi(id).then((res: any) => res.data), options)

    // Mutation: Create attendance record
    const createAttendance = (options = {}) =>
        useApiMutation(
            (data: any) =>
                api.createAttendanceApi(data).then((res: any) => res.data), options)

    // Mutation: Update attendance record (full update)
    const updateAttendance = (id: string, options = {}) =>
        useApiMutation(
            (data: any) =>
                api.editAttendanceApi(id, data).then((res: any) => res.data), options)

    // Mutation: Partial update attendance record
    const patchAttendance = (id: string, options = {}) =>
        useApiMutation(
            (data: any) =>
                api.patchAttendanceApi(id, data).then((res: any) => res.data), options)

    // Mutation: Delete attendance record
    const deleteAttendance = (id: string, options = {}) =>
        useApiMutation(
            () =>
                api.deleteAttendanceApi(id).then((res: any) => res.data), options)

    return {
        getAttendance,
        getEnrollmentAttendance,
        getAttendanceRecord,
        createAttendance,
        updateAttendance,
        patchAttendance,
        deleteAttendance,
    }
}

