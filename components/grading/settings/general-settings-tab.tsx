"use client";

import { useEffect, useMemo, useState } from "react";
import { Settings } from "lucide-react";
import { useGrading } from "@/lib/api2/grading";
import { showToast } from "@/lib/toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { SettingsSection } from "./settings-section";
import { ToggleSetting } from "./setting-row";
import { StickyFooter } from "@/components/shared/sticky-footer";
import { getQueryClient } from "@/lib/query-client";

interface GeneralSettings {
  grading_style: "single_entry" | "multiple_entry";
  use_default_templates: boolean;
  auto_calculate_final_grade: boolean;
  require_grade_approval: boolean;
  require_grade_review: boolean;
  display_assessment_on_single_entry: boolean;
  allow_assessment_delete: boolean;
  allow_assessment_create: boolean;
  allow_assessment_edit: boolean;
  use_letter_grades: boolean;
  allow_teacher_override: boolean;
  lock_grades_after_semester: boolean;
  display_grade_status: boolean;
  cumulative_average_calculation: boolean;
}

function normalizeSettings(data: unknown): GeneralSettings | null {
  if (!data || typeof data !== "object") return null;
  if ("data" in data && data.data && typeof data.data === "object") {
    return data.data as GeneralSettings;
  }
  return data as GeneralSettings;
}

