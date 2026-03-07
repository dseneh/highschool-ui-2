import { useEnrollmentsApi } from './api'
import { useApiQuery, useApiMutation } from '../utils'

export function useEnrollments() {
    /* eslint-disable react-hooks/rules-of-hooks */
    const api = useEnrollmentsApi()

    const getEnrollments = (studentId: string, options = {}) =>
        useApiQuery(
            ['enrollments'], () => api.getEnrollmentsApi(studentId).then((res: any) => res.data), options)

    const getEnrollment = (id: string, options = {}) =>
        useApiQuery(
            ['enrollments', id], () =>
                api.getEnrollmentApi(id).then((res: any) => res.data), options)

    const createEnrollment = (studentId: string, options = {}) =>
        useApiMutation(
            (data: any) =>
                api.createEnrollmentApi(studentId, data).then((res: any) => res.data), options)

    const updateEnrollment = (id: string, options = {}) =>
        useApiMutation(
            (data: any) =>
                api.editEnrollmentApi(id, data).then((res: any) => res.data), options)

    const deleteEnrollment = (id: string, options = {}) =>
        useApiMutation(
            () =>
                api.deleteEnrollmentApi(id).then((res: any) => res.data), options)

    return {
        getEnrollments,
        getEnrollment,
        createEnrollment,
        updateEnrollment,
        deleteEnrollment,
    }
}
