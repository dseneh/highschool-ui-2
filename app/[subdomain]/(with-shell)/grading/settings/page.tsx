"use client";

import PageLayout from "@/components/dashboard/page-layout";
import { GradingSettingsForm } from "@/components/grading/settings/settings-form";

export default function GradingSettingsPage() {
  return (
    <PageLayout
      title="Grading Settings"
      description="Configure how grading works across your school"
    >
      <div className="space-y-6">
        <GradingSettingsForm />
      </div>
    </PageLayout>
  );
}
