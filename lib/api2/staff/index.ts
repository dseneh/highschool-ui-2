"use client";
import type { StaffDto } from './types';
import { useApiMutation, useApiQuery } from '../utils';
import { useStaffApi } from './api';

export function useStaff() {
    /* eslint-disable react-hooks/rules-of-hooks */
    const api = useStaffApi()

    // Staff hooks
    const getStaff = (query: any, options = {}) =>
        useApiQuery(
            ['staff', query],
            () => api.getStaffApi(query).then((res: any) => res.data),
            options,
        )

    const getStaffMember = (staffId: string, options = {}) =>
        useApiQuery(
            ['staff', staffId],
            () => api.getStaffMemberApi(staffId).then((res: any) => res.data as StaffDto),
            options,
        )

    const createStaff = (options = {}) =>
        useApiMutation(
            (data: any) => api.createStaffApi(data).then((res: any) => res.data),
            options,
        )

    const updateStaff = (staffId: string, options = {}) =>
        useApiMutation(
            (data: any) =>
                api.updateStaffApi(staffId, data).then((res: any) => res.data),
            options,
        )

    const patchStaff = (staffId: string, options = {}) =>
        useApiMutation(
            (data: any) =>
                api.patchStaffApi(staffId, data).then((res: any) => res.data),
            options,
        )

    const deleteStaff = (staffId: string, options = {}) =>
        useApiMutation(
            () => api.deleteStaffApi(staffId).then((res: any) => res.data),
            options,
        )

    // Teachers hooks
    const getTeachers = (query: any, options = {}) =>
        useApiQuery(
            ['teachers', query],
            () => api.getTeachersApi(query).then((res: any) => res.data),
            options,
        )

    // Position hooks
    const getPositions = (query: any, options = {}) =>
        useApiQuery(
            ['positions', query],
            () => api.getPositionsApi(query).then((res: any) => res.data),
            options,
        )

    const getPosition = (positionId: string, options = {}) =>
        useApiQuery(
            ['positions', positionId],
            () => api.getPositionApi(positionId).then((res: any) => res.data),
            options,
        )

    const createPosition = (options = {}) =>
        useApiMutation(
            (data: any) => api.createPositionApi(data).then((res: any) => res.data),
            options,
        )

    const updatePosition = (positionId: string, options = {}) =>
        useApiMutation(
            (data: any) =>
                api.updatePositionApi(positionId, data).then((res: any) => res.data),
            options,
        )

    const patchPosition = (positionId: string, options = {}) =>
        useApiMutation(
            (data: any) =>
                api.patchPositionApi(positionId, data).then((res: any) => res.data),
            options,
        )

    const deletePosition = (positionId: string, options = {}) =>
        useApiMutation(
            () => api.deletePositionApi(positionId).then((res: any) => res.data),
            options,
        )

    // Department hooks
    const getDepartments = (query: any, options = {}) =>
        useApiQuery(
            ['departments', query],
            () => api.getDepartmentsApi(query).then((res: any) => res.data),
            options,
        )

    const getDepartment = (departmentId: string, options = {}) =>
        useApiQuery(
            ['departments', departmentId],
            () => api.getDepartmentApi(departmentId).then((res: any) => res.data),
            options,
        )

    const createDepartment = (options = {}) =>
        useApiMutation(
            (data: any) => api.createDepartmentApi(data).then((res: any) => res.data),
            options,
        )

    const updateDepartment = (departmentId: string, options = {}) =>
        useApiMutation(
            (data: any) =>
                api.updateDepartmentApi(departmentId, data).then((res: any) => res.data),
            options,
        )

    const patchDepartment = (departmentId: string, options = {}) =>
        useApiMutation(
            (data: any) =>
                api.patchDepartmentApi(departmentId, data).then((res: any) => res.data),
            options,
        )

    const deleteDepartment = (departmentId: string, options = {}) =>
        useApiMutation(
            () => api.deleteDepartmentApi(departmentId).then((res: any) => res.data),
            options,
        )

    // Position Category hooks
    const getPositionCategories = (query: any, options = {}) =>
        useApiQuery(
            ['position-categories', query],
            () => api.getPositionCategoriesApi(query).then((res: any) => res.data),
            options,
        )

    const getPositionCategory = (categoryId: string, options = {}) =>
        useApiQuery(
            ['position-categories', categoryId],
            () => api.getPositionCategoryApi(categoryId).then((res: any) => res.data),
            options,
        )

    const createPositionCategory = (options = {}) =>
        useApiMutation(
            (data: any) => api.createPositionCategoryApi(data).then((res: any) => res.data),
            options,
        )

    const updatePositionCategory = (categoryId: string, options = {}) =>
        useApiMutation(
            (data: any) =>
                api.updatePositionCategoryApi(categoryId, data).then((res: any) => res.data),
            options,
        )

    const patchPositionCategory = (categoryId: string, options = {}) =>
        useApiMutation(
            (data: any) =>
                api.patchPositionCategoryApi(categoryId, data).then((res: any) => res.data),
            options,
        )

    const deletePositionCategory = (categoryId: string, options = {}) =>
        useApiMutation(
            () => api.deletePositionCategoryApi(categoryId).then((res: any) => res.data),
            options,
        )

    // Teacher Schedule hooks
    const getTeacherSchedules = (query: any, options = {}) =>
        useApiQuery(
            ['teacher-schedules', query],
            () => api.getTeacherSchedulesApi(query).then((res: any) => res.data),
            options,
        )

    const getTeacherSchedule = (scheduleId: string, options = {}) =>
        useApiQuery(
            ['teacher-schedules', scheduleId],
            () => api.getTeacherScheduleApi(scheduleId).then((res: any) => res.data),
            options,
        )

    const createTeacherSchedule = (options = {}) =>
        useApiMutation(
            (data: any) => api.createTeacherScheduleApi(data).then((res: any) => res.data),
            options,
        )

    const updateTeacherSchedule = (scheduleId: string, options = {}) =>
        useApiMutation(
            (data: any) =>
                api.updateTeacherScheduleApi(scheduleId, data).then((res: any) => res.data),
            options,
        )

    const patchTeacherSchedule = (scheduleId: string, options = {}) =>
        useApiMutation(
            (data: any) =>
                api.patchTeacherScheduleApi(scheduleId, data).then((res: any) => res.data),
            options,
        )

    const deleteTeacherSchedule = (scheduleId: string, options = {}) =>
        useApiMutation(
            () => api.deleteTeacherScheduleApi(scheduleId).then((res: any) => res.data),
            options,
        )

    // Teacher Section hooks
    const getTeacherSections = (query: any, options = {}) =>
        useApiQuery(
            ['teacher-sections', query],
            () => api.getTeacherSectionsApi(query).then((res: any) => res.data),
            options,
        )

    const getTeacherSection = (sectionId: string, options = {}) =>
        useApiQuery(
            ['teacher-sections', sectionId],
            () => api.getTeacherSectionApi(sectionId).then((res: any) => res.data),
            options,
        )

    const createTeacherSection = (options = {}) =>
        useApiMutation(
            (data: any) => api.createTeacherSectionApi(data).then((res: any) => res.data),
            options,
        )

    const updateTeacherSection = (sectionId: string, options = {}) =>
        useApiMutation(
            (data: any) =>
                api.updateTeacherSectionApi(sectionId, data).then((res: any) => res.data),
            options,
        )

    const patchTeacherSection = (sectionId: string, options = {}) =>
        useApiMutation(
            (data: any) =>
                api.patchTeacherSectionApi(sectionId, data).then((res: any) => res.data),
            options,
        )

    const deleteTeacherSection = (sectionId: string, options = {}) =>
        useApiMutation(
            () => api.deleteTeacherSectionApi(sectionId).then((res: any) => res.data),
            options,
        )

    // Teacher Subject hooks
    const getTeacherSubjects = (query: any, options = {}) =>
        useApiQuery(
            ['teacher-subjects', query],
            () => api.getTeacherSubjectsApi(query).then((res: any) => res.data),
            options,
        )

    const getTeacherSubject = (subjectId: string, options = {}) =>
        useApiQuery(
            ['teacher-subjects', subjectId],
            () => api.getTeacherSubjectApi(subjectId).then((res: any) => res.data),
            options,
        )

    const createTeacherSubject = (options = {}) =>
        useApiMutation(
            (data: any) => api.createTeacherSubjectApi(data).then((res: any) => res.data),
            options,
        )

    const updateTeacherSubject = (subjectId: string, options = {}) =>
        useApiMutation(
            (data: any) =>
                api.updateTeacherSubjectApi(subjectId, data).then((res: any) => res.data),
            options,
        )

    const patchTeacherSubject = (subjectId: string, options = {}) =>
        useApiMutation(
            (data: any) =>
                api.patchTeacherSubjectApi(subjectId, data).then((res: any) => res.data),
            options,
        )

    const deleteTeacherSubject = (subjectId: string, options = {}) =>
        useApiMutation(
            () => api.deleteTeacherSubjectApi(subjectId).then((res: any) => res.data),
            options,
        )

    return {
        // Staff
        getStaff,
        getStaffMember,
        createStaff,
        updateStaff,
        patchStaff,
        deleteStaff,
        getTeachers,
        // Position
        getPositions,
        getPosition,
        createPosition,
        updatePosition,
        patchPosition,
        deletePosition,
        // Department
        getDepartments,
        getDepartment,
        createDepartment,
        updateDepartment,
        patchDepartment,
        deleteDepartment,
        // Position Category
        getPositionCategories,
        getPositionCategory,
        createPositionCategory,
        updatePositionCategory,
        patchPositionCategory,
        deletePositionCategory,
        // Teacher Schedule
        getTeacherSchedules,
        getTeacherSchedule,
        createTeacherSchedule,
        updateTeacherSchedule,
        patchTeacherSchedule,
        deleteTeacherSchedule,
        // Teacher Section
        getTeacherSections,
        getTeacherSection,
        createTeacherSection,
        updateTeacherSection,
        patchTeacherSection,
        deleteTeacherSection,
        // Teacher Subject
        getTeacherSubjects,
        getTeacherSubject,
        createTeacherSubject,
        updateTeacherSubject,
        patchTeacherSubject,
        deleteTeacherSubject,
    }
}
