"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Lock, Unlock } from "lucide-react";
import { useGrading } from "@/lib/api2/grading";
import { useCurrentAcademicYear } from "@/hooks/use-academic-year";
import { showToast } from "@/lib/toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { StickyFooter } from "@/components/shared/sticky-footer";
import { DefaultAssessmentsTable } from "./default-assessments-table";
import { DefaultAssessmentDialog } from "./default-assessment-dialog";
import { SelectSetting, TextSetting } from "./setting-row";
import { SettingsSection } from "./settings-section";
import type { DefaultAssessmentTemplateDto } from "@/lib/api2/grading-types";
import { getQueryClient } from "@/lib/query-client";

interface GradeStyleSettings {
  grading_style: "single_entry" | "multiple_entry";
  grading_style_display: string;
  single_entry_assessment_name: string;
  default_calculation_method: "average" | "weighted" | "points";
}

interface GradeStyleTabProps {
  gradingStyleOptions: Array<{ value: string; label: string }>;
  calculationMethodOptions: Array<{ value: string; label: string }>;
}

type GradingTaskStatus = {
  task?: {
    id?: string;
    status?: "completed" | "failed" | "pending" | "processing";
    detail?: string;
    progress?: number;
    estimated_time_seconds?: number;
  };
  detail?: string;
  section_count?: number;
  async?: boolean;
};

function normalizeSettings(data: unknown): GradeStyleSettings | null {
  if (!data || typeof data !== "object") return null;
  if ("data" in data && data.data && typeof data.data === "object") {
    return data.data as GradeStyleSettings;
  }
  return data as GradeStyleSettings;
}

function normalizeList<T>(data: unknown): T[] {
  if (!data) return [];
  if (Array.isArray(data)) return data as T[];
  if (typeof data === "object" && "results" in data && Array.isArray(data.results)) {
    return data.results as T[];
  }
  if (typeof data === "object" && "data" in data && Array.isArray(data.data)) {
    return data.data as T[];
  }
  return [];
}

