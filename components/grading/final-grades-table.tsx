"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { useMutation } from "@tanstack/react-query";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { DataTable } from "@/components/shared/data-table";
import { DataTableColumnHeader } from "@/components/shared/data-table-column-header";
import { showToast } from "@/lib/toast";
import { cn, getErrorMessage } from "@/lib/utils";
import { useGradingApi } from "@/lib/api2/grading/api";
import type {
  GradeEntryStudent,
  GradeStatusType,
  SectionFinalGradesSubjectResponse,
} from "@/lib/api2/grading-types";
import { getQueryClient } from "@/lib/query-client";
import AlertDialogBox from "../shared/alert-dialogbox";
import { GradeHistoryModal } from "./grade-history-modal";
import { GradeCorrectionModal } from "./grade-correction-modal";
import { History, Unlock, Lock, X, ExternalLink } from "lucide-react";
import { useMarkGradeCorrection } from "@/hooks/use-mark-grade-correction";

interface FinalGradesTableProps {
  data?: SectionFinalGradesSubjectResponse;
  isLoading?: boolean;
  type: "review" | "approve" | "view";
  markingPeriodId?: string | null;
}

type ConfirmState = {
  open: boolean;
  student?: GradeEntryStudent;
  status?: GradeStatusType;
  title?: string;
  description?: string;
  actionLabel?: string;
  variant?: "destructive" | "warning" | "default";
};

type BulkConfirmState = {
  open: boolean;
  status?: GradeStatusType;
  targetedStatus?: GradeStatusType;
  title?: string;
  description?: string;
  actionLabel?: string;
  variant?: "destructive" | "warning" | "default";
};

function getStudentMarkingPeriod(student: GradeEntryStudent) {
  if (student.marking_period) {
    return student.marking_period;
  }
  if (student.marking_periods && student.marking_periods.length > 0) {
    return student.marking_periods[0];
  }
  return null;
}

