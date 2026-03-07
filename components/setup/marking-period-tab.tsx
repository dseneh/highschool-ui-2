"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DialogBox } from "@/components/ui/dialog-box";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { DatePicker } from "@/components/ui/date-picker";
import {
  EmptyState,
  EmptyStateDescription,
  EmptyStateTitle,
} from "@/components/ui/empty-state";
import PageLayout from "@/components/dashboard/page-layout";
import {
  useAllMarkingPeriods,
  useMarkingPeriodMutations,
} from "@/hooks/use-marking-period";
import { useSemesters } from "@/hooks/use-semester";
import type {
  MarkingPeriodDto,
  CreateMarkingPeriodCommand,
  UpdateMarkingPeriodCommand,
} from "@/lib/api2/marking-period-types";
import type { SemesterDto } from "@/lib/api2/semester-types";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { getErrorMessage } from "@/lib/utils";
import { toast } from "sonner";
import { Add01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Pencil, Trash, RefreshCcw } from "lucide-react";
import { format, isAfter, isBefore, parseISO } from "date-fns";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  short_name: z.string().optional(),
  start_date: z.date({ required_error: "Start date is required" }),
  end_date: z.date({ required_error: "End date is required" }),
});

type FormInput = z.input<typeof formSchema>;

type GroupedMarkingPeriods = {
  semester: SemesterDto;
  markingPeriods: MarkingPeriodDto[];
};

