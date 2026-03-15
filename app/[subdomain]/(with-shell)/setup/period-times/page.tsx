"use client";

import { useMemo, useState } from "react";
import { useQueryState } from "nuqs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import PageLayout from "@/components/dashboard/page-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DialogBox } from "@/components/ui/dialog-box";
import { Label } from "@/components/ui/label";
import { SelectField } from "@/components/ui/select-field";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { usePeriodsApi } from "@/lib/api2/period/api";
import { useSectionTimeSlotsApi } from "@/lib/api2/section-time-slot/api";
import { useGradeLevels } from "@/hooks/use-grade-level";
import { getErrorMessage, cn } from "@/lib/utils";
import { SlotViews } from "./_components/slot-views";
import { AddOrEditSlotDialog, CreatePeriodDialog } from "./_components/period-dialogs";
import { Search } from "lucide-react";
import {
  useCreateSchoolCalendarEvent,
  useDeleteSchoolCalendarEvent,
  useSchoolCalendarEvents,
  useSchoolCalendarSettings,
  useUpdateSchoolCalendarEvent,
  useUpdateSchoolCalendarSettings,
} from "@/hooks/use-school-calendar";
import { SchoolCalendarSettingsEvents } from "./_components/school-calendar-settings-events";
import {
  DAY_NAMES,
  DAY_OPTIONS,
  type CreatePeriodPayload,
  type CreateSectionTimeSlotPayload,
  type PeriodDto,
  type PeriodType,
  type SectionTimeSlotDto,
} from "./_components/types";

