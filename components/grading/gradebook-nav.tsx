"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useQueryState } from "nuqs";
import { useGrading } from "@/lib/api2/grading";
import { useCurrentAcademicYear } from "@/hooks/use-academic-year";
import { SelectField } from "@/components/ui/select-field";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent } from "@/components/ui/card";
import { GradeLevelSelect, SectionSelect } from "@/components/shared/data-reusable";
import { Pencil } from "lucide-react";

interface GradebookNavProps {
  currentGradebookId?: string;
  currentGradebook?: {
    id: string;
    subject: { name: string; id: string };
    section: { name: string; id: string };
    grade_level: { name: string; id: string };
  };
  rightContent?: ReactNode;
}

export function GradebookNav({ currentGradebook, rightContent }: GradebookNavProps) {
  const router = useRouter();
  const params = useParams();

  const gradebookId = params.id as string;
   
  const [selectedSection, setSelectedSection] = useQueryState("section");
  const [selectedGradeLevel, setSelectedGradeLevel] = useQueryState("gradeLevel");
  
  const [isOpen, setIsOpen] = useState(false);

    const [pendingGradeLevel, setPendingGradeLevel] = useState(
    selectedGradeLevel || currentGradebook?.grade_level?.id || ""
  );
  const [pendingSection, setPendingSection] = useState(
    selectedSection || currentGradebook?.section?.id || ""
  );
  const [pendingGradebook, setPendingGradebook] = useState(
    gradebookId || currentGradebook?.id || ""
  );


  const { data: currentYear } = useCurrentAcademicYear();
  const grading = useGrading();
  
  const { data: gradebooks } = grading.getGradeBooks(currentYear?.id || "", 
    { section: pendingSection! },
    { enabled: !!currentYear?.id && !!pendingSection }
  );
  
  // const gradeBooksOptions = useMemo(() => {
  //       if (!gradebooks && !selectedSection) return []
  //           return (
  //               gradebooks?.results?.map((gb: any) => ({
  //                   label: gb.subject.name,
  //                   value: gb.id,
  //                   gradebookName: gb.name,
  //                   subjectName: gb.subject.name,
  //               })) || []
  //           )
  //       }, [gradebooks, selectedSection])
  

  const prevGradeLevelRef = useRef<string | null>(null);
  const prevSectionRef = useRef<string | null>(null);

  // Extract results from paginated response - memoized to prevent dependency changes
  const gradebookList = useMemo(() => {
    if (Array.isArray(gradebooks)) return gradebooks;
    return gradebooks?.results || [];
  }, [gradebooks]);

  // Default grade level and section to the current gradebook
  useEffect(() => {
    if (!selectedGradeLevel && currentGradebook?.grade_level?.id) {
      setSelectedGradeLevel(currentGradebook.grade_level.id);
    }
    if (!selectedSection && currentGradebook?.section?.id) {
      setSelectedSection(currentGradebook.section.id);
    }
  }, [
    currentGradebook,
    selectedGradeLevel,
    selectedSection,
    setSelectedGradeLevel,
    setSelectedSection,
  ]);

  const gradebookOptions = useMemo(() => {
    return gradebookList
      .filter((gb: any) => !pendingSection || gb.section.id === pendingSection)
      .map((gb: any) => ({
        value: gb.id,
        label: gb.subject.name,
      }));
  }, [gradebookList, pendingSection]);

  // Track grade level changes to reset section and gradebook
  useEffect(() => {
    if (!pendingGradeLevel) return;

    if (prevGradeLevelRef.current === null) {
      prevGradeLevelRef.current = pendingGradeLevel;
      return;
    }

    if (prevGradeLevelRef.current !== pendingGradeLevel) {
      prevGradeLevelRef.current = pendingGradeLevel;
      // Schedule state updates after effect completes
      queueMicrotask(() => {
        setPendingSection("");
        setPendingGradebook("");
      });
    }
  }, [pendingGradeLevel]);

  // Track section changes to reset gradebook
  useEffect(() => {
    if (prevSectionRef.current === null) {
      prevSectionRef.current = pendingSection;
      return;
    }

    if (prevSectionRef.current !== pendingSection) {
      prevSectionRef.current = pendingSection;
      // Schedule state updates after effect completes
      queueMicrotask(() => {
        setPendingGradebook("");
      });
    }
  }, [pendingSection]);

  const handleGradebookChange = useCallback((newGradebookId: string) => {
    // Navigate to the new gradebook and preserve query params
    const queryString = new URLSearchParams();
    if (selectedSection) queryString.append("section", selectedSection);
    if (selectedGradeLevel) queryString.append("gradeLevel", selectedGradeLevel);
    
    const queryStr = queryString.toString();
    router.push(
      `/grading/gradebooks/${newGradebookId}${queryStr ? `?${queryStr}` : ""}`
    );
  }, [router, selectedSection, selectedGradeLevel]);

  // Auto-navigate if section changes and current gradebook is no longer in section
  useEffect(() => {
    if (!selectedSection || gradebookList.length === 0) {
      return;
    }

    const currentId = params.id as string;
    const inSection = gradebookList.filter(
      (gb: any) => gb.section.id === selectedSection
    );
    const hasCurrent = inSection.some((gb: any) => gb.id === currentId);
    if (!hasCurrent && inSection.length > 0) {
      handleGradebookChange(inSection[0].id);
    }
  }, [selectedSection, gradebookList, params.id, handleGradebookChange]);

  const applyFilters = () => {
    if (!pendingGradeLevel || !pendingSection || !pendingGradebook) {
      return;
    }

    // setSelectedGradeLevel(pendingGradeLevel);
    // setSelectedSection(pendingSection);
    // handleGradebookChange(pendingGradebook);
    router.push(`/grading/gradebooks/${pendingGradebook}?gradeLevel=${pendingGradeLevel}&section=${pendingSection}`);
    setIsOpen(false);
  };

  const syncPendingValues = () => {
    if (!currentGradebook) return;
    // setPendingGradeLevel(selectedGradeLevel || currentGradebook.grade_level.id);
    // setPendingSection(selectedSection || currentGradebook.section.id);
    // setPendingGradebook(gradebookId);
  };

  if (!currentGradebook) return null;

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 fpt-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1 min-w-0">
          {/* <div className="text-sm font-medium text-muted-foreground">Current Selection</div> */}
          <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap items-center gap-2 rounded-md border border-primary bg-primary/5 px-2 py-1 text-base font-semibold sm:text-lg divide-x divide-primary">
            <span className="pe-2">
              {currentGradebook.grade_level.name} {" - "}
              {currentGradebook.section.name}
            </span>
            <span className="text-primary">
              {currentGradebook.subject.name}
            </span>
            </div>
           
        <Popover
          open={isOpen}
          onOpenChange={(open) => {
            setIsOpen(open);
            if (open) {
              syncPendingValues();
            }
          }}
        >
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="xs"
              icon={<Pencil className="h-4 w-4" />}
            >
              Change
            </Button>
          </PopoverTrigger>
          <PopoverContent side="bottom" align="end" className="w-90">
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="text-xs font-medium text-muted-foreground">Grade Level</div>
                  <GradeLevelSelect
                    useUrlState={false}
                    value={pendingGradeLevel}
                    onChange={setPendingGradeLevel}
                    placeholder="Select grade level"
                    noTitle
                  />
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-medium text-muted-foreground">Section</div>
                  <SectionSelect
                    useUrlState={false}
                    gradeLevelId={pendingGradeLevel || ""}
                    value={pendingSection}
                    onChange={setPendingSection}
                    placeholder="Select section"
                    noTitle
                  />
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-medium text-muted-foreground">Subject</div>
                  <SelectField
                    items={gradebookOptions}
                    value={pendingGradebook}
                    onValueChange={(value: unknown) => setPendingGradebook(value as string)}
                    placeholder="Select subject"
                    disabled={!pendingSection || gradebookOptions.length === 0}
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2">
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={applyFilters}
                  disabled={!pendingGradeLevel || !pendingSection || !pendingGradebook}
                >
                  Apply
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
          </div>
        </div>
           {rightContent}
      </CardContent>
    </Card>
  );
}
