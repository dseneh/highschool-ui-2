import { useAxiosAuth } from '@/hooks/use-axios-auth'

export const useGradingApi = () => {
    const { get, post, put, delete: del, patch } = useAxiosAuth()

    const baseUrl = '/grading'

    // gradebooks
    const getGradeBooksApi = async (yearId: string, query: any = {}) =>
        get(`${baseUrl}/academic-years/${yearId}/gradebooks/`, { params: query })

    const getGradeBookApi = async (gradebookId: string) =>
        get(`${baseUrl}/gradebooks/${gradebookId}/`)

    const getGradebookGradesApi = async (gradebookId: string, query: any = {}) =>
        get(`${baseUrl}/gradebooks/${gradebookId}/grades/`, { params: query })

    // assessmentTypes
    const getAssessmentTypesApi = async (query: any = {}) =>
        get(`${baseUrl}/assessment-types/`, { params: query })

    const getAssessmentTypeApi = async (assessmentTypeId: string) =>
        get(`${baseUrl}/assessment-types/${assessmentTypeId}/`)

    const createAssessmentTypeApi = async (data: any) =>
        post(`${baseUrl}/assessment-types/`, data)

    const editAssessmentTypeApi = async (assessmentTypeId: string, data: any) =>
        put(`${baseUrl}/assessment-types/${assessmentTypeId}/`, data)

    // assessments
    const getAssessmentsApi = async (gradebookId: string, query: any = {}) => {
        return get(`${baseUrl}/gradebooks/${gradebookId}/assessments/`, { params: query })
    }
    const getAssessmentApi = async (assessmentId: string) =>
        get(`${baseUrl}/assessments/${assessmentId}/`)

    const createAssessmentApi = async (gradebookId: string, data: any) =>
        post(`${baseUrl}/gradebooks/${gradebookId}/assessments/`, data)

    const editAssessmentApi = async (assessmentId: string, data: any) =>
        put(`${baseUrl}/assessments/${assessmentId}/`, data)

    const deleteAssessmentApi = async (assessmentId: string) =>
        del(`${baseUrl}/assessments/${assessmentId}/`)

    // grades
    const getGradesApi = async (assessmentId: string, query: any = {}) =>
        get(`${baseUrl}/assessments/${assessmentId}/grades/`, { params: query })

    const getGradeApi = async (gradeId: string) =>
        get(`${baseUrl}/grades/${gradeId}/`)

    // const createGradesApi = async (assessmentId: string, data: any) => 
    //     post(`${baseUrl}/assessments/${assessmentId}/grades/`, data)

    const editGradeApi = async (gradeId: string, data: { score: number }) =>
        put(`${baseUrl}/grades/${gradeId}/`, data)

    // grade & section grade status update
    const editGradeStatusApi = async (gradeId: string, data: { status: string }) =>
        put(`${baseUrl}/grades/${gradeId}/status/`, data)

    const updateSectionGradeStatusApi = async (
        sectionId: string,
        markingPeriodId: string,
        subjectId: string,
        data: { status: string, targeted_status?: string }) => {
        const q = {
            marking_period: markingPeriodId,
            subject: subjectId,
        }
        return put(`${baseUrl}/sections/${sectionId}/grades-status/`, data, { params: q })
    }


    const updateStudentGradeStatusApi = async (
        studentId: string,
        markingPeriodId: string,
        subjectId: string,
        data: { status: string, targeted_status?: string }) => {
        return put(`${baseUrl}/students/${studentId}/marking_periods/${markingPeriodId}/grades-status/`, data, { params: { subject: subjectId } })
    }

    const uploadStudentGradesApi = async (
        sectionId: string,
        academicYear: string,
        markingPeriodId: string,
        subjectId: string,
        override_grade = false,
        data: any) => {
        return post(`${baseUrl}/sections/${sectionId}/grades-upload/`, data, {
            params: {
                subject: subjectId,
                marking_period: markingPeriodId,
                override_grades: override_grade,
                academic_year: academicYear
            }
        })
    }
    const regenerateGradebooksApi = async (
        academicYear: string,
        force = false,
    ) => {
        const data = {
            academic_year: academicYear,
            force: force,
        }
        return post(`/settings/grading/regenerate/`, data)
    }

    // students' grades
    const getStudentFinalGradesApi = async (
        studentId: string,
        academicYearId: string,
        query: any = {}
    ) => {
        return get(`${baseUrl}/students/${studentId}/final-grades/academic-years/${academicYearId}/`, { params: query })
    }
    const getStudentFinalGradesReportApi = async (
        studentId: string,
        academicYearId: string,
        query: any = {}
    ) => {
        return get(`${baseUrl}/students/${studentId}/final-grades/academic-years/${academicYearId}/report-card/`, {
            params: query,
            responseType: 'blob' // Important: tell axios to expect binary data (PDF)
        })
    }

    const getSectionFinalGradesApi = async (
        academicYearId: string,
        sectionId: string,
        markingPeriodId: string,
        subjectId: string,
        data_by: string,
    ) => {
        const q = {
            academic_year: academicYearId,
            marking_period: markingPeriodId,
            subject: subjectId,
            data_by,
        }
        return get(`${baseUrl}/sections/${sectionId}/final-grades/`, { params: q })
    }

    // settings
    const getGradeSettingsApi = async () => {
        return get(`/settings/grading/`)
    }
    const getGradeSettingsInitApi = async () => {
        return get(`/settings/grading/init/`)
    }
    const getDefaultTemplateApi = async () => {
        return get(`${baseUrl}/default-templates/`)
    }
    const getGradingTaskApi = async (taskId: string) => {
        return get(`/settings/grading/tasks/${taskId}/`)
    }

    const updateGradeSettingsApi = async (data: any) => {
        return patch(`/settings/grading/`, data)
    }

    return {
        getGradeBooksApi,
        getGradeBookApi,
        getGradebookGradesApi,
        getAssessmentTypesApi,
        getAssessmentTypeApi,
        createAssessmentTypeApi,
        editAssessmentTypeApi,
        getAssessmentsApi,
        getAssessmentApi,
        createAssessmentApi,
        editAssessmentApi,
        deleteAssessmentApi,
        getGradesApi,
        getGradeApi,
        // createGradesApi,
        editGradeApi,
        editGradeStatusApi,
        updateStudentGradeStatusApi,
        updateSectionGradeStatusApi,
        regenerateGradebooksApi,
        getStudentFinalGradesApi,
        getSectionFinalGradesApi,
        uploadStudentGradesApi,
        getStudentFinalGradesReportApi,
        // settings
        updateGradeSettingsApi,
        getGradeSettingsInitApi,
        getGradeSettingsApi,
        getDefaultTemplateApi,
        getGradingTaskApi,

    }
}
