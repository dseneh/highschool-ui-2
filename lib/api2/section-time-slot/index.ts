"use client";

import { useApiMutation, useApiQuery } from "@/lib/api2/utils";
import { useSectionTimeSlotsApi } from "./api";

export function useSectionTimeSlots() {
  /* eslint-disable react-hooks/rules-of-hooks */
  const api = useSectionTimeSlotsApi();

  const getSectionTimeSlots = (sectionId: string, options = {}) =>
    useApiQuery(
      ["section-time-slots", sectionId],
      () => api.getSectionTimeSlotsApi(sectionId).then((res) => res.data),
      options
    );

  const createSectionTimeSlot = (sectionId: string, options = {}) =>
    useApiMutation(
      (data: any) => api.createSectionTimeSlotApi(sectionId, data).then((res) => res.data),
      options
    );

  const updateSectionTimeSlot = (id: string, options = {}) =>
    useApiMutation(
      (data: any) => api.updateSectionTimeSlotApi(id, data).then((res) => res.data),
      options
    );

  const deleteSectionTimeSlot = (id: string, options = {}) =>
    useApiMutation(
      () => api.deleteSectionTimeSlotApi(id).then((res: any) => res.data),
      options
    );

  const copySectionTimeSlots = (sectionId: string, options = {}) =>
    useApiMutation(
      (sourceSectionId: string) =>
        api.copySectionTimeSlotsApi(sectionId, sourceSectionId).then((res) => res.data),
      options
    );

  const generateSectionTimeSlots = (sectionId: string, options = {}) =>
    useApiMutation(
      () => api.generateSectionTimeSlotsApi(sectionId).then((res) => res.data),
      options
    );

  return {
    getSectionTimeSlots,
    createSectionTimeSlot,
    updateSectionTimeSlot,
    deleteSectionTimeSlot,
    copySectionTimeSlots,
    generateSectionTimeSlots,
  };
}
