import { useAxiosAuth } from "@/hooks/use-axios-auth";

export const useSectionTimeSlotsApi = () => {
  const { get, post, put, delete: del } = useAxiosAuth();

  const getSectionTimeSlotsApi = async (sectionId: string) => {
    return get(`/sections/${sectionId}/time-slots/`);
  };

  const createSectionTimeSlotApi = async (sectionId: string, data: any) => {
    return post(`/sections/${sectionId}/time-slots/`, data);
  };

  const updateSectionTimeSlotApi = async (id: string, data: any) => {
    return put(`/section-time-slots/${id}/`, data);
  };

  const deleteSectionTimeSlotApi = async (id: string) => {
    return del(`/section-time-slots/${id}/`);
  };

  const copySectionTimeSlotsApi = async (sectionId: string, sourceSectionId: string) => {
    return post(`/sections/${sectionId}/time-slots/copy/`, {
      source_section_id: sourceSectionId,
    });
  };

  const generateSectionTimeSlotsApi = async (sectionId: string) => {
    return post(`/sections/${sectionId}/time-slots/generate/`, {});
  };

  return {
    getSectionTimeSlotsApi,
    createSectionTimeSlotApi,
    updateSectionTimeSlotApi,
    deleteSectionTimeSlotApi,
    copySectionTimeSlotsApi,
    generateSectionTimeSlotsApi,
  };
};
