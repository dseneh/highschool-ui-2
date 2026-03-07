"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { useGradingApi } from "@/lib/api2/grading/api";
import { useGrading } from "@/lib/api2/grading";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
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
import { StickyFooter } from "@/components/shared/sticky-footer";
import { ChevronLeft, ChevronRight, Loader2, Search, X, AlertCircle, CheckCircle2 } from "lucide-react";
import type {
  GradebookDto,
  GradeEntryAssessment,
  GradeEntryStudent,
  SectionFinalGradesSubjectResponse,
} from "@/lib/api/grading-types";
import { cn, getErrorMessage } from "@/lib/utils";
import { showToast } from "@/lib/toast";
import { getQueryClient } from "@/lib/query-client";
import AlertDialogBox from "../shared/alert-dialogbox";

interface GradeEntryTableProps {
  gradebook: GradebookDto;
  markingPeriodId?: string | null;
  canEdit: boolean;
}

function getStudentMarkingPeriod(student: GradeEntryStudent) {
  if (student.marking_period) {
    return student.marking_period;
  }
  if (student.marking_periods && student.marking_periods.length > 0) {
    return student.marking_periods[0];
  }
  return null;
}

export function GradeEntryTable({
  gradebook,
  markingPeriodId,
  canEdit,
}: GradeEntryTableProps) {
  const g = useGrading();
  const api = useGradingApi();
  const queryClient = getQueryClient();
  const updateGradeMutation = g.updateGrade();
  const [editingGrade, setEditingGrade] = useState<string | null>(null);
  const [gradeValues, setGradeValues] = useState<Record<string, string>>({});
  const gradeValuesKeyRef = useRef<string>("empty");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [pendingGrades, setPendingGrades] = useState<Set<string>>(new Set());
  const [unsavedChanges, setUnsavedChanges] = useState<Set<string>>(new Set());
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);

  const ITEMS_PER_PAGE = 10;

  const sectionId = gradebook.section.id;
  const academicYearId = gradebook.academic_year.id;
  const subjectId = gradebook.subject.id;

  // Mutation for submitting grades for review
  const submitForReviewMutation = useMutation({
    mutationFn: async () => {
      // Get grading config from data
      const gradingConfig = data?.grading_config;
      const requireReview = gradingConfig?.require_grade_review ?? true;
      
      // Determine target status based on settings
      // If review not required, skip to submitted, otherwise go to pending
      const targetStatus = !requireReview ? "submitted" : "pending";
      
      const response = await api.updateSectionGradeStatusApi(
        sectionId,
        markingPeriodId || "",
        subjectId,
        { status: targetStatus, targeted_status: "draft" }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["sectionFinalGrades", sectionId, academicYearId, markingPeriodId, subjectId, "subject"] 
      });
      queryClient.invalidateQueries({ queryKey: ["gradebooks"] });
      
      // Get grading config for success message
      const gradingConfig = data?.grading_config;
      const requireReview = gradingConfig?.require_grade_review ?? true;
      const requireApproval = gradingConfig?.require_grade_approval ?? true;
      
      let successMessage = "Grades submitted successfully";
      if (requireReview) {
        successMessage = "Grades submitted for review successfully";
      } else if (requireApproval) {
        successMessage = "Grades submitted for approval successfully";
      } else {
        successMessage = "Grades submitted successfully";
      }
      
      showToast.success(successMessage);
      setShowSubmitDialog(false);
    },
    onError: (error) => {
      showToast.error("Failed to submit grades", getErrorMessage(error));
    },
  });

  const { data, isLoading, isError, error } = g.getSectionFinalGrades(
    academicYearId,
    sectionId,
    markingPeriodId || "",
    subjectId,
    "subject",
    { enabled: !!markingPeriodId }
  );

  const filteredData = useMemo(() => {
    if (!data) return undefined;
    const filteredStudents = data.students.filter((student: any) => {
      const mp = getStudentMarkingPeriod(student);
      const assessments = mp?.assessments || [];
      return assessments.some(
        (assessment) =>
          assessment.score === null ||
          [null, "rejected", "draft"].includes(assessment.status)
      );
    });
    return {
      ...data,
      students: filteredStudents,
      total_students: filteredStudents.length,
    };
  }, [data]);

  const students = useMemo(() => filteredData?.students || [], [filteredData]);

  const assessments = useMemo<GradeEntryAssessment[]>(() => {
    const firstStudent = students[0];
    const mp = firstStudent ? getStudentMarkingPeriod(firstStudent) : null;
    return mp?.assessments || [];
  }, [students]);

  const filteredStudents = useMemo(() => {
    if (!students.length || !searchTerm) return students;
    const term = searchTerm.toLowerCase();
    return students.filter((student: any) => {
      const fullName = student.full_name?.toLowerCase() || "";
      const idNumber = student.id_number?.toLowerCase() || "";
      return fullName.includes(term) || idNumber.includes(term);
    });
  }, [students, searchTerm]);

  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredStudents.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredStudents, currentPage]);

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / ITEMS_PER_PAGE));

  // Calculate completed students count
  const completedStudentsCount = useMemo(() => {
    if (!students.length || assessments.length === 0) return 0;
    return students.filter((student: GradeEntryStudent) => {
      const mp = getStudentMarkingPeriod(student);
      const studentAssessments = mp?.assessments || [];
      return studentAssessments.every(
        (assessment) => 
          assessment.score !== null && 
          assessment.status === "draft"
      );
    }).length;
  }, [students, assessments]);

  const totalStudentsCount = data?.students.length || 0;
  const incompleteCount = totalStudentsCount - completedStudentsCount;

  // Calculate rejected grades count
  const rejectedGradesCount = useMemo(() => {
    if (!students.length) return 0;
    return students.filter((student: GradeEntryStudent) => {
      const mp = getStudentMarkingPeriod(student);
      return mp?.assessments?.some((assessment) => assessment.status === "rejected");
    }).length;
  }, [students]);

  const gradeIndex = useMemo(() => {
    const map = new Map<string, { score: number | null; maxScore: number | null }>();
    students.forEach((student: GradeEntryStudent) => {
      const mp = getStudentMarkingPeriod(student);
      mp?.assessments?.forEach((assessment) => {
        if (assessment.grade_id) {
          map.set(assessment.grade_id, {
            score: assessment.score ?? null,
            maxScore: assessment.max_score ?? null,
          });
        }
      });
    });
    return map;
  }, [students]);

  const nextGradeValues = useMemo(() => {
    const values: Record<string, string> = {};
    students.forEach((student: GradeEntryStudent) => {
      const mp = getStudentMarkingPeriod(student);
      mp?.assessments?.forEach((assessment) => {
        if (assessment.grade_id) {
          values[assessment.grade_id] = assessment.score?.toString() || "";
        }
      });
    });
    return values;
  }, [students]);

  const nextGradeValuesKey = useMemo(() => {
    const entries = Object.entries(nextGradeValues)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}:${value}`)
      .join("|");
    return entries || "empty";
  }, [nextGradeValues]);

  useEffect(() => {
    if (gradeValuesKeyRef.current === nextGradeValuesKey) {
      return;
    }

    gradeValuesKeyRef.current = nextGradeValuesKey;
    setGradeValues(nextGradeValues);
  }, [nextGradeValues, nextGradeValuesKey]);

  const getErrorKey = (studentId: string, assessmentId: string) =>
    `${studentId}-${assessmentId}`;

  const getGradeInputId = (studentId: string, assessmentId: string) =>
    `grade-${studentId}-${assessmentId}`;

  const validateGradeValue = (value: string, maxScore: number | null) => {
    if (value === "") return null;
    const parsed = Number(value);
    if (Number.isNaN(parsed) || parsed < 0) {
      return "Grade must be a positive number";
    }
    const decimalPart = value.split(".")[1];
    if (decimalPart && decimalPart.length > 2) {
      return "Grade cannot have more than 2 decimal places";
    }
    if (maxScore !== null && parsed > maxScore) {
      return "Exceeds max score";
    }
    return null;
  };

  const focusNextInput = (inputId: string) => {
    setTimeout(() => {
      const nextInput = document.getElementById(inputId) as HTMLInputElement | null;
      if (nextInput) {
        nextInput.focus();
        nextInput.select();
      }
    }, 0);
  };

  const updateGradeInCache = (
    oldData: SectionFinalGradesSubjectResponse | undefined,
    studentId: string,
    assessmentId: string,
    score: number
  ) => {
    if (!oldData) return oldData;
    return {
      ...oldData,
      students: oldData.students.map((student) => {
        if (student.id !== studentId) return student;
        const mp = getStudentMarkingPeriod(student);
        if (!mp?.assessments) return student;
        const updatedAssessments = mp.assessments.map((assessment) => {
          if (assessment.id !== assessmentId) return assessment;
          const maxScore = assessment.max_score ?? null;
          const percentage =
            maxScore && maxScore > 0 ? (score / maxScore) * 100 : null;
          return {
            ...assessment,
            score,
            percentage,
          };
        });
        const updatedMp = { ...mp, assessments: updatedAssessments };
        if (student.marking_period) {
          return { ...student, marking_period: updatedMp };
        }
        if (student.marking_periods && student.marking_periods.length > 0) {
          return {
            ...student,
            marking_periods: [updatedMp, ...student.marking_periods.slice(1)],
          };
        }
        return student;
      }),
    };
  };

  const handleScoreChange = (
    studentId: string,
    assessmentId: string,
    gradeId: string,
    value: string,
    maxScore: number | null,
    originalValue: string
  ) => {
    const errorKey = getErrorKey(studentId, assessmentId);
    const errorMessage = validateGradeValue(value, maxScore);
    if (errorMessage) {
      setValidationErrors((prev) => ({ ...prev, [errorKey]: errorMessage }));
    } else {
      setValidationErrors((prev) => {
        const next = { ...prev };
        delete next[errorKey];
        return next;
      });
    }

    setGradeValues((prev) => ({ ...prev, [gradeId]: value }));
    setUnsavedChanges((prev) => {
      const next = new Set(prev);
      if (value !== originalValue) {
        next.add(errorKey);
      } else {
        next.delete(errorKey);
      }
      return next;
    });
  };

  const handleSubmitGrade = async (
    gradeId: string,
    score: number,
    studentId: string,
    assessmentId: string,
    originalValue: string
  ) => {
    const errorKey = getErrorKey(studentId, assessmentId);
    const currentValue = score.toString();
    if (currentValue === originalValue) {
      setUnsavedChanges((prev) => {
        const next = new Set(prev);
        next.delete(errorKey);
        return next;
      });
      return;
    }

    setPendingGrades((prev) => new Set(prev).add(errorKey));

    const queryKey = [
      "sectionFinalGrades",
      sectionId,
      academicYearId,
      markingPeriodId,
      subjectId,
      "subject",
    ];

    const previousData = queryClient.getQueryData<SectionFinalGradesSubjectResponse>(queryKey);
    queryClient.setQueryData(queryKey, (old) =>
      updateGradeInCache(
        old as SectionFinalGradesSubjectResponse | undefined,
        studentId,
        assessmentId,
        score
      )
    );

    try {
      await updateGradeMutation.mutateAsync({
        gradeId,
        data: { score },
      });
      setUnsavedChanges((prev) => {
        const next = new Set(prev);
        next.delete(errorKey);
        return next;
      });
      queryClient.invalidateQueries({ queryKey });
    } catch (submitError) {
      queryClient.setQueryData(queryKey, previousData);
      setGradeValues((prev) => ({ ...prev, [gradeId]: originalValue }));
      setValidationErrors((prev) => {
        const next = { ...prev };
        delete next[errorKey];
        return next;
      });
    } finally {
      setPendingGrades((prev) => {
        const next = new Set(prev);
        next.delete(errorKey);
        return next;
      });
    }
  };

  const handleScoreBlur = async (
    gradeId: string,
    studentId: string,
    assessmentId: string,
    originalValue: string
  ) => {
    const errorKey = getErrorKey(studentId, assessmentId);
    setEditingGrade(null);
    if (validationErrors[errorKey]) return;
    const value = gradeValues[gradeId] ?? originalValue;
    const score = value === "" ? null : Number(value);
    const original = gradeIndex.get(gradeId);
    if (score === null || Number.isNaN(score)) return;
    if (original && original.score !== score) {
      await handleSubmitGrade(gradeId, score, studentId, assessmentId, originalValue);
    }
  };

  const handleKeyDown = async (
    event: React.KeyboardEvent<HTMLInputElement>,
    studentIndex: number,
    assessmentIndex: number,
    studentId: string,
    assessmentId: string,
    gradeId: string,
    originalValue: string
  ) => {
    if (event.key !== "Enter" && event.key !== "Tab") return;
    const errorKey = getErrorKey(studentId, assessmentId);
    if (validationErrors[errorKey]) {
      if (event.key === "Enter") event.preventDefault();
      return;
    }

    const value = gradeValues[gradeId] ?? originalValue;
    if (value !== "" && value !== originalValue) {
      const parsed = Number(value);
      if (!Number.isNaN(parsed)) {
        await handleSubmitGrade(gradeId, parsed, studentId, assessmentId, originalValue);
      }
    }

    if (event.key === "Enter") {
      event.preventDefault();
      const nextIndex = studentIndex + 1;
      if (nextIndex < filteredStudents.length) {
        const nextStudent = filteredStudents[nextIndex];
        focusNextInput(getGradeInputId(nextStudent.id, assessments[assessmentIndex].id));
      }
    }
  };

  if (!markingPeriodId) {
    return (
      <div className="rounded-lg border border-dashed border-border/60 bg-muted/30 p-12 text-center shadow-sm">
        <p className="text-muted-foreground text-sm">
          Please select a marking period to view grade entry.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{getErrorMessage(error)}</AlertDescription>
      </Alert>
    );
  }

  if (students.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border/60 bg-muted/30 p-12 text-center shadow-sm">
        <p className="text-muted-foreground text-sm">No students available for grade entry.</p>
      </div>
    );
  }

  if (assessments.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border/60 bg-muted/30 p-12 text-center shadow-sm">
        <p className="text-muted-foreground text-sm">
          No assessments found for this marking period.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Status Alerts */}
      {students.length > 0 && (
        <>
          {rejectedGradesCount > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {rejectedGradesCount} {rejectedGradesCount === 1 ? "grade was" : "grades were"} rejected. 
                Modify the grade to resolve for submission.
              </AlertDescription>
            </Alert>
          )}

          {completedStudentsCount >= 1 ? (
            <Alert className="border-primary/30 bg-primary/[0.035] text-primary dark:border-primary/40 dark:bg-primary/[0.075] dark:text-primary shadow-sm">
              <CheckCircle2 className="h-4 w-4" />
              <div className="flex items-center justify-between gap-4 flex-1">
                <AlertDescription>
                  {completedStudentsCount} of {totalStudentsCount} students grade entry complete. 
                  {(() => {
                    const gradingConfig = data?.grading_config;
                    const requireReview = gradingConfig?.require_grade_review ?? true;
                    return requireReview ? " You can now submit for review." : " You can now submit grades.";
                  })()}
                </AlertDescription>
                <Button
                  variant="default"
                  size="sm"
                  className="shrink-0"
                  onClick={() => setShowSubmitDialog(true)}
                >
                  {(() => {
                    const gradingConfig = data?.grading_config;
                    const requireReview = gradingConfig?.require_grade_review ?? true;
                    return requireReview ? "Submit for Review" : "Submit Grades";
                  })()}
                </Button>
              </div>
            </Alert>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {incompleteCount} student{incompleteCount === 1 ? "" : "s"} grade{" "}
                {incompleteCount === 1 ? "entry" : "entries"} still{" "}
                {incompleteCount === 1 ? "needs" : "need"} to be completed.
              </AlertDescription>
            </Alert>
          )}
        </>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(event) => {
              setSearchTerm(event.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search students..."
            className="pl-9"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setSearchTerm("");
                setCurrentPage(1);
              }}
              className="absolute right-1 top-1/2 -translate-y-1/2"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border/70 shadow-sm">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-border/70 bg-muted/30">
              <th className="sticky left-0 z-20 bg-muted/30 px-4 py-3 text-left text-sm font-semibold text-muted-foreground">
                Student
              </th>
              {assessments.map((assessment) => (
                <th
                  key={assessment.id}
                  className="bg-muted/30 px-6 py-3 text-center text-sm font-semibold text-muted-foreground"
                >
                  <div>{assessment.name}</div>
                  {/* <div className="text-xs font-normal text-muted-foreground">
                    /{assessment.max_score ?? "-"}
                  </div> */}
                </th>
              ))}
              <th className="sticky right-0 z-20 bg-muted/30 px-6 py-3 text-center text-sm font-semibold text-muted-foreground">
                Grade Percentage
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedStudents.length === 0 ? (
              <tr>
                <td
                  colSpan={assessments.length + 2}
                  className="px-4 py-12 text-center text-sm text-muted-foreground"
                >
                  {searchTerm
                    ? "No students found matching your search."
                    : "No student grades currently need attention."}
                </td>
              </tr>
            ) : (
              paginatedStudents.map((student: any, studentIndex: number) => {
                const mp = getStudentMarkingPeriod(student);
                const studentAssessments = mp?.assessments || [];
                const assessmentMap = new Map(
                  studentAssessments.map((assessment) => [assessment.id, assessment])
                );

                return (
                  <tr key={student.id} className="border-b border-border/50 last:border-b-0 hover:bg-muted/20 transition-colors">
                    <td className="sticky left-0 z-10 bg-background px-4 py-3">
                      <div className="min-w-[200px]">
                        <div className="font-medium">{student.full_name}</div>
                        <div className="text-xs text-muted-foreground">
                          {student.id_number}
                        </div>
                      </div>
                    </td>
                    {assessments.map((assessment, assessmentIndex) => {
                      const entry = assessmentMap.get(assessment.id);
                      const gradeId = entry?.grade_id || "";
                      const inputId = getGradeInputId(student.id, assessment.id);
                      const errorKey = getErrorKey(student.id, assessment.id);
                      const originalValue =
                        entry?.score !== null && entry?.score !== undefined
                          ? String(entry.score)
                          : "";
                      const currentValue = gradeId
                        ? gradeValues[gradeId] ?? originalValue
                        : "";
                      const hasError = Boolean(validationErrors[errorKey]);
                      const isPending = pendingGrades.has(errorKey);
                      const hasUnsavedChanges = unsavedChanges.has(errorKey);
                      const isEditing = gradeId ? editingGrade === gradeId : false;

                      if (!entry || !gradeId) {
                        return (
                          <td
                            key={`${student.id}-${assessment.id}`}
                            className="px-6 py-3 text-center"
                          >
                            <span className="text-muted-foreground">--</span>
                          </td>
                        );
                      }

                      return (
                        <td
                          key={`${student.id}-${assessment.id}`}
                          className="px-6 py-3 text-center"
                        >
                          <div className="flex flex-col items-center gap-1">
                            <div className="relative w-full max-w-32">
                              <InputGroup 
                              className={cn(
                                isEditing && "ring-2 ring-primary/30 border-primary/60"
                              )}>
                                <InputGroupInput
                                  id={inputId}
                                  type="number"
                                  value={currentValue}
                                  disabled={!canEdit || isPending}
                                  onChange={(event) =>
                                    handleScoreChange(
                                      student.id,
                                      assessment.id,
                                      gradeId,
                                      event.target.value.replace(/[^0-9.]/g, ""),
                                      entry.max_score ?? null,
                                      originalValue
                                    )
                                  }
                                  onKeyDown={(event) =>
                                    handleKeyDown(
                                      event,
                                      studentIndex + (currentPage - 1) * ITEMS_PER_PAGE,
                                      assessmentIndex,
                                      student.id,
                                      assessment.id,
                                      gradeId,
                                      originalValue
                                    )
                                  }
                                  onFocus={() => setEditingGrade(gradeId)}
                                  onBlur={() =>
                                    handleScoreBlur(
                                      gradeId,
                                      student.id,
                                      assessment.id,
                                      originalValue
                                    )
                                  }
                                  className={cn(
                                    "text-center [&::-webkit-outer-spin-button]:[appearance:none] [&::-webkit-inner-spin-button]:[appearance:none] [&::-webkit-inner-spin-button]:m-0 [&]:[-moz-appearance:textfield]",
                                    hasError
                                      ? "aria-invalid:true"
                                      : "",
                                    
                                  )}
                                  min={0}
                                  max={entry.max_score ?? undefined}
                                  step={0.01}
                                />
                                <InputGroupAddon align="inline-end" className="h-full text-xs text-muted-foreground pointer-events-none bg-transparent">
                                  / {entry.max_score ?? "-"}
                                </InputGroupAddon>
                              </InputGroup>
                              {isPending && (
                                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                              )}
                            </div>
                            {hasError && (
                              <span className="text-xs text-destructive">
                                {validationErrors[errorKey]}
                              </span>
                            )}
                            {hasUnsavedChanges && !hasError && !isPending && (
                              <span className="text-[10px] text-amber-600">
                                Press Enter to save
                              </span>
                            )}
                          </div>
                        </td>
                      );
                    })}
                    <td className="sticky right-0 z-10 bg-muted/40 px-6 py-3 text-center border-l border-border/50">
                      {mp?.final_percentage !== null && mp?.final_percentage !== undefined ? (
                        <span
                          className={cn(
                            "font-medium",
                            mp.final_percentage >= 90
                              ? "text-green-600"
                              : mp.final_percentage >= 80
                                ? "text-blue-600"
                                : mp.final_percentage >= 70
                                  ? "text-yellow-600"
                                  : "text-red-600"
                          )}
                        >
                          {mp.final_percentage.toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-muted-foreground">--</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {filteredStudents.length > 0 && (
        <StickyFooter>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages} - Showing {Math.min(
                (currentPage - 1) * ITEMS_PER_PAGE + 1,
                filteredStudents.length
              )}-{Math.min(
                currentPage * ITEMS_PER_PAGE,
                filteredStudents.length
              )} of {filteredStudents.length} students
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                iconLeft={<ChevronLeft className="h-4 w-4" />}
              >
                Prev
              </Button>
              <Button
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                iconRight={<ChevronRight className="h-4 w-4" />}
              >
                Next
              </Button>
            </div>
          </div>
        </StickyFooter>
      )}

      <AlertDialogBox
        open={showSubmitDialog}
        onOpenChange={setShowSubmitDialog}
        title={
          (() => {
            const gradingConfig = data?.grading_config;
            const requireReview = gradingConfig?.require_grade_review ?? true;
            return requireReview ? "Submit Grades for Review?" : "Submit Grades?";
          })()
        }
        description={
          (() => {
            const gradingConfig = data?.grading_config;
            const requireReview = gradingConfig?.require_grade_review ?? true;
            const requireApproval = gradingConfig?.require_grade_approval ?? true;
            
            let desc = `You are about to submit ${completedStudentsCount} student${completedStudentsCount === 1 ? "" : "s"} grades for ${gradebook.subject.name}. `;
            
            if (requireReview) {
              desc += "Once submitted, the grades will be pending review.";
            } else if (requireApproval) {
              desc += "Once submitted, the grades will be pending approval.";
            } else {
              desc += "Once submitted, the grades will be finalized.";
            }
            
            return desc;
          })()
        }
        actionLabel={
          (() => {
            const gradingConfig = data?.grading_config;
            const requireReview = gradingConfig?.require_grade_review ?? true;
            return requireReview ? "Submit for Review" : "Submit Grades";
          })()
        }
        loading={submitForReviewMutation.isPending}
        onConfirm={async () => {
          await submitForReviewMutation.mutateAsync();
        }}
      />
    </div>
  );
}
