"use client";

import { Award, CheckCircle2, Edit2, Trash2 } from "lucide-react";
import { useState } from "react";
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
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDeleteDefaultAssessmentTemplate } from "@/hooks/use-grading";
import { showToast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/utils";
import type { DefaultAssessmentTemplateDto } from "@/lib/api/grading-types";
import { getQueryClient } from "@/lib/query-client";

interface DefaultAssessmentsTableProps {
  assessments: DefaultAssessmentTemplateDto[];
  isLoading: boolean;
  onEdit?: (assessment: DefaultAssessmentTemplateDto) => void;
  onAdd?: () => void;
}

export function DefaultAssessmentsTable({
  assessments,
  isLoading,
  onEdit,
  onAdd,
}: DefaultAssessmentsTableProps) {
  const queryClient = getQueryClient();
  const deleteMutation = useDeleteDefaultAssessmentTemplate();
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      queryClient.invalidateQueries({ queryKey: ["defaultTemplate"] });
      showToast.success(
        "Success",
        "Default assessment deleted successfully"
      );
    } catch (error) {
      showToast.error(
        "Error",
        getErrorMessage(error)
      );
    }
    setDeleteConfirm(null);
  };

  if (isLoading) {
    return (
      <Card className="p-4">
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-8 rounded bg-muted/50 animate-pulse" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="space-y-4 p-4">
        <div className="flex items-center justify-between">
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900 flex-1">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>
                The following <strong>{assessments.length} assessments</strong> will be
                automatically created for each new gradebook. Teachers can add, edit,
                or remove assessments after creation based on their permissions.
              </span>
            </div>
          </div>
          {onAdd && (
            <Button
              onClick={onAdd}
              className="ml-4"
              variant="default"
            >
              + Add Assessment
            </Button>
          )}
        </div>

        {assessments.length === 0 ? (
          <div className="rounded-lg border border-dashed py-8 text-center">
            <p className="text-sm text-muted-foreground">
              No default assessments configured. Click &quot;Add Assessment&quot; to create one.
            </p>
          </div>
        ) : (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">#</TableHead>
                  <TableHead>Assessment</TableHead>
                  <TableHead className="text-center">Type</TableHead>
                  <TableHead className="text-center">Max Score</TableHead>
                  <TableHead className="text-center">Weight</TableHead>
                  <TableHead className="w-[100px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assessments.map((assessment, index) => (
                  <TableRow key={assessment.id}>
                    <TableCell>
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
                        {index + 1}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-foreground">
                        {assessment.name}
                      </div>
                      {assessment.description && (
                        <div className="text-xs text-muted-foreground">
                          {assessment.description}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="rounded-full bg-muted px-2 py-1 text-xs font-medium">
                        {assessment.assessment_type.name}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700">
                        <Award className="h-3 w-3" />
                        {assessment.max_score}
                      </span>
                    </TableCell>
                    <TableCell className="text-center text-sm font-medium">
                      {assessment.default_weight}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {onEdit && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(assessment)}
                            icon={<Edit2 className="h-4 w-4" />}
                          />
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteConfirm(assessment.id)}
                          icon={<Trash2 className="h-4 w-4 text-red-500" />}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      <AlertDialog open={Boolean(deleteConfirm)} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Default Assessment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this default assessment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              loading={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
