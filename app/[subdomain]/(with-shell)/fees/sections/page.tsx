"use client";

import * as React from "react";
import PageLayout from "@/components/dashboard/page-layout";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { useGradeLevels } from "@/hooks/use-grade-level";
import { useSections } from "@/hooks/use-section";
import { useGeneralFees } from "@/hooks/use-finance";
import GradeLevelSelect from "@/components/shared/data-reusable/grade-level-select";
import { SectionFeeList } from "@/components/finance/section-fee-list";
import {
  EmptyState,
  EmptyStateTitle,
  EmptyStateDescription,
} from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCcw } from "lucide-react";
import { useQueryState } from "nuqs";
import { formatCurrency } from "@/lib/utils";


export default function SectionFeesPage() {
  const [selectedGradeId, setSelectedGradeId] = useQueryState("gradeLevel");

  // Data queries
  const { data: gradeLevels, isLoading: loadingGrades } = useGradeLevels();
  const {
    data: sections,
    isLoading: loadingSections,
    refetch,
    isFetching,
  } = useSections(selectedGradeId || undefined);
  const { data: generalFees, isLoading: loadingFees } = useGeneralFees();

  // Selected grade data
  const selectedGrade = React.useMemo(() => {
    if (!gradeLevels || !selectedGradeId) return null;
    return gradeLevels.find((g: { id: string }) => g.id === selectedGradeId) || null;
  }, [gradeLevels, selectedGradeId]);

  const isLoading = loadingGrades || loadingSections || loadingFees;
  const showSections = selectedGradeId && sections && sections.length > 0;
  const showEmpty = selectedGradeId && sections && sections.length === 0;
  const isEmpty = showEmpty || !selectedGradeId;

  return (
    <PageLayout
      title="Section Fee Assignment"
      description="Assign fees to specific sections and customize amounts"
      actions={
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="font-semibold text-sm">Select Grade Level</div>
            <GradeLevelSelect
            value={selectedGradeId || ""}
            onChange={(value) => setSelectedGradeId(value)}
            showActiveOnly
            noTitle
            placeholder="Select grade level..."
            selectClassName="w-[200px]"
          />
          </div>
          {selectedGradeId && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => refetch()}
              loading={isFetching}
              icon={<RefreshCcw className="h-4 w-4" />}
            />
          )}
        </div>
      }
      loading={isLoading}
      skeleton={
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      }
      noData={isEmpty}
      emptyState={
        !selectedGradeId ? (
          <EmptyState>
            <EmptyStateTitle>Select a Grade Level</EmptyStateTitle>
            <EmptyStateDescription>
              Choose a grade level from the dropdown to view and manage section fees.
            </EmptyStateDescription>
          </EmptyState>
        ) : (
          <EmptyState>
            <EmptyStateTitle>No Sections Found</EmptyStateTitle>
            <EmptyStateDescription>
              There are no active sections in {selectedGrade?.name || "this grade level"}.
            </EmptyStateDescription>
          </EmptyState>
        )
      }
    >
      {showSections && (
        <div className="space-y-6">
          {/* Grade Level Summary */}
          {selectedGrade && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedGrade.name} ({sections.length} Section{sections.length > 1 ? "s" : ""})
                </CardTitle>
              </CardHeader>
            </Card>
          )}

          {/* Section Accordion */}
          <Accordion className="space-y-3">
            {sections.map((section: { id: string; name: string; students?: number; tuition_fees?: number }) => (
              <AccordionItem key={section.id} value={section.id}>
                <AccordionTrigger>
                  <div className="flex items-center justify-between w-full pr-4">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">{section.name}</span>
                      {section.students !== undefined && (
                        <Badge variant="secondary" className="text-xs">
                          {section.students} students
                        </Badge>
                      )}
                    </div>
                    {section.tuition_fees !== undefined && section.tuition_fees > 0 && (
                      <span className="text-sm text-muted-foreground">
                        Total: {formatCurrency(section.tuition_fees)}
                      </span>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <SectionFeeList
                    section={section}
                    availableFees={generalFees || []}
                  />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      )}
    </PageLayout>
  );
}