function statusStyle(status?: GradeStatusType | null) {
  switch (status) {
    case "approved":
      return "bg-emerald-100 text-emerald-700";
    case "reviewed":
      return "bg-blue-100 text-blue-700";
    case "submitted":
      return "bg-amber-100 text-amber-700";
    case "rejected":
      return "bg-rose-100 text-rose-700";
    case "pending":
      return "bg-slate-100 text-slate-700";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function gradeColorClass(value?: number | null) {
  if (value === null || value === undefined) return "text-muted-foreground";
  if (value >= 90) return "text-emerald-600";
  if (value >= 75) return "text-amber-600";
  return "text-rose-600";
}

function filterByType(
  students: GradeEntryStudent[],
  type: "review" | "approve" | "view"
) {
  if (type === "review") {
    return students.filter((student) => {
      const status = getStudentMarkingPeriod(student)?.status;
      return status === "pending" || status === "reviewed" || status === "rejected";
    });
  }

  if (type === "approve") {
    return students.filter((student) => {
      const status = getStudentMarkingPeriod(student)?.status;
      return status === "submitted" || status === "approved" || status === "rejected";
    });
  }

  return students;
}

export function FinalGradesTable({
  data,
  isLoading,
  type,
  markingPeriodId,
}: FinalGradesTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [confirmState, setConfirmState] = useState<ConfirmState>({ open: false });
  const [bulkConfirmState, setBulkConfirmState] = useState<BulkConfirmState>({ open: false });
  const [loadingAction, setLoadingAction] = useState<{
    studentId: string;
    action: GradeStatusType;
  } | null>(null);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [correctionModalOpen, setCorrectionModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<GradeEntryStudent | null>(null);
  const [unlockingGradeId, setUnlockingGradeId] = useState<string | null>(null);

  const api = useGradingApi();
  const markGradeCorrectionMutation = useMarkGradeCorrection();
  const queryClient = getQueryClient();

  const updateStatusMutation = useMutation({
    mutationFn: async (payload: {
      studentId: string;
      markingPeriodId: string;
      subjectId: string;
      status: GradeStatusType;
    }) => {
      const response = await api.updateStudentGradeStatusApi(
        payload.studentId,
        payload.markingPeriodId,
        payload.subjectId,
        { status: payload.status }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sectionFinalGrades"] });
      queryClient.invalidateQueries({ queryKey: ["gradebooks"] });
      showToast.success("Grade status updated");
    },
    onError: (error) => {
      showToast.error("Failed to update status", getErrorMessage(error));
    },
  });

  const updateSectionStatusMutation = useMutation({
    mutationFn: async (payload: {
      sectionId: string;
      markingPeriodId: string;
      subjectId: string;
      status: GradeStatusType;
      targetedStatus?: GradeStatusType;
    }) => {
      const response = await api.updateSectionGradeStatusApi(
        payload.sectionId,
        payload.markingPeriodId,
        payload.subjectId,
        { status: payload.status, targeted_status: payload.targetedStatus }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sectionFinalGrades"] });
      queryClient.invalidateQueries({ queryKey: ["gradebooks"] });
      showToast.success("Section grades updated");
    },
    onError: (error) => {
      showToast.error("Failed to update grades", getErrorMessage(error));
    },
  });

  const students = useMemo(() => {
    if (!data?.students) return [];
    return filterByType(data.students, type);
  }, [data, type]);

  const filteredStudents = useMemo(() => {
    if (!searchQuery) return students;
    const term = searchQuery.toLowerCase();
    return students.filter((student) => {
      const fullName = student.full_name?.toLowerCase() || "";
      const idNumber = student.id_number?.toLowerCase() || "";
      return fullName.includes(term) || idNumber.includes(term);
    });
  }, [students, searchQuery]);

  const gradingConfig = data?.config;
  const showStatus = gradingConfig?.display_grade_status ?? true;
  const useLetterGrades = gradingConfig?.use_letter_grades ?? false;
  const allowTeacherOverride = gradingConfig?.allow_teacher_override ?? true;
  const requireReview = gradingConfig?.require_grade_review ?? true;
  const requireApproval = gradingConfig?.require_grade_approval ?? true;
  const showActions = type !== "view";

  const bulkActionEligibility = useMemo(() => {
    if (filteredStudents.length === 0)
      return {
        reviewAll: false,
        rejectAll: false,
        submitForApproval: false,
        approveAll: false,
        count: 0,
      };

    const allStatuses = new Set<string>();
    let totalGrades = 0;
    let reviewedCount = 0;
    let rejectedCount = 0;
    let approvedCount = 0;

    filteredStudents.forEach((student) => {
      const status = getStudentMarkingPeriod(student)?.status;
      if (!status) return;
      allStatuses.add(status);
      totalGrades += 1;
      if (status === "reviewed") reviewedCount += 1;
      if (status === "rejected") rejectedCount += 1;
      if (status === "approved") approvedCount += 1;
    });

    const hasOnlyPendingOrReviewed = Array.from(allStatuses).every(
      (status) => status === "pending" || status === "reviewed"
    );
    const allAreReviewed = reviewedCount === totalGrades && totalGrades > 0;
    const reviewAllEnabled =
      hasOnlyPendingOrReviewed && !allAreReviewed && allStatuses.size > 0;

    const hasOnlyPendingOrRejected = Array.from(allStatuses).every(
      (status) => status === "pending" || status === "rejected"
    );
    const allAreRejected = rejectedCount === totalGrades && totalGrades > 0;
    const rejectAllEnabled =
      hasOnlyPendingOrRejected && !allAreRejected && allStatuses.size > 0;

    const hasOnlySubmittedOrApproved = Array.from(allStatuses).every((status) =>
      ["submitted", "approved", "rejected"].includes(status)
    );
    const allAreApproved = approvedCount === totalGrades && totalGrades > 0;
    const approveAllEnabled =
      hasOnlySubmittedOrApproved && !allAreApproved && allStatuses.size > 0;

    const submitForApprovalEnabled =
      Array.from(allStatuses).every((status) => status === "reviewed") &&
      allStatuses.size > 0;

    return {
      reviewAll: reviewAllEnabled,
      rejectAll: rejectAllEnabled,
      submitForApproval: submitForApprovalEnabled,
      approveAll: approveAllEnabled,
      count: filteredStudents.length,
    };
  }, [filteredStudents]);

  const handleStudentStatusChange = useCallback(
    async (student: GradeEntryStudent, status: GradeStatusType) => {
      const mp = getStudentMarkingPeriod(student);
      if (!mp?.id || !data?.subject?.id) return;
      setLoadingAction({ studentId: student.id_number, action: status });
      try {
        await updateStatusMutation.mutateAsync({
          studentId: student.id_number,
          markingPeriodId: mp.id,
          subjectId: data.subject.id,
          status,
        });
      } finally {
        setLoadingAction(null);
      }
    },
    [data, updateStatusMutation]
  );

  const handleBulkStatusChange = async (
    status: GradeStatusType,
    targetedStatus?: GradeStatusType
  ) => {
    if (!data?.section?.id || !data?.subject?.id || !markingPeriodId) return;
    await updateSectionStatusMutation.mutateAsync({
      sectionId: data.section.id,
      markingPeriodId,
      subjectId: data.subject.id,
      status,
      targetedStatus,
    });
  };

  const columns = useMemo<ColumnDef<GradeEntryStudent>[]>(() => {
    const baseColumns: ColumnDef<GradeEntryStudent>[] = [
      {
        accessorKey: "id_number",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="ID Number" />
        ),
        cell: ({ row }) => (
          <Link
            href={`/students/${row.original.id_number}/grades`}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-1 font-semibold text-primary hover:underline"
          >
            {row.original.id_number}
            <ExternalLink className="size-3.5 text-primary hidden group-hover:inline-block" />
          </Link>
        ),
      },
      {
        accessorKey: "full_name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Student" />
        ),
        cell: ({ row }) => (
          <div className="font-medium">{row.original.full_name}</div>
        ),
      },
      {
        id: "average",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Grade" />
        ),
        sortingFn: (rowA, rowB) => {
          const a = getStudentMarkingPeriod(rowA.original)?.final_percentage ?? 0;
          const b = getStudentMarkingPeriod(rowB.original)?.final_percentage ?? 0;
          return a - b;
        },
        cell: ({ row }) => {
          const mp = getStudentMarkingPeriod(row.original);
          const average = mp?.final_percentage ?? row.original.averages?.final_average ?? null;
          return (
            <div className="flex items-center gap-3">
              <span className={cn("min-w-14 font-semibold", gradeColorClass(average))}>
                {average === null || average === undefined ? "--" : `${average}%`}
              </span>
              <Progress value={average ?? 0} className="w-24" />
            </div>
          );
        },
      },
    ];

    if (useLetterGrades) {
      baseColumns.push({
        id: "letter",
        header: () => <span className="text-sm">Grade Ltr</span>,
        cell: ({ row }) => {
          const letter = getStudentMarkingPeriod(row.original)?.letter_grade ?? "--";
          return <span className="font-semibold">{letter}</span>;
        },
      });
    }

    baseColumns.push({
      id: "rank",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Rank" />
      ),
      sortingFn: (rowA, rowB) => {
        const a = getStudentMarkingPeriod(rowA.original)?.rank?.rank ?? 0;
        const b = getStudentMarkingPeriod(rowB.original)?.rank?.rank ?? 0;
        return a - b;
      },
      cell: ({ row }) => {
        const rank = getStudentMarkingPeriod(row.original)?.rank?.rank ?? null;
        return (
          <span className="font-medium">
            {rank === null ? "--" : rank}
          </span>
        );
      },
    });

    if (showStatus) {
      baseColumns.push({
        id: "status",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Status" />
        ),
        sortingFn: (rowA, rowB) => {
          const statusOrder: Record<string, number> = {
            draft: 1,
            pending: 2,
            reviewed: 3,
            submitted: 4,
            approved: 5,
            rejected: 6,
          };
          const a = getStudentMarkingPeriod(rowA.original)?.status ?? "";
          const b = getStudentMarkingPeriod(rowB.original)?.status ?? "";
          return (statusOrder[a] ?? 99) - (statusOrder[b] ?? 99);
        },
        cell: ({ row }) => {
          const status = getStudentMarkingPeriod(row.original)?.status;
          return (
            <Badge className={cn("capitalize", statusStyle(status))}>
              {status || "unknown"}
            </Badge>
          );
        },
      });
    }

    if (showActions) {
      baseColumns.push({
        id: "actions",
        header: () => <span className="text-sm">Actions</span>,
        cell: ({ row }) => {
          const student = row.original;
          const mp = getStudentMarkingPeriod(student);
          const status = mp?.status;
          const needsCorrection = mp?.needs_correction || false;

          // For review type: only show if review is required
          if (type === "review" && !requireReview) {
            return <span className="text-sm text-gray-500">N/A</span>;
          }

          const isSomeActionLoading = loadingAction !== null;

          // Render different actions based on type and status
          const workflowActions = [];
          const utilityActions = [];

          // Get the actual grade ID from assessments
          const gradeId = mp?.assessments?.[0]?.grade_id;

          // Always show History button (if we have a grade ID)
          if (gradeId) {
            utilityActions.push(
              <Button
                key="history"
                size="sm"
                variant="outline"
                onClick={() => {
                  setSelectedStudent(student);
                  setHistoryModalOpen(true);
                }}
                disabled={isSomeActionLoading}
                className="h-8 w-8 p-0"
                tooltip="View History"
              >
                <History className="h-4 w-4" />
              </Button>
            );
          }

          // Show Correction button only if needs_correction is true
          // if (needsCorrection && gradeId) {
          //   utilityActions.push(
          //     <Button
          //       key="correct"
          //       size="sm"
          //       variant="ghost"
          //       onClick={() => {
          //         setSelectedStudent(student);
          //         setCorrectionModalOpen(true);
          //       }}
          //       disabled={isSomeActionLoading}
          //       className="h-8 w-8 p-0"
          //       tooltip="Make Correction"
          //       icon={<Pencil className="h-4 w-4" />}
          //     >
          //       Change
          //     </Button>
          //   );
          // }

          // Workflow actions for review type
          if (type === "review" && requireReview) {
            if (status === "pending") {
              const isReviewLoading = loadingAction?.studentId === student.id_number && loadingAction?.action === "reviewed";
              
              workflowActions.push(
                <Button
                  key="review"
                  size="sm"
                  className="w-18"
                  loading={isReviewLoading}
                  disabled={isSomeActionLoading && !isReviewLoading}
                  onClick={() => handleStudentStatusChange(student, "reviewed")}
                >
                  Review
                </Button>,
                <Button
                  key="reject"
                  size="sm"
                  className="w-18"
                  variant="outline"
                  disabled={isSomeActionLoading}
                  onClick={() =>
                    setConfirmState({
                      open: true,
                      student,
                      status: "rejected",
                      title: "Reject grade",
                      description: `Reject ${student.full_name}'s grade? This sends it back for edits.`,
                      actionLabel: "Reject",
                      variant: "destructive",
                    })
                  }
                >
                  Reject
                </Button>
              );
            } else if (status === "reviewed") {
              const isUndoLoading = loadingAction?.studentId === student.id_number && loadingAction?.action === "pending";
              
              workflowActions.push(
                <Button
                  key="undo"
                  size="sm"
                  variant="outline"
                  onClick={() => handleStudentStatusChange(student, "pending")}
                  loading={isUndoLoading}
                  disabled={isSomeActionLoading && !isUndoLoading}
                >
                  Undo Review
                </Button>
              );
            }
          }

          // Workflow actions for approve type
          if (type === "approve" && requireApproval) {
            if (status === "submitted") {
              const isApproveLoading = loadingAction?.studentId === student.id_number && loadingAction?.action === "approved";
              
              workflowActions.push(
                <Button
                  key="approve"
                  size="sm"
                  loading={isApproveLoading}
                  disabled={isSomeActionLoading && !isApproveLoading}
                  onClick={() => handleStudentStatusChange(student, "approved")}
                  loadingText=""
                  className="w-17.5"
                >
                  Approve
                </Button>,
                <Button
                  key="reject"
                  className="w-17.5"
                  size="sm"
                  variant="outline"
                  disabled={isSomeActionLoading}
                  onClick={() =>
                    setConfirmState({
                      open: true,
                      student,
                      status: "rejected",
                      title: "Reject grade",
                      description: `Reject ${student.full_name}'s grade? This sends it back for edits.`,
                      actionLabel: "Reject",
                      variant: "destructive",
                    })
                  }
                >
                  Reject
                </Button>
              );
            } else if (status === "approved") {
              const isUnlocking = unlockingGradeId === gradeId;
              
              // Show "Change" and "Lock" buttons if needs_correction is true
              if (needsCorrection) {
                workflowActions.push(
                  <Button
                    key="change"
                    size="sm"
                    variant="outline"
                    disabled={isSomeActionLoading}
                    onClick={() => {
                      setSelectedStudent(student);
                      setCorrectionModalOpen(true);
                    }}
                  >
                    Change
                  </Button>,
                  <Button
                    key="lock"
                    size="sm"
                    variant="secondary"
                    disabled={isSomeActionLoading}
                    loading={isUnlocking}
                    icon={<Lock className="h-4 w-4" />}
                    onClick={async () => {
                      if (!gradeId) return;
                      
                      setUnlockingGradeId(gradeId);
                      try {
                        await markGradeCorrectionMutation.mutateAsync({
                          gradeId: gradeId,
                          needsCorrection: false,
                        });
                        queryClient.invalidateQueries({ queryKey: ["sectionFinalGrades"] });
                        showToast.success("Grade locked");
                      } catch (error) {
                        showToast.error(getErrorMessage(error));
                      } finally {
                        setUnlockingGradeId(null);
                      }
                    }}
                  >
                    Lock
                  </Button>
                );
              } else if (allowTeacherOverride && gradeId) {
                // Show "Unlock for change" button if not marked for correction
                workflowActions.push(
                  <Button
                    key="unlock"
                    size="sm"
                    variant="warning"
                    disabled={isSomeActionLoading}
                    loading={isUnlocking}
                    icon={<Unlock className="h-4 w-4" />}
                    onClick={async () => {
                      if (!gradeId) return;
                      
                      setUnlockingGradeId(gradeId);
                      try {
                        await markGradeCorrectionMutation.mutateAsync({
                          gradeId: gradeId,
                          needsCorrection: true,
                          reason: "Unlocked for correction by administrator",
                        });
                        queryClient.invalidateQueries({ queryKey: ["sectionFinalGrades"] });
                        showToast.success("Grade unlocked for correction");
                      } catch (error) {
                        showToast.error(getErrorMessage(error));
                      } finally {
                        setUnlockingGradeId(null);
                      }
                    }}
                  >
                    Unlock change
                  </Button>
                );
              }
            }
          }

          // If no actions to show, return null
          if (workflowActions.length === 0 && utilityActions.length === 0) {
            return null;
          }

          return (
            <div className="flex items-center gap-2">
              {workflowActions}
              {utilityActions}
            </div>
          );
        },
      });
    }

    return baseColumns;
  }, [useLetterGrades, showStatus, showActions, type, requireReview, loadingAction, requireApproval, handleStudentStatusChange, unlockingGradeId, allowTeacherOverride, markGradeCorrectionMutation, queryClient]);

  if (isLoading) {
    return (
      <Card className="p-8 text-center text-muted-foreground">
        Loading grades...
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="p-8 text-center text-muted-foreground">
        No grades data available.
      </Card>
    );
  }

  const dataExists = filteredStudents.length > 0;

  return (
    <div className="space-y-4">
      {type === "review" && dataExists && !bulkActionEligibility.submitForApproval && (
        <Alert className="border-amber-200 bg-amber-50 text-amber-900">
          <AlertDescription>
            You need to review grades for all students before submitting for approval.
          </AlertDescription>
        </Alert>
      )}

          {bulkActionEligibility.submitForApproval && (
            <Alert className="border-blue-200 bg-blue-50 text-blue-900">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <AlertDescription>
                  All students grades were reviewed. You can now submit for approval.
                </AlertDescription>
                <Button
                  variant="default"
                  onClick={() =>
                    setBulkConfirmState({
                      open: true,
                      status: "submitted",
                      targetedStatus: "reviewed",
                      title: "Submit for approval",
                      description: "Submit all reviewed grades for approval?",
                      actionLabel: "Submit",
                      variant: "default",
                    })
                  }
                >
                  Submit for Approval
                </Button>
              </div>
            </Alert>
          )}

          <Card className="overflow-hidden">
            <div className="border-b px-4 pb-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="relative w-full max-w-sm">
                  <Input
                    placeholder="Search students..."
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    className="pr-8"
                  />
                  {searchQuery && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                      onClick={() => setSearchQuery("")}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {type === "review" && requireReview && (
                    <>
                      <Button
                        variant="outline"
                        disabled={!bulkActionEligibility.rejectAll || loadingAction !== null}
                        onClick={() =>
                          setBulkConfirmState({
                            open: true,
                            status: "rejected",
                            targetedStatus: "pending",
                            title: "Reject all grades",
                            description: "Reject all pending grades for this section?",
                            actionLabel: "Reject All",
                            variant: "destructive",
                          })
                        }
                      >
                        Reject All Grades
                      </Button>
                      <Button
                        disabled={!bulkActionEligibility.reviewAll || loadingAction !== null}
                        onClick={() =>
                          setBulkConfirmState({
                            open: true,
                            status: "reviewed",
                            targetedStatus: "pending",
                            title: "Review all grades",
                            description: "Mark all pending grades as reviewed?",
                            actionLabel: "Review All",
                            variant: "default",
                          })
                        }
                      >
                        Review All Grades
                      </Button>
                    </>
                  )}

                  {type === "approve" && requireApproval && (
                    <Button
                      disabled={!bulkActionEligibility.approveAll || loadingAction !== null}
                      onClick={() =>
                        setBulkConfirmState({
                          open: true,
                          status: "approved",
                          targetedStatus: "submitted",
                          title: "Approve all grades",
                          description: "Approve all submitted grades for this section?",
                          actionLabel: "Approve All",
                          variant: "default",
                        })
                      }
                    >
                      Approve All Grades
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4">
              {!dataExists ? (
                <div className="rounded-md border border-dashed p-8 text-center text-muted-foreground">
                  {type === "review"
                    ? "No student grades currently need attention."
                    : type === "approve"
                      ? "No student grades currently need approval."
                      : "No student grades available."}
                </div>
              ) : (
                <DataTable columns={columns} data={filteredStudents} pageSize={10} />
              )}
            </div>

            {dataExists && (
              <div className="border-t px-4 py-3 text-sm text-muted-foreground">
                {searchQuery ? (
                  <>Showing {filteredStudents.length} students</>
                ) : (
                  <>
                    Total Students:{" "}
                    <span className="font-semibold text-foreground">
                      {filteredStudents.length}
                    </span>
                  </>
                )}
              </div>
            )}
          </Card>

      <AlertDialogBox
        open={confirmState.open}
        onOpenChange={(open: boolean) => setConfirmState((prev) => ({ ...prev, open }))}
        title={confirmState.title}
        description={confirmState.description}
        actionLabel={confirmState.actionLabel || "Confirm"}
        variant={confirmState.variant}
        loading={updateStatusMutation.isPending}
        loadingText="Submitting..."
        onConfirm={async () => {
          if (!confirmState.student || !confirmState.status) return;
          try {
            await handleStudentStatusChange(confirmState.student, confirmState.status);
            setConfirmState({ open: false });
          } catch {
            // Error is already handled in mutation onError
          }
        }}
      />

      <AlertDialogBox
        open={bulkConfirmState.open}
        onOpenChange={(open: boolean) => setBulkConfirmState((prev) => ({ ...prev, open }))}
        title={bulkConfirmState.title}
        description={bulkConfirmState.description}
        actionLabel={bulkConfirmState.actionLabel || "Confirm"}
        variant={bulkConfirmState.variant}
        loading={updateSectionStatusMutation.isPending}
        loadingText="Submitting..."
        onConfirm={async () => {
          if (!bulkConfirmState.status) return;
          try {
            await handleBulkStatusChange(
              bulkConfirmState.status,
              bulkConfirmState.targetedStatus
            );
            setBulkConfirmState({ open: false });
          } catch {
            // Error is already handled in mutation onError
          }
        }}
      />

      {selectedStudent && (
        <>
          {(() => {
            const gradeIdForModals = getStudentMarkingPeriod(selectedStudent)?.assessments?.[0]?.grade_id || "";
            return (
              <>
                <GradeHistoryModal
                  open={historyModalOpen}
                  onOpenChange={setHistoryModalOpen}
                  gradeId={gradeIdForModals}
                  studentName={selectedStudent.full_name}
                  studentPhoto={selectedStudent.photo || null}
                  subjectName={data?.subject?.name || null}
                  periodName={getStudentMarkingPeriod(selectedStudent)?.name || null}
                  history={getStudentMarkingPeriod(selectedStudent)?.history}
                />

                <GradeCorrectionModal
                  open={correctionModalOpen}
                  onOpenChange={setCorrectionModalOpen}
                  gradeId={gradeIdForModals}
                  studentName={selectedStudent.full_name}
                  currentScore={getStudentMarkingPeriod(selectedStudent)?.final_percentage || null}
                  maxScore={100}
                  onSuccess={() => {
                    queryClient.invalidateQueries({ queryKey: ["sectionFinalGrades"] });
                    setCorrectionModalOpen(false);
                  }}
                />
              </>
            );
          })()}
        </>
      )}
    </div>
  );
}
