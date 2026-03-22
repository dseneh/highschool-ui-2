"use client";

import { useState } from "react";
import { ArrowLeft, RefreshCcw } from "lucide-react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, FileIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SelectField } from "@/components/ui/select-field";
import { MarkingPeriodSelect } from "@/components/shared/data-reusable";

interface MarkingPeriodOption {
  value: string;
  label: string;
}

interface GradebookHeaderActionsProps {
  fromTeacherGrades: boolean;
  onBack: () => void;
  loading: boolean;
  fetching: boolean;
  canEdit: boolean;
  hasMarkingPeriod: boolean;
  canEditGrades: boolean;
  onOpenCreateAssessment: () => void;
  onOpenUploadGrades: () => void;
  onRefresh: () => void;
}

export function GradebookHeaderActions({
  fromTeacherGrades,
  onBack,
  loading,
  fetching,
  canEdit,
  hasMarkingPeriod,
  canEditGrades,
  onOpenCreateAssessment,
  onOpenUploadGrades,
  onRefresh,
}: GradebookHeaderActionsProps) {
  const [isMobileActionsOpen, setIsMobileActionsOpen] = useState(false);

  const closeMobilePopover = () => setIsMobileActionsOpen(false);

  return (
    <div className="w-full">
      <div className="flex lg:hidden items-center justify-end">
        <Popover open={isMobileActionsOpen} onOpenChange={setIsMobileActionsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="mb-0.5">Actions</Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-75 space-y-3 p-3">
            {fromTeacherGrades ? (
              <Button
                variant="outline"
                iconLeft={<ArrowLeft className="h-4 w-4" />}
                onClick={() => {
                  closeMobilePopover();
                  onBack();
                }}
                className="w-full"
              >
                Back to My Classes
              </Button>
            ) : null}

            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">Marking Period</p>
              <MarkingPeriodSelect 
              noTitle
              selectClassName="bg-primary/10 border-primary"
              />
              
            </div>

            <div className="flex flex-col gap-2">
              {canEdit ? (
                <Button
                  variant="outline"
                  icon={<HugeiconsIcon icon={Add01Icon} className="h-4 w-4" />}
                  onClick={() => {
                    closeMobilePopover();
                    onOpenCreateAssessment();
                  }}
                  disabled={loading || fetching}
                  className="w-full"
                >
                  Add Assessment
                </Button>
              ) : null}

              <Button
                variant="info-outline"
                icon={<HugeiconsIcon icon={FileIcon} className="h-4 w-4" />}
                onClick={() => {
                  closeMobilePopover();
                  onOpenUploadGrades();
                }}
                disabled={loading || fetching || !hasMarkingPeriod || !canEditGrades}
                className="w-full"
              >
                Upload Grades CSV
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  closeMobilePopover();
                  onRefresh();
                }}
                loading={loading || fetching}
                icon={<RefreshCcw className="h-4 w-4" />}
                className="w-full"
              >
                Refresh
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="hidden w-full lg:flex lg:flex-row lg:items-center lg:justify-end lg:gap-2">
        {fromTeacherGrades ? (
          <Button
            variant="outline"
            iconLeft={<ArrowLeft className="h-4 w-4" />}
            onClick={onBack}
            className="w-full lg:w-auto"
          >
            Back to My Classes
          </Button>
        ) : null}

        <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center lg:w-auto">
          <label htmlFor="marking-period-select" className="shrink-0 text-sm font-medium text-foreground">
            Marking Period:
          </label>
          <div className="w-full sm:min-w-60 lg:w-62.5">
            <MarkingPeriodSelect 
              noTitle
              selectClassName="bg-primary/10 border-primary"
              />
          </div>
        </div>

        <div className="flex w-full flex-wrap gap-2 lg:w-auto lg:justify-end">
          {canEdit ? (
            <Button
              variant="outline"
              icon={<HugeiconsIcon icon={Add01Icon} className="h-4 w-4" />}
              onClick={onOpenCreateAssessment}
              disabled={loading || fetching}
              className="flex-1 sm:flex-none"
            >
              Add Assessment
            </Button>
          ) : null}

          <Button
            variant="warning-outline"
            icon={<HugeiconsIcon icon={FileIcon} className="h-4 w-4" />}
            onClick={onOpenUploadGrades}
            disabled={loading || fetching || !hasMarkingPeriod || !canEditGrades}
            className="flex-1 sm:flex-none"
          >
            Upload Grades
          </Button>

          <Button
            variant="outline"
            onClick={onRefresh}
            loading={loading || fetching}
            icon={<RefreshCcw className="h-4 w-4" />}
          />
        </div>
      </div>
    </div>
  );
}
