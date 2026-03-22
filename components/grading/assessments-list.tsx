"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HugeiconsIcon } from "@hugeicons/react";
import { Edit02Icon, Delete02Icon, Add01Icon } from "@hugeicons/core-free-icons";
import type { AssessmentDto } from "@/lib/api2/grading-types";
import { StatsBasic, StatsProgress } from "./assessment-stats";
import { cn } from "@/lib/utils";

// Color mapping for assessment types
const ASSESSMENT_TYPE_COLORS: Record<string, string> = {
  Exam: "bg-primary",
  Project: "bg-accent",
  Quiz: "bg-success",
  Homework: "bg-warning",
  Assignment: "bg-orange-500",
  Test: "bg-red-500",
  Lab: "bg-pink-500",
  Participation: "bg-purple-500",
  default: "bg-gray-500",
};

interface AssessmentsListProps {
  assessments: AssessmentDto[];
  canEdit?: boolean;
  canDelete?: boolean;
  canAdd?: boolean;
  onEdit?: (assessment: AssessmentDto) => void;
  onDelete?: (assessment: AssessmentDto) => void;
  onAdd?: () => void;
}

export function AssessmentsList({
  assessments,
  canEdit = false,
  canDelete = false,
  canAdd = false,
  onEdit,
  onDelete,
  onAdd,
}: AssessmentsListProps) {
  const getTypeColor = (typeName: string) => {
    return ASSESSMENT_TYPE_COLORS[typeName] || ASSESSMENT_TYPE_COLORS.default;
  };

  if (assessments.length === 0) {
    return (
      <Card className="p-8 text-center">
        {canAdd ? (
          <div className="space-y-4">
            <div className="text-muted-foreground">
              No assessments found. Click &quot;Add Assessment&quot; to create
              one.
            </div>
            {onAdd && (
              <Button
                variant="default"
                icon={<HugeiconsIcon icon={Add01Icon} className="h-4 w-4" />}
                onClick={onAdd}
              >
                Add Assessment
              </Button>
            )}
          </div>
        ) : (
          <div className="text-muted-foreground">No assessments found.</div>
        )}
      </Card>
    );
  }

  return (
    <div className="fspace-y-3">
      {assessments.map((assessment) => {
        const typeColor = getTypeColor(assessment.assessment_type.name);
        return (
          <Card
            key={assessment.id}
            className="hover:shadow-md transition-shadow"
          >
            <CardContent className="fp-4">
              <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                {/* Left Section: Color Bar + Title & Basic Info */}
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div
                    className={cn(
                      "w-1 h-16 rounded-full shrink-0",
                      typeColor
                    )}
                  />
                  <div className="flex-1 min-w-0 space-y-3">
                    <div>
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h5 className="font-semibold text-foreground text-base">
                          {assessment.name}
                        </h5>
                        <Badge
                          variant="secondary"
                          className={cn(
                            typeColor,
                            "bg-opacity-10 text-foreground"
                          )}
                        >
                          {assessment.assessment_type.name}
                        </Badge>
                      </div>
                      <StatsBasic
                        maxScore={assessment.max_score}
                        weight={assessment.weight}
                        dueDate={assessment.due_date}
                      />
                    </div>

                    {/* Progress on mobile - below title */}
                    {assessment.statistics && (
                      <div className="lg:hidden">
                        <StatsProgress statistics={assessment.statistics} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Section: Progress (Desktop) + Actions */}
                <div className="flex items-start gap-4 lg:ml-auto">
                  {assessment.statistics && (
                    <div className="hidden lg:block min-w-[320px]">
                      <StatsProgress statistics={assessment.statistics} />
                    </div>
                  )}
                  {(canEdit || canDelete) && (
                    <div className="flex items-center gap-2 shrink-0">
                      {canEdit && onEdit && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-9 w-9"
                          onClick={() => onEdit(assessment)}
                        >
                          <HugeiconsIcon
                            icon={Edit02Icon}
                            className="h-4 w-4"
                          />
                        </Button>
                      )}
                      {canDelete && onDelete && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-9 w-9"
                          onClick={() => onDelete(assessment)}
                        >
                          <HugeiconsIcon
                            icon={Delete02Icon}
                            className="h-4 w-4"
                          />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