export function MarkingPeriodTab() {
  const { data: semesters, isLoading: semestersLoading } = useSemesters();
  const {
    data: allMarkingPeriods,
    isLoading: markingPeriodsLoading,
    refetch,
    isFetching,
  } = useAllMarkingPeriods();
  const { create, update, deleteById } = useMarkingPeriodMutations();

  const [showCreate, setShowCreate] = React.useState(false);
  const [selectedSemester, setSelectedSemester] =
    React.useState<SemesterDto | null>(null);
  const [editingMarkingPeriod, setEditingMarkingPeriod] =
    React.useState<MarkingPeriodDto | null>(null);
  const [deletingMarkingPeriod, setDeletingMarkingPeriod] =
    React.useState<MarkingPeriodDto | null>(null);

  const form = useForm<FormInput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      short_name: "",
      start_date: undefined,
      end_date: undefined,
    },
  });

  React.useEffect(() => {
    if (editingMarkingPeriod) {
      form.reset({
        name: editingMarkingPeriod.name,
        short_name: editingMarkingPeriod.short_name || "",
        start_date: parseISO(editingMarkingPeriod.start_date),
        end_date: parseISO(editingMarkingPeriod.end_date),
      });
    }
  }, [editingMarkingPeriod, form]);

  // Group marking periods by semester
  const groupedMarkingPeriods = React.useMemo(() => {
    if (!semesters || !allMarkingPeriods) return [];

    const grouped: GroupedMarkingPeriods[] = semesters.map((semester) => ({
      semester,
      markingPeriods: allMarkingPeriods
        .filter((mp) => mp.semester.id === semester.id)
        .sort((a, b) => a.start_date.localeCompare(b.start_date)),
    }));

    return grouped.filter((group) => group.markingPeriods.length > 0 || true); // Show all semesters even if empty
  }, [semesters, allMarkingPeriods]);

  const handleAdd = (semester: SemesterDto) => {
    setSelectedSemester(semester);
    setEditingMarkingPeriod(null);
    form.reset({
      name: "",
      short_name: "",
      start_date: undefined,
      end_date: undefined,
    });
    setShowCreate(true);
  };

  const handleEdit = (markingPeriod: MarkingPeriodDto) => {
    setEditingMarkingPeriod(markingPeriod);
    // Find the full semester object from the semesters list
    const semester = semesters?.find((s) => s.id === markingPeriod.semester.id);
    setSelectedSemester(semester || null);
    setShowCreate(true);
  };

  const validateDates = (
    startDate: Date,
    endDate: Date,
    semester: SemesterDto
  ): boolean => {
    const semesterStart = parseISO(semester.start_date);
    const semesterEnd = parseISO(semester.end_date);

    if (isBefore(startDate, semesterStart) || isAfter(startDate, semesterEnd)) {
      toast.error("Start date must be within the semester dates");
      return false;
    }

    if (isBefore(endDate, semesterStart) || isAfter(endDate, semesterEnd)) {
      toast.error("End date must be within the semester dates");
      return false;
    }

    if (isAfter(startDate, endDate)) {
      toast.error("Start date must be before end date");
      return false;
    }

    return true;
  };

  const handleCreate = (data: FormInput) => {
    if (!selectedSemester) {
      toast.error("Please select a semester first");
      return;
    }

    if (!validateDates(data.start_date, data.end_date, selectedSemester)) {
      return;
    }

    const payload: CreateMarkingPeriodCommand = {
      name: data.name,
      short_name: data.short_name,
      start_date: format(data.start_date, "yyyy-MM-dd"),
      end_date: format(data.end_date, "yyyy-MM-dd"),
    };

    create.mutate(
      { semesterId: selectedSemester.id, payload },
      {
        onSuccess: () => {
          toast.success("Marking period created successfully");
          setShowCreate(false);
          form.reset();
        },
        onError: (error: unknown) => {
          toast.error(getErrorMessage(error));
        },
      }
    );
  };

  const handleUpdate = (data: FormInput) => {
    if (!editingMarkingPeriod || !selectedSemester) return;

    if (!validateDates(data.start_date, data.end_date, selectedSemester)) {
      return;
    }

    const payload: UpdateMarkingPeriodCommand = {
      name: data.name,
      short_name: data.short_name,
      start_date: format(data.start_date, "yyyy-MM-dd"),
      end_date: format(data.end_date, "yyyy-MM-dd"),
    };

    update.mutate(
      { markingPeriodId: editingMarkingPeriod.id, payload },
      {
        onSuccess: () => {
          toast.success("Marking period updated successfully");
          setShowCreate(false);
          setEditingMarkingPeriod(null);
        },
        onError: (error: unknown) => {
          toast.error(getErrorMessage(error));
        },
      }
    );
  };

  const handleDelete = () => {
    if (!deletingMarkingPeriod) return;

    deleteById.mutate(deletingMarkingPeriod.id, {
      onSuccess: () => {
        toast.success("Marking period deleted successfully");
        setDeletingMarkingPeriod(null);
      },
      onError: (error: unknown) => {
        toast.error(getErrorMessage(error));
      },
    });
  };

  const handleSubmit = (data: FormInput) => {
    if (editingMarkingPeriod) {
      handleUpdate(data);
    } else {
      handleCreate(data);
    }
  };

  if (semestersLoading || markingPeriodsLoading) {
    return (
      <PageLayout title="Marking Periods">
        <div className="space-y-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </PageLayout>
    );
  }

  if (!semesters || semesters.length === 0) {
    return (
      <PageLayout title="Marking Periods">
        <EmptyState>
          <EmptyStateTitle>No Semesters Available</EmptyStateTitle>
          <EmptyStateDescription>
            Please create a semester before adding marking periods.
          </EmptyStateDescription>
        </EmptyState>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Marking Periods"
      actions={
        <Button
          onClick={() => refetch()}
          loading={isFetching}
          icon={<RefreshCcw className="h-4 w-4" />}
        >
          Refresh
        </Button>
      }
    >
      <div className="space-y-6">
        {groupedMarkingPeriods.map((group) => (
          <div
            key={group.semester.id}
            className="border border-border rounded-lg bg-card"
          >
            {/* Semester Header */}
            <div className="bg-muted px-4 py-3 border-b border-border rounded-t-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">
                    {group.semester.name}
                    {group.semester.is_current && (
                      <Badge variant="default" className="ml-2">
                        Current
                      </Badge>
                    )}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {format(parseISO(group.semester.start_date), "MMM d, yyyy")}{" "}
                    - {format(parseISO(group.semester.end_date), "MMM d, yyyy")}
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleAdd(group.semester)}
                  icon={<HugeiconsIcon icon={Add01Icon} />}
                >
                  Add Period
                </Button>
              </div>
            </div>

            {/* Marking Periods List */}
            <div className="divide-y divide-border">
              {group.markingPeriods.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  No marking periods for this semester
                </div>
              ) : (
                group.markingPeriods.map((markingPeriod) => (
                  <div
                    key={markingPeriod.id}
                    className="p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{markingPeriod.name}</h4>
                          {markingPeriod.short_name && (
                            <span className="text-sm text-muted-foreground">
                              ({markingPeriod.short_name})
                            </span>
                          )}
                          {markingPeriod.is_current && (
                            <Badge variant="default" className="text-xs">
                              Current
                            </Badge>
                          )}
                          {!markingPeriod.active && (
                            <Badge variant="secondary" className="text-xs">
                              Inactive
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {format(
                            parseISO(markingPeriod.start_date),
                            "MMM d, yyyy"
                          )}{" "}
                          -{" "}
                          {format(
                            parseISO(markingPeriod.end_date),
                            "MMM d, yyyy"
                          )}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(markingPeriod)}
                          disabled={!markingPeriod.active}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setDeletingMarkingPeriod(markingPeriod)}
                          disabled={!markingPeriod.active}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Dialog */}
      <DialogBox
        open={showCreate}
        onOpenChange={setShowCreate}
        title={
          editingMarkingPeriod ? "Edit Marking Period" : "Create Marking Period"
        }
        description={
          selectedSemester
            ? `${editingMarkingPeriod ? "Update" : "Create"} a marking period for ${selectedSemester.name}`
            : "Create a new marking period"
        }
        onAction={form.handleSubmit(handleSubmit)}
        actionLabel={editingMarkingPeriod ? "Update" : "Create"}
        actionLoading={create.isPending || update.isPending}
      >
        <Form {...form}>
          <form className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., Quarter 1" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="short_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Short Name (Optional)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., Q1" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <DatePicker
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select start date"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <DatePicker
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select end date"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {selectedSemester && (
              <p className="text-sm text-muted-foreground">
                Semester dates:{" "}
                {format(parseISO(selectedSemester.start_date), "MMM d, yyyy")} -{" "}
                {format(parseISO(selectedSemester.end_date), "MMM d, yyyy")}
              </p>
            )}
          </form>
        </Form>
      </DialogBox>

      {/* Delete Dialog */}
      <DialogBox
        open={!!deletingMarkingPeriod}
        onOpenChange={(open) => !open && setDeletingMarkingPeriod(null)}
        title="Delete Marking Period"
        description={`Are you sure you want to delete "${deletingMarkingPeriod?.name}"? This action cannot be undone.`}
        onAction={handleDelete}
        actionLabel="Delete"
        actionVariant="destructive"
        actionLoading={deleteById.isPending}
      />
    </PageLayout>
  );
}

