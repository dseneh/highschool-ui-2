import { useGradingApi } from './api'
import { useApiQuery, useApiMutation, useWorkspaceId } from '../utils';

export function useGrading() {
    /* eslint-disable react-hooks/rules-of-hooks */
    const api = useGradingApi()
    const workspace = useWorkspaceId()

    // Gradebooks
    const getGradeBooks = (yearId: string, query: any = {}, options = {}) =>
        useApiQuery(
            ['gradebooks', yearId, query],
            () => api.getGradeBooksApi(yearId, query).then((res: any) => res.data),
            options,
        )

    const getGradeBook = (gradebookId: string, options = {}) =>
        useApiQuery(
            ['gradebooks', gradebookId],
            () => api.getGradeBookApi(gradebookId).then((res: any) => res.data),
            options,
        )

    const getGradebookGrades = (gradebookId: string, query: any = {}, options = {}) =>
        useApiQuery(
            ['gradebookGrades', gradebookId, query],
            () => api.getGradebookGradesApi(gradebookId, query).then((res: any) => res.data),
            options,
        )

    // Assessment Types
    const getAssessmentTypes = (query: any = {}, options = {}) =>
        useApiQuery(
            ['assessmentTypes', query],
            () => api.getAssessmentTypesApi(query).then((res: any) => res.data),
            options,
        )

    const getAssessmentType = (assessmentTypeId: string, options = {}) =>
        useApiQuery(
            ['assessmentTypes', assessmentTypeId],
            () => api.getAssessmentTypeApi(assessmentTypeId).then((res: any) => res.data),
            options,
        )

    const createAssessmentType = (options = {}) =>
        useApiMutation(
            (data: any) => api.createAssessmentTypeApi(data).then((res: any) => res.data),
            options,
        )

    const updateAssessmentType = (assessmentTypeId: string, options = {}) =>
        useApiMutation(
            (data: any) => api.editAssessmentTypeApi(assessmentTypeId, data).then((res: any) => res.data),
            options,
        )

    // Grade Items
    const getAssessments = (gradebookId: string, query: any = {}, options = {}) =>
        useApiQuery(
            ['assessments', gradebookId, query],
            () => api.getAssessmentsApi(gradebookId, query).then((res: any) => res.data),
            options,
        )

    const getAssessment = (assessmentId: string, options = {}) =>
        useApiQuery(
            ['assessments', assessmentId],
            () => api.getAssessmentApi(assessmentId).then((res: any) => res.data),
            options,
        )

    const createAssessment = (gradebookId: string, options = {}) =>
        useApiMutation(
            (data: any) => api.createAssessmentApi(gradebookId, data).then((res: any) => res.data),
            options,
        )

    const updateAssessment = (assessmentId: string, options = {}) =>
        useApiMutation(
            (data: any) => api.editAssessmentApi(assessmentId, data).then((res: any) => res.data),
            options,
        )

    const deleteAssessment = (options = {}) =>
        useApiMutation(
            (assessmentId: string) => api.deleteAssessmentApi(assessmentId).then((res: any) => res.data),
            options,
        )

    // Grades
    const getGrades = (assessmentId: string, query: any = {}, options = {}) =>
        useApiQuery(
            ['grades', assessmentId, query],
            () => api.getGradesApi(assessmentId, query).then((res: any) => res.data),
            options,
        )

    const getGrade = (gradeId: string, options = {}) =>
        useApiQuery(
            ['grades', gradeId],
            () => api.getGradeApi(gradeId).then((res: any) => res.data),
            options,
        )

    const updateGrade = (options = {}) =>
        useApiMutation(
            ({ gradeId, data }: { gradeId: string; data: { score: number } }) => api.editGradeApi(gradeId, data).then((res: any) => res.data),
            options,
        )

    // Grade Status
    const updateGradeStatus = (gradeId: string, options = {}) =>
        useApiMutation(
            (data: { status: string }) => api.editGradeStatusApi(gradeId, data).then((res: any) => res.data),
            options,
        )

    const updateStudentGradeStatus = (
        studentId: string,
        markingPeriodId: string,
        subjectId: string,
        options = {}
    ) =>
        useApiMutation(
            (data: { status: string, targeted_status?: string }) => api.updateStudentGradeStatusApi(studentId, markingPeriodId, subjectId, data)
                .then((res: any) => res.data),
            options,
        )

    const updateSectionGradeStatus = (
        sectionId: string,
        markingPeriodId: string,
        subjectId: string,
        options = {}
    ) =>
        useApiMutation(
            (data: { status: string, targeted_status: string }) => api.updateSectionGradeStatusApi(sectionId, markingPeriodId, subjectId, data)
                .then((res: any) => res.data),
            options,
        )

    // Student Final Grades
    const getStudentFinalGrades = (studentId: string, yearId: string, query: any = {}, options = {}) =>
        useApiQuery(
            ['studentFinalGrades', studentId, yearId, query],
            () => api.getStudentFinalGradesApi(studentId, yearId, query).then((res: any) => res.data),
            options,
        )

    const downloadStudentFinalGradesReport = (options = {}) =>
        useApiMutation(
            ({ studentId, academicYearId, query = {} }: { studentId: string; academicYearId: string; query?: any }) => api.getStudentFinalGradesReportApi(studentId, academicYearId, query).then((res: any) => res),
            options,
        )

    const getSectionFinalGrades = (
        academicYearId: string,
        sectionId: string,
        markingPeriodId: string,
        subjectId: string,
        data_by: string,
        options = {}) =>
        useApiQuery(
            ['sectionFinalGrades', sectionId, academicYearId, markingPeriodId, subjectId, data_by],
            () => api.getSectionFinalGradesApi(
                academicYearId,
                sectionId,
                markingPeriodId,
                subjectId,
                data_by
            ).then((res: any) => res.data),
            options,
        )

    // Grade Settings
    const regenerateGradebooks = (options = {}) =>
        useApiMutation(
            ({ academic_year, force = false }: { academic_year: string; force?: boolean }) => api.regenerateGradebooksApi(academic_year, force).then((res: any) => res.data),
            options,
        )

    const updateGradeSettings = (options = {}) =>
        useApiMutation(
            (data: any) => api.updateGradeSettingsApi(data).then((res: any) => res.data),
            options,
        )

    const getGradeSettings = (options = {}) =>
        useApiQuery(
            ['gradeSettings', workspace],
            () => api.getGradeSettingsApi().then((res: any) => res.data),
            options,
        )

    const getGradeSettingsInit = (options = {}) =>
        useApiQuery(
            ['gradeSettingsInit', workspace],
            () => api.getGradeSettingsInitApi().then((res: any) => res.data),
            options,
        )

    const getGradingTask = (taskId: string, options = {}) =>
        useApiQuery(
            ['gradingTask', workspace, taskId],
            () => api.getGradingTaskApi(taskId).then((res: any) => res.data),
            options,
        )

    const getDefaultTemplate = (options = {}) =>
        useApiQuery(
            ['defaultTemplate', workspace],
            () => api.getDefaultTemplateApi().then((res: any) => res.data),
            options,
        )

    return {
        // Gradebooks
        getGradeBooks,
        getGradeBook,
        getGradebookGrades,

        // Assessment Types
        getAssessmentTypes,
        getAssessmentType,
        createAssessmentType,
        updateAssessmentType,

        // Grade Items
        getAssessments,
        getAssessment,
        createAssessment,
        updateAssessment,
        deleteAssessment,

        // Grades
        getGrades,
        getGrade,
        updateGrade,

        // Grade Status
        updateGradeStatus,
        updateStudentGradeStatus,
        updateSectionGradeStatus,

        // Student Final Grades
        getStudentFinalGrades,
        getSectionFinalGrades,
        downloadStudentFinalGradesReport,

        // Grade Settings
        regenerateGradebooks,
        updateGradeSettings,
        getGradeSettings,
        getGradeSettingsInit,
        getDefaultTemplate,
        getGradingTask,
    }
}