export function GradeStyleTab({
  gradingStyleOptions,
  calculationMethodOptions,
}: GradeStyleTabProps) {
  const grading = useGrading();
  const queryClient = getQueryClient();
  const { data: currentYear } = useCurrentAcademicYear();

  const { data: apiSettings, isLoading } = grading.getGradeSettings();
  const { data: defaultAssessments, isLoading: isDefaultAssessmentsLoading } =
    grading.getDefaultTemplate();

  const [settings, setSettings] = useState<GradeStyleSettings | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [acceptChange, setAcceptChange] = useState(false);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState<"save" | "regenerate">("save");
  const [assessmentDialogOpen, setAssessmentDialogOpen] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<DefaultAssessmentTemplateDto | null>(null);

  const settingsData = useMemo(() => normalizeSettings(apiSettings), [apiSettings]);
  const defaultAssessmentList = useMemo(
    () => normalizeList<DefaultAssessmentTemplateDto>(defaultAssessments),
    [defaultAssessments]
  );

  const { data: taskStatus } = grading.getGradingTask(taskId || "", {
    enabled: Boolean(taskId) && isPolling,
    refetchInterval: (query: { state?: { data?: GradingTaskStatus } }) => {
      const status = query?.state?.data?.task?.status;
      if (!isPolling || status === "completed" || status === "failed") {
        return false;
      }
      return 2000;
    },
    refetchIntervalInBackground: false,
  });

  useEffect(() => {
    if (!settingsData) return;
    setSettings({
      grading_style: settingsData.grading_style,
      grading_style_display: settingsData.grading_style_display,
      single_entry_assessment_name: settingsData.single_entry_assessment_name,
      default_calculation_method: settingsData.default_calculation_method,
    });
  }, [settingsData]);

  useEffect(() => {
    const task = taskStatus?.task;
    if (!task) return;
    if (task.status === "completed") {
      setIsPolling(false);
      setTaskId(null);
      setIsUnlocked(false);
      showToast.success("Grade style updated");
      queryClient.invalidateQueries({ queryKey: ["gradeSettings"] });
      queryClient.invalidateQueries({ queryKey: ["gradebooks"] });
      queryClient.invalidateQueries({ queryKey: ["assessments"] });
    }
    if (task.status === "failed") {
      setIsPolling(false);
      setTaskId(null);
      showToast.error("Failed to update grade style", task.detail || "");
    }
  }, [taskStatus, queryClient]);

  const hasChanges = useMemo(() => {
    if (!settings || !settingsData) return false;
    return (
      settings.grading_style !== settingsData.grading_style ||
      settings.single_entry_assessment_name !== settingsData.single_entry_assessment_name ||
      settings.default_calculation_method !== settingsData.default_calculation_method
    );
  }, [settings, settingsData]);

  const { mutate: saveSettings, isPending } = grading.updateGradeSettings({
    onSuccess: (data: GradingTaskStatus & GradeStyleSettings) => {
      if (data.async && data.task?.id) {
        setTaskId(data.task.id);
        setIsPolling(true);
        showToast.info("Processing changes", data.detail);
        return;
      }
      setSettings({
        grading_style: data.grading_style,
        grading_style_display: data.grading_style_display,
        single_entry_assessment_name: data.single_entry_assessment_name,
        default_calculation_method: data.default_calculation_method,
      });
      setIsUnlocked(false);
      showToast.success("Grade style saved");
      queryClient.invalidateQueries({ queryKey: ["gradeSettings"] });
      queryClient.invalidateQueries({ queryKey: ["gradebooks"] });
      queryClient.invalidateQueries({ queryKey: ["assessments"] });
    },
    onError: (error: Error) => {
      showToast.error("Failed to update grade style", error.message);
    },
  });

  const { mutate: regenerate, isPending: isRegenerating } = grading.regenerateGradebooks({
    onSuccess: (data: GradingTaskStatus) => {
      if (data.async && data.task?.id) {
        setTaskId(data.task.id);
        setIsPolling(true);
        showToast.info("Regenerating gradebooks", data.detail);
        return;
      }
      showToast.success("Gradebooks regenerated");
      queryClient.invalidateQueries({ queryKey: ["gradebooks"] });
      queryClient.invalidateQueries({ queryKey: ["assessments"] });
    },
    onError: (error: Error) => {
      showToast.error("Failed to regenerate gradebooks", error.message);
    },
  });

  const handleSave = () => {
    setAcceptChange(false);
    setDialogAction("save");
    setDialogOpen(true);
  };

  const handleRegenerate = () => {
    setAcceptChange(false);
    setDialogAction("regenerate");
    setDialogOpen(true);
  };

  const handleEditAssessment = (assessment: DefaultAssessmentTemplateDto) => {
    setSelectedAssessment(assessment);
    setAssessmentDialogOpen(true);
  };

  const handleAddAssessment = () => {
    setSelectedAssessment(null);
    setAssessmentDialogOpen(true);
  };

  const handleAssessmentSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["defaultAssessmentTemplates"] });
  };

  const proceedWithAction = () => {
    if (!settings || !settingsData) return;
    const hasStyleChange = settings.grading_style !== settingsData.grading_style;
    const requiresConfirmation = dialogAction === "regenerate" || hasStyleChange;
    if (requiresConfirmation && !acceptChange) return;

    if (dialogAction === "regenerate") {
      if (!currentYear?.id) {
        showToast.error("No current academic year found");
        return;
      }
      regenerate({ academic_year: currentYear.id, force: true });
    } else {
      const payload = { ...settingsData, ...settings };
      if (hasStyleChange && acceptChange) {
        (payload as { force?: boolean }).force = true;
      }
      saveSettings(payload);
    }

    setAcceptChange(false);
    setDialogOpen(false);
  };

  const handleDiscard = () => {
    if (!settingsData) return;
    setSettings({
      grading_style: settingsData.grading_style,
      grading_style_display: settingsData.grading_style_display,
      single_entry_assessment_name: settingsData.single_entry_assessment_name,
      default_calculation_method: settingsData.default_calculation_method,
    });
    setIsUnlocked(false);
    setAcceptChange(false);
  };

  const handleChange = (key: keyof GradeStyleSettings, value: string) => {
    setSettings((prev) =>
      prev
        ? {
            ...prev,
            [key]: value,
            ...(key === "grading_style" && {
              grading_style_display:
                gradingStyleOptions.find((opt) => opt.value === value)?.label || "",
            }),
          }
        : prev
    );
  };

  if (isLoading || !settings) {
    return <Skeleton className="h-40 w-full" />;
  }

  const isSingleEntry = settings.grading_style === "single_entry";
  const hasGradingStyleChanged = settings.grading_style !== settingsData?.grading_style;
  const isProcessing = isPending || isPolling || isRegenerating;

  return (
    <>
      <div className="space-y-6 pb-6">
        <Alert className="border-red-200 bg-red-50 text-red-900">
          <AlertTitle className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Critical Settings - Handle with Care
          </AlertTitle>
          <AlertDescription className="space-y-2">
            <p>
              Modifying these settings will have significant impact on your grading system.
            </p>
            <ul className="list-disc space-y-1 pl-4 text-sm">
              <li>
                <strong>Grading Style:</strong> Regenerates assessments and may delete data.
              </li>
              <li>
                <strong>Calculation Method:</strong> Changes how final grades are computed.
              </li>
            </ul>
            <p className="text-xs">
              Make changes before grading starts for the academic year to avoid data loss.
            </p>
          </AlertDescription>
        </Alert>

        <SettingsSection
          title="Grade Style Configuration"
          icon={<AlertTriangle className="h-5 w-5" />}
          headerAction={
            <Button
              size="sm"
              variant={isUnlocked ? "default" : "destructive"}
              icon={isUnlocked ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
              onClick={() => setIsUnlocked((prev) => !prev)}
            >
              {isUnlocked ? "Lock Settings" : "Unlock to Edit"}
            </Button>
          }
        >
          <div className="relative space-y-2">
            <SelectSetting
              label="Grading Style"
              description="Choose how teachers will enter grades"
              value={settings.grading_style}
              options={gradingStyleOptions}
              onChange={(value) => handleChange("grading_style", value)}
              disabled={!isUnlocked}
            />
            <SelectSetting
              label="Default Calculation Method"
              description="How final grades are calculated"
              value={settings.default_calculation_method}
              options={calculationMethodOptions}
              onChange={(value) => handleChange("default_calculation_method", value)}
              disabled={!isUnlocked}
            />
            {isSingleEntry && (
              <TextSetting
                label="Final Grade Label"
                description="Name for the single entry grade field"
                value={settings.single_entry_assessment_name}
                onChange={(value) => handleChange("single_entry_assessment_name", value)}
                placeholder="Final Grade"
                disabled={!isUnlocked}
              />
            )}
            <div className="flex justify-end">
              <Button
                variant="destructive"
                disabled={!isUnlocked}
                loading={isRegenerating}
                onClick={handleRegenerate}
              >
                Regenerate Gradebooks
              </Button>
            </div>
            {!isUnlocked && (
              <div className="absolute inset-0 rounded-lg bg-background/40 backdrop-blur-[1px]" />
            )}
          </div>
        </SettingsSection>

        {!isSingleEntry && (
          <DefaultAssessmentsTable
            assessments={defaultAssessmentList}
            isLoading={isDefaultAssessmentsLoading}
            onEdit={handleEditAssessment}
            onAdd={handleAddAssessment}
          />
        )}

        {isPolling && (
          <Alert className="border-blue-200 bg-blue-50 text-blue-900">
            <AlertDescription>
              Processing changes in background. Please keep this page open.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {hasChanges && (
        <StickyFooter>
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-orange-600">
              Unsaved changes in Grade Style settings
            </span>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleDiscard} disabled={isProcessing}>
                Discard
              </Button>
              <Button loading={isProcessing} onClick={handleSave}>
                Save Grade Style
              </Button>
            </div>
          </div>
        </StickyFooter>
      )}

      <DefaultAssessmentDialog
        open={assessmentDialogOpen}
        onOpenChange={setAssessmentDialogOpen}
        assessment={selectedAssessment}
        onSuccess={handleAssessmentSuccess}
      />

      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {dialogAction === "regenerate" ? "Regenerate Gradebooks" : "Confirm Grade Style Changes"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {dialogAction === "regenerate"
                ? "This will delete and recreate gradebooks for the current academic year."
                : "Changing grade style may regenerate assessments and affect existing data."}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {(dialogAction === "regenerate" || hasGradingStyleChanged) && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <label className="flex items-start gap-3">
                <Checkbox
                  checked={acceptChange}
                  onCheckedChange={(checked) => setAcceptChange(Boolean(checked))}
                  disabled={isProcessing}
                />
                <span>
                  I understand that this action can regenerate gradebooks and may delete data.
                </span>
              </label>
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              loading={isProcessing}
              onClick={proceedWithAction}
              disabled={(dialogAction === "regenerate" || hasGradingStyleChanged) && !acceptChange}
            >
              {dialogAction === "regenerate" ? "Regenerate" : "Save Changes"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
