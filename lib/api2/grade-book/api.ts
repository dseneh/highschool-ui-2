"use client";
import { useAxiosAuth } from '@/hooks/use-axios-auth'

/**
 * GradeBooks API (Updated for backend-v2)
 * All endpoints use /api/v1/students/gradebooks/ prefix
 * Tenant is determined by X-Tenant header (no workspace in URL)
 */
export const useGradeBooksApi = () => {
    const { get, post, put, patch, delete: del } = useAxiosAuth()
    const baseUrl = '/students/gradebooks'

    // List grade books with query parameters
    const getGradeBooksApi = async (query?: any) => {
        return get(`${baseUrl}/`, { params: query })
    }

    // Get grade books for a specific enrollment
    const getEnrollmentGradeBooksApi = async (enrollmentId: string, query?: any) => {
        return get(`${baseUrl}/by-enrollment/${enrollmentId}/`, { params: query })
    }

    // Get single grade book by ID
    const getGradeBookApi = async (id: string) => {
        return get(`${baseUrl}/${id}/`)
    }

    // Create new grade book entry
    const createGradeBookApi = async (data: any) => {
        return post(`${baseUrl}/`, data)
    }

    // Update grade book (full update)
    const editGradeBookApi = async (id: string, data: any) => {
        return put(`${baseUrl}/${id}/`, data)
    }

    // Partial update grade book
    const patchGradeBookApi = async (id: string, data: any) => {
        return patch(`${baseUrl}/${id}/`, data)
    }

    // Delete grade book
    const deleteGradeBookApi = async (id: string) => {
        return del(`${baseUrl}/${id}/`)
    }

    // Legacy: Get student grade books (grouped by semester/subject)
    const getStudentGradeBookApi = async (
        studentId: string,
        data_by: string = '',
        query: any = {},
    ) => {
        // Get enrollments for student first
        const enrollmentsResponse = await get('/students/enrollments/', {
            params: { student_id: studentId }
        })
        const enrollments = enrollmentsResponse.data?.results || enrollmentsResponse.data || []
        
        if (!Array.isArray(enrollments)) {
            return { data: [] }
        }
        
        if (enrollments.length === 0) {
            return { data: [] }
        }

        // Get grade books for the first enrollment (current enrollment)
        // Or get for all enrollments - depending on requirements
        const currentEnrollment = enrollments.find((e: any) => e.academic_year?.current) || enrollments[0]
        const queryParams: any = { enrollment_id: currentEnrollment.id }
        
        if (data_by) {
            queryParams.data_by = data_by
        }
        
        Object.assign(queryParams, query)
        
        const response = await get(`${baseUrl}/`, { params: queryParams })
        return response
    }

    // Legacy: Get class subject grade books
    const getClassSubjectGradeBooksApi = async (
        yearId: string,
        markingPeriodId: string,
        sectionId: string,
        subjectId: string,
        status: string = '',
        search: string = '',
    ) => {
        // Get enrollments for section first
        const enrollmentsResponse = await get('/students/enrollments/', {
            params: { 
                section: sectionId,
                academic_year: yearId 
            }
        })
        const enrollments = enrollmentsResponse.data?.results || enrollmentsResponse.data || []
        
        if (!Array.isArray(enrollments) || enrollments.length === 0) {
            return { data: [] }
        }

        // For now, get grade books for the first enrollment and filter in the response
        // Note: This may need optimization on the backend to support filtering by section + subject
        // Better approach: Backend should add a custom endpoint for section-based grade books
        const enrollmentIds = enrollments.map((e: any) => e.id)
        
        // Get all grade books for enrollments (will need to filter by subject and marking_period in response)
        const allGradeBooks: any[] = []
        for (const enrollmentId of enrollmentIds) {
            const gradeBooksResponse = await get(`${baseUrl}/by-enrollment/${enrollmentId}/`, {
                params: {
                    marking_period: markingPeriodId,
                    subject: subjectId,
                    ...(status && { status }),
                }
            })
            const gradeBooks = gradeBooksResponse.data?.results || gradeBooksResponse.data || []
            if (Array.isArray(gradeBooks)) {
                allGradeBooks.push(...gradeBooks)
            }
        }
        
        // Filter by subject and marking_period if not already filtered
        let filtered = allGradeBooks.filter((gb: any) => {
            const matchesSubject = !subjectId || (gb.subject?.id || gb.subject) === subjectId
            const matchesMarkingPeriod = !markingPeriodId || (gb.marking_period?.id || gb.marking_period) === markingPeriodId
            return matchesSubject && matchesMarkingPeriod
        })
        
        // Filter by status if provided
        if (status && status.trim()) {
            filtered = filtered.filter((gb: any) => gb.status === status.trim())
        }
        
        // Filter by search if provided (search in student name)
        if (search && search.trim()) {
            const searchLower = search.trim().toLowerCase()
            filtered = filtered.filter((gb: any) => {
                const studentName = (gb.student_name || gb.enrollment?.student?.full_name || '').toLowerCase()
                return studentName.includes(searchLower)
            })
        }
        
        return { data: filtered }
    }

    // Legacy: Update class subject grade status (batch update)
    const updateClassSubjectGradeStatusApi = async (
        yearId: string,
        markingPeriodId: string,
        sectionId: string,
        subjectId: string,
        data: {status: string},
    ) => {
        // Get all grade books for the section/subject combination
        const gradebooksResponse = await getClassSubjectGradeBooksApi(
            yearId,
            markingPeriodId,
            sectionId,
            subjectId
        )
        const gradebooks = gradebooksResponse.data || []
        
        if (!Array.isArray(gradebooks) || gradebooks.length === 0) {
            return { data: { updated: 0 } }
        }
        
        // Update each grade book status
        const promises = gradebooks.map((gb: any) => 
            patch(`${baseUrl}/${gb.id}/`, { status: data.status })
        )
        
        await Promise.all(promises)
        return { data: { updated: promises.length } }
    }

    return {
        getGradeBooksApi,
        getEnrollmentGradeBooksApi,
        getGradeBookApi,
        createGradeBookApi,
        editGradeBookApi,
        patchGradeBookApi,
        deleteGradeBookApi,
        // Legacy methods for backward compatibility
        getStudentGradeBookApi,
        getClassSubjectGradeBooksApi,
        updateClassSubjectGradeStatusApi,
    }
}
