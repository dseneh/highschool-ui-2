"use client";

import { Settings, Sliders } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useGrading } from "@/lib/api2/grading";
import { GeneralSettingsTab } from "./general-settings-tab";
import { GradeStyleTab } from "./grade-style-tab";
import { AssessmentTypesTab } from "./assessment-types-tab";
import { GradeLettersTab } from "./grade-letters-tab";

const gradingStyleOptions = [
  { value: "single_entry", label: "Single Entry (Final Grades Only)" },
  { value: "multiple_entry", label: "Multiple Entry (Assessments & Final Grades)" },
];

const calculationMethodOptions = [
  { value: "average", label: "Average" },
  { value: "weighted", label: "Weighted Average" },
  { value: "points", label: "Total Points" },
];

export function GradingSettingsForm() {
  const grading = useGrading();
  const { isLoading } = grading.getGradeSettingsInit();

  if (isLoading) {
    return <Skeleton className="h-40 w-full" />;
  }

  return (
    <Tabs defaultValue="general" className="space-y-6">
      <TabsList>
        <TabsTrigger value="general">
          <span className="inline-flex items-center gap-2">
            <Settings className="h-4 w-4" />
            General Settings
          </span>
        </TabsTrigger>
        <TabsTrigger value="grade-style">
          <span className="inline-flex items-center gap-2">
            <Sliders className="h-4 w-4" />
            Grade Style
          </span>
        </TabsTrigger>
        <TabsTrigger value="assessment-types">Assessment Types</TabsTrigger>
        <TabsTrigger value="grade-letters">Grade Letters</TabsTrigger>
      </TabsList>

      <TabsContent value="general">
        <GeneralSettingsTab />
      </TabsContent>
      <TabsContent value="grade-style">
        <GradeStyleTab
          gradingStyleOptions={gradingStyleOptions}
          calculationMethodOptions={calculationMethodOptions}
        />
      </TabsContent>
      <TabsContent value="assessment-types">
        <AssessmentTypesTab />
      </TabsContent>
      <TabsContent value="grade-letters">
        <GradeLettersTab />
      </TabsContent>
    </Tabs>
  );
}