export function GeneralSettingsTab() {
  const grading = useGrading();
  const queryClient = getQueryClient();

  const { data: apiSettings, isLoading } = grading.getGradeSettings();
  const [settings, setSettings] = useState<GeneralSettings | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const settingsData = useMemo(() => normalizeSettings(apiSettings), [apiSettings]);

  useEffect(() => {
    if (!settingsData) return;
    setSettings({
      grading_style: settingsData.grading_style,
      use_default_templates: settingsData.use_default_templates,
      auto_calculate_final_grade: settingsData.auto_calculate_final_grade,
      require_grade_approval: settingsData.require_grade_approval,
      require_grade_review: settingsData.require_grade_review,
      display_assessment_on_single_entry: settingsData.display_assessment_on_single_entry,
      allow_assessment_delete: settingsData.allow_assessment_delete,
      allow_assessment_create: settingsData.allow_assessment_create,
      allow_assessment_edit: settingsData.allow_assessment_edit,
      use_letter_grades: settingsData.use_letter_grades,
      allow_teacher_override: settingsData.allow_teacher_override,
      lock_grades_after_semester: settingsData.lock_grades_after_semester,
      display_grade_status: settingsData.display_grade_status,
      cumulative_average_calculation: settingsData.cumulative_average_calculation ?? true,
    });
  }, [settingsData]);

  const hasChanges = useMemo(() => {
    if (!settings || !settingsData) return false;
    return JSON.stringify(settings) !== JSON.stringify({
      grading_style: settingsData.grading_style,
      use_default_templates: settingsData.use_default_templates,
      auto_calculate_final_grade: settingsData.auto_calculate_final_grade,
      require_grade_approval: settingsData.require_grade_approval,
      require_grade_review: settingsData.require_grade_review,
      display_assessment_on_single_entry: settingsData.display_assessment_on_single_entry,
      allow_assessment_delete: settingsData.allow_assessment_delete,
      allow_assessment_create: settingsData.allow_assessment_create,
      allow_assessment_edit: settingsData.allow_assessment_edit,
      use_letter_grades: settingsData.use_letter_grades,
      allow_teacher_override: settingsData.allow_teacher_override,
      lock_grades_after_semester: settingsData.lock_grades_after_semester,
      display_grade_status: settingsData.display_grade_status,
      cumulative_average_calculation: settingsData.cumulative_average_calculation ?? true,
    });
  }, [settings, settingsData]);

  const { mutate: saveSettings } = grading.updateGradeSettings({
    onSuccess: (data: GeneralSettings) => {
      setIsSaving(false);
      setSettings(data);
      showToast.success("General settings saved");
      queryClient.invalidateQueries({ queryKey: ["gradeSettings"] });
    },
    onError: (error: Error) => {
      setIsSaving(false);
      showToast.error("Failed to save general settings", error.message);
    },
  });

  const handleSave = () => {
    if (!settingsData || !settings) return;
    setIsSaving(true);
    const fullSettings = { ...settingsData, ...settings };
    saveSettings(fullSettings);
  };

  const handleDiscard = () => {
    if (!settingsData) return;
    setSettings({
      grading_style: settingsData.grading_style,
      use_default_templates: settingsData.use_default_templates,
      auto_calculate_final_grade: settingsData.auto_calculate_final_grade,
      require_grade_approval: settingsData.require_grade_approval,
      require_grade_review: settingsData.require_grade_review,
      display_assessment_on_single_entry: settingsData.display_assessment_on_single_entry,
      allow_assessment_delete: settingsData.allow_assessment_delete,
      allow_assessment_create: settingsData.allow_assessment_create,
      allow_assessment_edit: settingsData.allow_assessment_edit,
      use_letter_grades: settingsData.use_letter_grades,
      allow_teacher_override: settingsData.allow_teacher_override,
      lock_grades_after_semester: settingsData.lock_grades_after_semester,
      display_grade_status: settingsData.display_grade_status,
      cumulative_average_calculation: settingsData.cumulative_average_calculation ?? true,
    });
  };

  const handleChange = (key: keyof GeneralSettings, value: boolean) => {
    setSettings((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  if (isLoading || !settings) {
    return (
      <div className="space-y-6">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-40 w-full" />
        ))}
      </div>
    );
  }

  const isSingleEntry = settings.grading_style === "single_entry";

  return (
    <>
      <div className="space-y-6 pb-6">
        <SettingsSection title="Workflow & Approval" icon={<Settings className="h-5 w-5" />}>
          <ToggleSetting
            label="Auto-Calculate Final Grades"
            description="Automatically calculate final grades from assessments"
            checked={settings.auto_calculate_final_grade}
            onChange={(checked) => handleChange("auto_calculate_final_grade", checked)}
          />
          <ToggleSetting
            label="Use Letter Grades"
            description="Display grades as letters (A, B, C) instead of numbers"
            checked={settings.use_letter_grades}
            onChange={(checked) => handleChange("use_letter_grades", checked)}
          />
          <ToggleSetting
            label="Require Grade Review"
            description="Teachers must review grades before submission"
            checked={settings.require_grade_review}
            onChange={(checked) => handleChange("require_grade_review", checked)}
          />
          <ToggleSetting
            label="Require Grade Approval"
            description="Grades need admin approval before finalization"
            checked={settings.require_grade_approval}
            onChange={(checked) => handleChange("require_grade_approval", checked)}
          />
          <ToggleSetting
            label="Display Grade Status"
            description="Show workflow status (pending, reviewed, approved)"
            checked={settings.display_grade_status}
            onChange={(checked) => handleChange("display_grade_status", checked)}
          />
        </SettingsSection>

        {!isSingleEntry && (
          <SettingsSection title="Assessment Permissions" icon={<Settings className="h-5 w-5" />}>
            <ToggleSetting
              label="Allow Assessment Creation"
              description="Teachers can create new assessments"
              checked={settings.allow_assessment_create}
              onChange={(checked) => handleChange("allow_assessment_create", checked)}
            />
            <ToggleSetting
              label="Allow Assessment Editing"
              description="Teachers can edit existing assessments"
              checked={settings.allow_assessment_edit}
              onChange={(checked) => handleChange("allow_assessment_edit", checked)}
            />
            <ToggleSetting
              label="Allow Assessment Deletion"
              description="Teachers can delete assessments"
              checked={settings.allow_assessment_delete}
              onChange={(checked) => handleChange("allow_assessment_delete", checked)}
            />
          </SettingsSection>
        )}

        <SettingsSection title="Additional Options" icon={<Settings className="h-5 w-5" />}>
          {isSingleEntry && (
            <ToggleSetting
              label="Display Assessment Column"
              description="Show assessment column in single entry mode"
              checked={settings.display_assessment_on_single_entry}
              onChange={(checked) => handleChange("display_assessment_on_single_entry", checked)}
            />
          )}
          <ToggleSetting
            label="Allow Teacher Override"
            description="Teachers can override calculated final grades"
            checked={settings.allow_teacher_override}
            onChange={(checked) => handleChange("allow_teacher_override", checked)}
          />
          <ToggleSetting
            label="Use Default Templates"
            description="Apply default grading templates for new gradebooks"
            checked={settings.use_default_templates}
            onChange={(checked) => handleChange("use_default_templates", checked)}
          />
          <ToggleSetting
            label="Lock Grades After Semester"
            description="Prevent grade changes after semester ends"
            checked={settings.lock_grades_after_semester}
            onChange={(checked) => handleChange("lock_grades_after_semester", checked)}
          />
          <ToggleSetting
            label="Cumulative Average Calculation"
            description="Calculate averages progressively with available grades"
            checked={settings.cumulative_average_calculation}
            onChange={(checked) => handleChange("cumulative_average_calculation", checked)}
          />
        </SettingsSection>
      </div>

      {hasChanges && (
        <StickyFooter>
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-orange-600">Unsaved changes</span>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleDiscard}>
                Discard
              </Button>
              <Button loading={isSaving} onClick={handleSave}>
                Save General Settings
              </Button>
            </div>
          </div>
        </StickyFooter>
      )}
    </>
  );
}