export default function PeriodTimeSetupPage() {
  const queryClient = useQueryClient();
  const periodsApi = usePeriodsApi();
  const sectionSlotsApi = useSectionTimeSlotsApi();

  const [gradeLevelId, setGradeLevelId] = useQueryState("gradeLevel", { defaultValue: "" });
  const [sectionId, setSectionId] = useQueryState("section", { defaultValue: "" });
  const [sourceSectionId, setSourceSectionId] = useState("");

  const [periodName, setPeriodName] = useState("");
  const [periodDescription, setPeriodDescription] = useState("");
  const [periodType, setPeriodType] = useState<PeriodType>("class");

  const [selectedPeriodId, setSelectedPeriodId] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState("1");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [sortOrder, setSortOrder] = useState("1");

  const [periodError, setPeriodError] = useState<string | null>(null);
  const [slotError, setSlotError] = useState<string | null>(null);
  const [showCreatePeriod, setShowCreatePeriod] = useState(false);
  const [showAddSlot, setShowAddSlot] = useState(false);
  const [showGenerateSlotsDialog, setShowGenerateSlotsDialog] = useState(false);
  const [showDeleteSlotDialog, setShowDeleteSlotDialog] = useState(false);
  const [showCalendarDialog, setShowCalendarDialog] = useState(false);
  const [pendingDeleteSlotId, setPendingDeleteSlotId] = useState<string | null>(null);
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);
  const [sidebarSearch, setSidebarSearch] = useState("");

  const { data: gradeLevels = [], isLoading: gradeLevelsLoading } = useGradeLevels();
  const { data: schoolCalendarSettings } = useSchoolCalendarSettings();
  const { data: schoolCalendarEvents = [], isLoading: calendarEventsLoading } = useSchoolCalendarEvents();
  const updateSchoolCalendarSettingsMutation = useUpdateSchoolCalendarSettings();
  const createSchoolCalendarEventMutation = useCreateSchoolCalendarEvent();
  const updateSchoolCalendarEventMutation = useUpdateSchoolCalendarEvent();
  const deleteSchoolCalendarEventMutation = useDeleteSchoolCalendarEvent();

  const allSections = useMemo(
    () => gradeLevels.flatMap((gl) => gl.sections.map((s) => ({ ...s, gradeLevelId: gl.id, gradeLevelName: gl.name }))),
    [gradeLevels],
  );

  const effectiveSectionId =
    sectionId && allSections.some((section) => section.id === sectionId)
      ? sectionId
      : (allSections[0]?.id ?? "");

  const effectiveSection = allSections.find((section) => section.id === effectiveSectionId);
  const effectiveGradeLevelId = effectiveSection?.gradeLevelId ?? (gradeLevelId || gradeLevels[0]?.id || "");

  const {
    data: periods = [],
    isLoading: periodsLoading,
    error: periodsError,
    refetch: refetchPeriods,
  } = useQuery<PeriodDto[]>({
    queryKey: ["periods"],
    queryFn: async () => {
      const response = await periodsApi.getPeriodsApi();
      return response.data as PeriodDto[];
    },
  });

  const effectivePeriodId =
    selectedPeriodId && periods.some((period) => period.id === selectedPeriodId)
      ? selectedPeriodId
      : (periods[0]?.id ?? "");

  const {
    data: sectionSlots = [],
    isLoading: slotsLoading,
    refetch: refetchSlots,
  } = useQuery<SectionTimeSlotDto[]>({
    queryKey: ["section-time-slots", effectiveSectionId],
    enabled: Boolean(effectiveSectionId),
    queryFn: async () => {
      const response = await sectionSlotsApi.getSectionTimeSlotsApi(effectiveSectionId);
      return response.data as SectionTimeSlotDto[];
    },
  });

  const createPeriodMutation = useMutation({
    mutationFn: async (payload: CreatePeriodPayload) => {
      const response = await periodsApi.createPeriodApi(payload);
      return response.data as PeriodDto;
    },
    onSuccess: async (created) => {
      setPeriodError(null);
      setPeriodName("");
      setPeriodDescription("");
      setPeriodType("class");
      setSelectedPeriodId(created.id);
      await queryClient.invalidateQueries({ queryKey: ["periods"] });
    },
    onError: (error) => setPeriodError(getErrorMessage(error)),
  });

  const createSlotMutation = useMutation({
    mutationFn: async (payload: CreateSectionTimeSlotPayload) => {
      const response = await sectionSlotsApi.createSectionTimeSlotApi(effectiveSectionId, payload);
      return response.data as SectionTimeSlotDto;
    },
    onSuccess: async () => {
      setSlotError(null);
      setStartTime("");
      setEndTime("");
      await queryClient.invalidateQueries({ queryKey: ["section-time-slots", effectiveSectionId] });
    },
    onError: (error) => setSlotError(getErrorMessage(error)),
  });

  const updateSlotMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: CreateSectionTimeSlotPayload }) => {
      const response = await sectionSlotsApi.updateSectionTimeSlotApi(id, payload);
      return response.data as SectionTimeSlotDto;
    },
    onSuccess: async () => {
      setSlotError(null);
      setEditingSlotId(null);
      setStartTime("");
      setEndTime("");
      setSortOrder("1");
      await queryClient.invalidateQueries({ queryKey: ["section-time-slots", effectiveSectionId] });
    },
    onError: (error) => setSlotError(getErrorMessage(error)),
  });

  const deleteSlotMutation = useMutation({
    mutationFn: async (id: string) => {
      await sectionSlotsApi.deleteSectionTimeSlotApi(id);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["section-time-slots", effectiveSectionId] });
    },
    onError: (error) => {
      setSlotError(getErrorMessage(error));
    },
  });

  const copySlotsMutation = useMutation({
    mutationFn: async (sourceId: string) => {
      const response = await sectionSlotsApi.copySectionTimeSlotsApi(effectiveSectionId, sourceId);
      return response.data;
    },
    onSuccess: async () => {
      setSourceSectionId("");
      setSlotError(null);
      await queryClient.invalidateQueries({ queryKey: ["section-time-slots", effectiveSectionId] });
    },
    onError: (error) => setSlotError(getErrorMessage(error)),
  });

  const generateSlotsMutation = useMutation({
    mutationFn: async () => {
      const response = await sectionSlotsApi.generateSectionTimeSlotsApi(effectiveSectionId);
      return response.data;
    },
    onSuccess: async () => {
      setSlotError(null);
      await queryClient.invalidateQueries({ queryKey: ["section-time-slots", effectiveSectionId] });
    },
    onError: (error) => setSlotError(getErrorMessage(error)),
  });

  const handleSaveOperatingDays = (operatingDays: number[]) => {
    updateSchoolCalendarSettingsMutation.mutate(
      { operating_days: operatingDays },
      {
        onSuccess: async () => {
          await queryClient.invalidateQueries({ queryKey: ["school-calendar-settings"] });
        },
      }
    );
  };

  const handleCreateCalendarEvent = (payload: Parameters<typeof createSchoolCalendarEventMutation.mutate>[0]) => {
    createSchoolCalendarEventMutation.mutate(payload, {
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: ["school-calendar-events"] });
      },
    });
  };

  const handleUpdateCalendarEvent = (
    id: string,
    payload: Parameters<typeof updateSchoolCalendarEventMutation.mutate>[0]["payload"]
  ) => {
    updateSchoolCalendarEventMutation.mutate(
      { id, payload },
      {
        onSuccess: async () => {
          await queryClient.invalidateQueries({ queryKey: ["school-calendar-events"] });
        },
      }
    );
  };

  const handleDeleteCalendarEvent = (id: string) => {
    deleteSchoolCalendarEventMutation.mutate(id, {
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: ["school-calendar-events"] });
      },
    });
  };

  const groupedSlots = useMemo(() => {
    const map = new Map<number, SectionTimeSlotDto[]>();
    for (const entry of sectionSlots) {
      if (!map.has(entry.day_of_week)) map.set(entry.day_of_week, []);
      map.get(entry.day_of_week)?.push(entry);
    }

    for (const [, entries] of map) {
      entries.sort((a, b) => {
        if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
        return a.start_time.localeCompare(b.start_time);
      });
    }

    return map;
  }, [sectionSlots]);

  const sectionsInGrade = allSections.filter((section) => section.gradeLevelId === effectiveGradeLevelId);
  const copyCandidates = sectionsInGrade.filter((section) => section.id !== effectiveSectionId);
  const operatingDays = schoolCalendarSettings?.operating_days?.length
    ? schoolCalendarSettings.operating_days
    : [1, 2, 3, 4, 5];
  const orderedDays = Object.keys(DAY_NAMES)
    .map(Number)
    .filter((day) => operatingDays.includes(day));
  const filteredDayOptions = DAY_OPTIONS.filter((option) => operatingDays.includes(Number(option.value)));
  const effectiveDayOfWeek = filteredDayOptions.some((option) => option.value === dayOfWeek)
    ? dayOfWeek
    : (filteredDayOptions[0]?.value ?? "1");
  const maxSlotsPerDay = useMemo(
    () => Math.max(0, ...orderedDays.map((day) => groupedSlots.get(day)?.length ?? 0)),
    [groupedSlots, orderedDays]
  );

  const resetSlotForm = () => {
    setEditingSlotId(null);
    setSelectedPeriodId("");
    setDayOfWeek("1");
    setStartTime("");
    setEndTime("");
    setSortOrder("1");
    setSlotError(null);
  };

  const openAddSlotDialog = () => {
    resetSlotForm();
    setShowAddSlot(true);
  };

  const openGenerateDialog = () => {
    setSourceSectionId("");
    setShowGenerateSlotsDialog(true);
  };

  const openEditSlotDialog = (slot: SectionTimeSlotDto) => {
    setEditingSlotId(slot.id);
    setSelectedPeriodId(slot.period.id);
    setDayOfWeek(String(slot.day_of_week));
    setStartTime(slot.start_time.slice(0, 5));
    setEndTime(slot.end_time.slice(0, 5));
    setSortOrder(String(slot.sort_order));
    setSlotError(null);
    setShowAddSlot(true);
  };

  const handleCreatePeriod = async () => {
    if (!periodName.trim()) {
      setPeriodError("Period name is required.");
      return;
    }

    await createPeriodMutation.mutateAsync({
      name: periodName.trim(),
      description: periodDescription.trim() || undefined,
      period_type: periodType,
    });
    setShowCreatePeriod(false);
  };

  const handleCreateSlot = async () => {
    if (!effectiveSectionId) {
      setSlotError("Select a section first.");
      return;
    }
    if (!effectivePeriodId) {
      setSlotError("Create or select a period first.");
      return;
    }
    if (!startTime || !endTime) {
      setSlotError("Start and end time are required.");
      return;
    }

    const payload = {
      period: effectivePeriodId,
      day_of_week: Number(effectiveDayOfWeek),
      start_time: startTime,
      end_time: endTime,
      sort_order: Number(sortOrder || "1"),
    };

    if (editingSlotId) {
      await updateSlotMutation.mutateAsync({ id: editingSlotId, payload });
    } else {
      await createSlotMutation.mutateAsync(payload);
    }

    setShowAddSlot(false);
    resetSlotForm();
  };

  const handleGenerateSlots = async () => {
    if (!effectiveSectionId) {
      setSlotError("Select a section first.");
      return;
    }

    if (sourceSectionId) {
      await copySlotsMutation.mutateAsync(sourceSectionId);
    } else {
      await generateSlotsMutation.mutateAsync();
    }

    setShowGenerateSlotsDialog(false);
  };

  const handleRequestDeleteSlot = (slotId: string) => {
    setPendingDeleteSlotId(slotId);
    setShowDeleteSlotDialog(true);
  };

  const handleConfirmDeleteSlot = async () => {
    if (!pendingDeleteSlotId) return;
    await deleteSlotMutation.mutateAsync(pendingDeleteSlotId);
    setPendingDeleteSlotId(null);
    setShowDeleteSlotDialog(false);
  };

  const selectedSectionName = allSections.find((s) => s.id === effectiveSectionId)?.name ?? "-";
  const filteredGradeLevels = useMemo(() => {
    const q = sidebarSearch.trim().toLowerCase();
    if (!q) return gradeLevels;
    return gradeLevels
      .map((gl) => ({
        ...gl,
        sections: gl.sections.filter((s) => s.name.toLowerCase().includes(q) || gl.name.toLowerCase().includes(q)),
      }))
      .filter((gl) => gl.sections.length > 0 || gl.name.toLowerCase().includes(q));
  }, [gradeLevels, sidebarSearch]);
  const skeletonDays = orderedDays.length > 0 ? orderedDays : [1, 2, 3, 4, 5];

  return (
    <PageLayout
      title="Section Timetable Setup"
      description="Define time slots per section — select a section, then add or generate slots."
      loading={periodsLoading}
      error={periodsError}
      refreshAction={() => {
        refetchPeriods();
        if (effectiveSectionId) refetchSlots();
      }}
      noData={false}
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowCalendarDialog(true)}>
            School Calendar
          </Button>
          <Button variant="outline" onClick={() => setShowCreatePeriod(true)}>
            Create Period
          </Button>
          <Button
            variant="outline"
            onClick={openAddSlotDialog}
            disabled={!effectiveSectionId}
          >
            Add Slot
          </Button>
          <Button
            onClick={openGenerateDialog}
            disabled={!effectiveSectionId}
          >
            {sectionSlots.length > 0 ? "Regenerate Slots" : "Generate Slots"}
          </Button>
        </div>
      }
    >
      <div className="flex gap-0 -mx-1" style={{ height: "calc(100vh - 160px)" }}>
        <div className="w-56 shrink-0 border-r flex flex-col">
          <div className="px-2 pb-3 shrink-0">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Find section..."
                value={sidebarSearch}
                onChange={(e) => setSidebarSearch(e.target.value)}
                className="pl-8 h-8 text-xs"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-1">
            {gradeLevelsLoading ? (
              <div className="space-y-2 pt-1 px-2">
                {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-8 w-full rounded-lg" />)}
              </div>
            ) : filteredGradeLevels.length === 0 ? (
              <p className="text-xs text-muted-foreground px-2 pt-3">
                {sidebarSearch ? "No sections match your search." : "No grade levels found."}
              </p>
            ) : (
              <div className="space-y-4 pt-1">
                {filteredGradeLevels.map((gl) => (
                  <div key={gl.id}>
                    <p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
                      {gl.name}
                    </p>
                    <div className="space-y-0.5">
                      {gl.sections.length === 0 ? (
                        <p className="px-2 text-xs text-muted-foreground italic">No sections</p>
                      ) : (
                        gl.sections.map((sec) => {
                          const isActive = sec.id === effectiveSectionId;
                          return (
                            <button
                              key={sec.id}
                              className={cn(
                                "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                                isActive
                                  ? "bg-primary text-primary-foreground font-semibold"
                                  : "hover:bg-muted text-foreground",
                              )}
                              onClick={() => {
                                setSectionId(sec.id);
                                setGradeLevelId(gl.id);
                              }}
                            >
                              {sec.name}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 min-w-0 pl-5 overflow-y-auto">
          {!effectiveSectionId ? (
            <div className="flex items-center justify-center rounded-xl border border-dashed py-16 text-center text-muted-foreground">
              <div className="space-y-2">
                <p className="font-medium">Select a section to view its time slots</p>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div>
                  <h2 className="font-semibold text-base">{selectedSectionName}</h2>
                  <p className="text-xs text-muted-foreground">
                    {allSections.find((s) => s.id === effectiveSectionId)?.gradeLevelName}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-auto">
                  <Badge variant="secondary">{sectionSlots.length} slots</Badge>
                  {sectionSlots.length === 0 && !slotsLoading && (
                    <Badge variant="outline" className="text-amber-600 border-amber-300">
                      No time slots configured
                    </Badge>
                  )}
                </div>
              </div>

            {slotsLoading ? (
            <div className="overflow-hidden rounded-xl border">
              <div className="overflow-x-auto pb-2">
                <div className="inline-flex min-w-full gap-3 align-top">
                  {skeletonDays.map((day) => (
                    <div key={day} className="w-64 min-w-64 rounded-lg border bg-muted/10">
                      <div className="border-b px-3 py-2">
                        <div className="flex items-center justify-between gap-2">
                          <Skeleton className="h-4 w-16" />
                          <Skeleton className="h-5 w-8 rounded-full" />
                        </div>
                      </div>
                      <div className="space-y-2 p-2">
                        {[...Array(4)].map((_, idx) => (
                          <div key={idx} className="min-h-20 rounded-md border bg-background p-2">
                            {idx % 3 === 0 ? (
                              <div className="space-y-1">
                                <div className="flex items-start justify-between gap-2">
                                  <Skeleton className="h-4 w-20" />
                                  <Skeleton className="h-4 w-8 rounded-full" />
                                </div>
                                <Skeleton className="h-3 w-24" />
                                <div className="mt-3 flex items-center justify-between gap-2">
                                  <Skeleton className="h-4 w-12 rounded-full" />
                                  <Skeleton className="h-7 w-7 rounded" />
                                </div>
                              </div>
                            ) : (
                              <div className="h-full w-full rounded-md border border-dashed border-muted-foreground/20 bg-background/60" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : sectionSlots.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center gap-4">
              <div>
                <p className="font-medium">No time slots configured yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Generate default time slots for <span className="font-medium">{selectedSectionName}</span> to get started.
                </p>
              </div>
              <Button
                onClick={() => generateSlotsMutation.mutate()}
                loading={generateSlotsMutation.isPending}
                loadingText="Generating..."
              >
                Generate Time Slots
              </Button>
            </div>
          ) : (
            <div className="rounded-xl border p-4">
              <SlotViews
                slotViewMode="board"
                orderedDays={orderedDays}
                dayNames={DAY_NAMES}
                groupedSlots={groupedSlots}
                maxSlotsPerDay={maxSlotsPerDay}
                onEditSlot={openEditSlotDialog}
                onDeleteSlot={handleRequestDeleteSlot}
              />
            </div>
          )}
            </div>
          )}
        </div>
      </div>

      <DialogBox
        open={showCalendarDialog}
        onOpenChange={setShowCalendarDialog}
        title="School Calendar Settings & Events"
        description="Set operating days and manage calendar events."
        footer={null}
        className="max-w-6xl h-[88vh]"
        contentClassName="pr-1"
      >
        <SchoolCalendarSettingsEvents
          settings={schoolCalendarSettings}
          events={schoolCalendarEvents}
          settingsLoading={updateSchoolCalendarSettingsMutation.isPending}
          eventsLoading={calendarEventsLoading}
          savingSettings={updateSchoolCalendarSettingsMutation.isPending}
          savingEvent={
            createSchoolCalendarEventMutation.isPending || updateSchoolCalendarEventMutation.isPending
          }
          deletingEventId={deleteSchoolCalendarEventMutation.variables}
          onSaveSettings={handleSaveOperatingDays}
          onCreateEvent={handleCreateCalendarEvent}
          onUpdateEvent={handleUpdateCalendarEvent}
          onDeleteEvent={handleDeleteCalendarEvent}
        />
      </DialogBox>

      <DialogBox
        open={showGenerateSlotsDialog}
        onOpenChange={setShowGenerateSlotsDialog}
        title={sectionSlots.length > 0 ? "Regenerate Time Slots" : "Generate Time Slots"}
        description="Generate from default template, or copy from another section in the same grade level."
        onAction={handleGenerateSlots}
        actionLabel={sourceSectionId ? "Copy Slots" : sectionSlots.length > 0 ? "Regenerate" : "Generate"}
        actionLoading={generateSlotsMutation.isPending || copySlotsMutation.isPending}
      >
        <div className="space-y-2">
          <Label>Copy From Section (Optional)</Label>
          <SelectField
            value={sourceSectionId}
            onValueChange={(value) => setSourceSectionId(String(value))}
            disabled={!effectiveSectionId || copyCandidates.length === 0}
            items={copyCandidates.map((section) => ({
              value: section.id,
              label: section.name,
            }))}
            placeholder={copyCandidates.length === 0 ? "No other sections available" : "Use default template"}
            searchable
          />
          <p className="text-xs text-muted-foreground">
            Leave empty to use the default generated template for this section.
          </p>
        </div>
      </DialogBox>

      <DialogBox
        open={showDeleteSlotDialog}
        onOpenChange={(open) => {
          setShowDeleteSlotDialog(open);
          if (!open) setPendingDeleteSlotId(null);
        }}
        title="Delete Time Slot"
        description="Are you sure you want to delete this time slot? This action cannot be undone."
        onAction={handleConfirmDeleteSlot}
        actionLabel="Delete"
        actionVariant="destructive"
        actionLoading={deleteSlotMutation.isPending}
      />

      <CreatePeriodDialog
        open={showCreatePeriod}
        onOpenChange={setShowCreatePeriod}
        periodName={periodName}
        periodDescription={periodDescription}
        periodType={periodType}
        periodError={periodError}
        loading={createPeriodMutation.isPending}
        onPeriodNameChange={setPeriodName}
        onPeriodDescriptionChange={setPeriodDescription}
        onPeriodTypeChange={setPeriodType}
        onSubmit={handleCreatePeriod}
      />

      <AddOrEditSlotDialog
        open={showAddSlot}
        onOpenChange={(open) => {
          setShowAddSlot(open);
          if (!open) {
            resetSlotForm();
          }
        }}
        isEditing={Boolean(editingSlotId)}
        selectedSectionName={selectedSectionName}
        slotError={slotError}
        loading={createSlotMutation.isPending || updateSlotMutation.isPending}
        effectivePeriodId={effectivePeriodId}
        dayOfWeek={effectiveDayOfWeek}
        sortOrder={sortOrder}
        startTime={startTime}
        endTime={endTime}
        periods={periods}
        dayOptions={filteredDayOptions}
        onPeriodChange={setSelectedPeriodId}
        onDayChange={setDayOfWeek}
        onSortOrderChange={setSortOrder}
        onStartTimeChange={setStartTime}
        onEndTimeChange={setEndTime}
        onSubmit={handleCreateSlot}
      />
    </PageLayout>
  );
}
