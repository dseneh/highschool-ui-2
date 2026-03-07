import { useAxiosAuth } from '@/hooks/use-axios-auth'

export const useDashboardApi = () => {
    const { get } = useAxiosAuth()

    const getDashboardSummary = async () => {
        return get(`/students/summary/`)
    }

    const getRecentStudents = async (params?: any) => {
        return get(`/students/`, { params: { limit: 5, ...params } })
    }

    const getFinancialSummary = async () => {
        return get(`/billing/summary/`)
    }

    const getGradeLevelDistribution = async () => {
        return get(`/students/distributions/grade-level/`)
    }

    const getPaymentStatusDistribution = async () => {
        return get(`/students/distributions/payment-status/`)
    }

    const getAttendanceDistribution = async () => {
        return get(`/students/distributions/attendance/`)
    }

    const getSectionDistribution = async () => {
        return get(`/students/distributions/sections/`)
    }

    const getPaymentSummary = async () => {
        return get(`/students/distributions/payment-summary/`)
    }

    const getTopStudents = async () => {
        return get(`/students/distributions/top-students/`)
    }

    return {
        getDashboardSummary,
        getRecentStudents,
        getFinancialSummary,
        getGradeLevelDistribution,
        getPaymentStatusDistribution,
        getAttendanceDistribution,
        getSectionDistribution,
        getPaymentSummary,
        getTopStudents,
    }
}
