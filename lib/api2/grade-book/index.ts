"use client";
import { useApiQuery, useApiMutation } from "../utils";
import { useGradeBooksApi } from "./api";

/**
 * GradeBooks React Query hooks (Updated for backend-v2)
 * All endpoints use /api/v1/students/gradebooks/ prefix
 *
 * Note: The returned functions call hooks but are safe because they're
 * always invoked at the top level of components (see usage in components)
 */
export function useGradeBooks() {
  /* eslint-disable react-hooks/rules-of-hooks */
  const api = useGradeBooksApi();

  // Query: Get all grade books (with optional filters)
  const getGradeBooks = (query: any = {}, options = {}) =>
    useApiQuery(
      ["gradebooks", query],
      () => api.getGradeBooksApi(query).then((res: any) => res.data),
      options,
    );

  // Query: Get grade books for a specific enrollment
  const getEnrollmentGradeBooks = (
    enrollmentId: string,
    query: any = {},
    options = {},
  ) =>
    useApiQuery(
      ["gradebooks", "enrollment", enrollmentId, query],
      () =>
        api
          .getEnrollmentGradeBooksApi(enrollmentId, query)
          .then((res: any) => res.data),
      options,
    );

  // Query: Get single grade book
  const getGradeBook = (id: string, options = {}) =>
    useApiQuery(
      ["gradebooks", id],
      () => api.getGradeBookApi(id).then((res: any) => res.data),
      options,
    );

  // Legacy: Get student grade books (grouped by semester/subject)
  const getStudentGradeBook = (
    studentId: string,
    data_by: string = "",
    query: any = {},
    options = {},
  ) =>
    useApiQuery(
      ["gradebooks", "student", studentId, data_by, query],
      () =>
        api
          .getStudentGradeBookApi(studentId, data_by, query)
          .then((res: any) => res.data),
      options,
    );

  // Legacy: Get class subject grade books
  const getClassSubjectGradeBooks = (
    yearId: string,
    markingPeriodId: string,
    sectionId: string,
    subjectId: string,
    status: string = "",
    search: string = "",
    options = {},
  ) =>
    useApiQuery(
      [
        "gradebooks",
        "class",
        yearId,
        markingPeriodId,
        sectionId,
        subjectId,
        status,
        search,
      ],
      () =>
        api
          .getClassSubjectGradeBooksApi(
            yearId,
            markingPeriodId,
            sectionId,
            subjectId,
            status,
            search,
          )
          .then((res: any) => res.data),
      options,
    );

  // Mutation: Create grade book entry
  const createGradeBook = (options = {}) =>
    useApiMutation(
      (data: any) => api.createGradeBookApi(data).then((res: any) => res.data),
      options,
    );

  // Mutation: Update grade book (full update)
  const updateGradeBook = (id: string, options = {}) =>
    useApiMutation(
      (data: any) =>
        api.editGradeBookApi(id, data).then((res: any) => res.data),
      options,
    );

  // Mutation: Partial update grade book
  const patchGradeBook = (id: string, options = {}) =>
    useApiMutation(
      (data: any) =>
        api.patchGradeBookApi(id, data).then((res: any) => res.data),
      options,
    );

  // Mutation: Delete grade book
  const deleteGradeBook = (id: string, options = {}) =>
    useApiMutation(
      () => api.deleteGradeBookApi(id).then((res: any) => res.data),
      options,
    );

  // Legacy: Update grade status
  const updateGradeStatus = (id: string, options = {}) =>
    useApiMutation(
      (data: { status: string }) =>
        api.patchGradeBookApi(id, data).then((res: any) => res.data),
      options,
    );

  // Legacy: Update class subject grade status (batch)
  const updateClassSubjectGradeStatus = (
    yearId: string,
    markingPeriodId: string,
    sectionId: string,
    subjectId: string,
    options = {},
  ) =>
    useApiMutation(
      (data: { status: string }) =>
        api
          .updateClassSubjectGradeStatusApi(
            yearId,
            markingPeriodId,
            sectionId,
            subjectId,
            data,
          )
          .then((res: any) => res.data),
      options,
    );

  return {
    getGradeBooks,
    getEnrollmentGradeBooks,
    getGradeBook,
    createGradeBook,
    updateGradeBook,
    patchGradeBook,
    deleteGradeBook,
    // Legacy methods for backward compatibility
    getStudentGradeBook,
    getClassSubjectGradeBooks,
    updateGradeStatus,
    updateClassSubjectGradeStatus,
  };
}
