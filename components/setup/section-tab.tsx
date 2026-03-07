"use client";

import * as React from "react";
import { DataTable } from "@/components/shared/data-table";
import { DataTableColumnHeader } from "@/components/shared/data-table-column-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DialogBox } from "@/components/ui/dialog-box";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  EmptyState,
  EmptyStateAction,
  EmptyStateDescription,
  EmptyStateTitle,
} from "@/components/ui/empty-state";
import PageLayout from "@/components/dashboard/page-layout";
import GradeLevelSelect from "@/components/shared/data-reusable/grade-level-select";
import { useGradeLevels } from "@/hooks/use-grade-level";
import { useSections, useSectionMutations } from "@/hooks/use-section";
import { useGeneralFees } from "@/hooks/use-finance";
import type {
  SectionDto,
  CreateSectionCommand,
  UpdateSectionCommand,
} from "@/lib/api2/section-types";
import type { ColumnDef } from "@tanstack/react-table";
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
import { useQueryState } from "nuqs";
import { getErrorMessage } from "@/lib/utils";
import { toast } from "sonner";
import { Add01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Pencil, Trash } from "lucide-react";
import { AddSubjectDialog } from "./add-subject-dialog";
import { SectionFeeList } from "@/components/finance/section-fee-list";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  max_capacity: z.coerce.number().int().min(0).optional(),
  room_number: z.string().optional(),
  active: z.boolean().default(true),
});

type FormInput = z.input<typeof formSchema>;

type SectionStatus = "active" | "inactive";

export function SectionTab() {
  const { isLoading: gradeLevelsLoading } = useGradeLevels();
  const [gradeLevelId] = useQueryState("gradeLevel", { defaultValue: "" });
  const { data: sections, isLoading } = useSections(gradeLevelId || undefined);
  const { data: generalFees, isLoading: generalFeesLoading } = useGeneralFees();
  const { create, update, deleteById } = useSectionMutations();

  const [statusFilter, setStatusFilter] = useQueryState("sectionStatus", {
    defaultValue: "active",
  });

  const [showCreate, setShowCreate] = React.useState(false);
  const [editingSection, setEditingSection] = React.useState<SectionDto | null>(null);
  const [deletingSection, setDeletingSection] = React.useState<SectionDto | null>(null);
  const [addSubjectDialog, setAddSubjectDialog] = React.useState<{
    sectionId: string;
    sectionName: string;
  } | null>(null);
  const [manageFeesSection, setManageFeesSection] = React.useState<SectionDto | null>(null);

  const form = useForm<FormInput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      max_capacity: 0,
      room_number: "",
      active: true,
    },
  });

  React.useEffect(() => {
    if (editingSection) {
      form.reset({
        name: editingSection.name,
        description: editingSection.description || "",
        max_capacity: editingSection.max_capacity ?? 0,
        room_number: "",
        active: editingSection.active,
      });
    }
  }, [editingSection, form]);

  const activeSections = React.useMemo(
    () => (sections || []).filter((section) => section.active),
    [sections]
  );

  const inactiveSections = React.useMemo(
    () => (sections || []).filter((section) => !section.active),
    [sections]
  );

  const filteredSections =
    statusFilter === "inactive" ? inactiveSections : activeSections;

  const handleCreate = (data: FormInput) => {
    if (!gradeLevelId) return;
    create.mutate(
      {
        gradeLevelId,
        payload: {
          name: data.name,
          description: data.description,
          max_capacity: data.max_capacity ?? undefined,
          room_number: data.room_number ?? undefined,
        } as CreateSectionCommand,
      },
      {
        onSuccess: () => {
          toast.success("Section created successfully");
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
    if (!editingSection) return;
    const resolvedGradeLevelId =
      gradeLevelId || editingSection.grade_level?.id || editingSection.grade_level_id;
    update.mutate(
      {
        sectionId: editingSection.id,
        gradeLevelId: resolvedGradeLevelId,
        payload: {
          name: data.name,
          description: data.description,
          active: data.active,
        } as UpdateSectionCommand,
      },
      {
        onSuccess: () => {
          toast.success("Section updated successfully");
          setEditingSection(null);
        },
        onError: (error: unknown) => {
          toast.error(getErrorMessage(error));
        },
      }
    );
  };

  const handleDelete = () => {
    if (!deletingSection) return;
    const resolvedGradeLevelId =
      gradeLevelId || deletingSection.grade_level?.id || deletingSection.grade_level_id;
    deleteById.mutate(
      { sectionId: deletingSection.id, gradeLevelId: resolvedGradeLevelId },
      {
        onSuccess: () => {
          toast.success("Section deleted successfully");
          setDeletingSection(null);
        },
        onError: (error: unknown) => {
          toast.error(getErrorMessage(error));
        },
      }
    );
  };

  const handleToggleActive = (section: SectionDto, nextActive: boolean) => {
    const resolvedGradeLevelId =
      gradeLevelId || section.grade_level?.id || section.grade_level_id;
    update.mutate(
      {
        sectionId: section.id,
        gradeLevelId: resolvedGradeLevelId,
        payload: { active: nextActive } as UpdateSectionCommand,
      },
      {
        onSuccess: () => {
          toast.success(
            `Section ${nextActive ? "activated" : "deactivated"} successfully`
          );
        },
        onError: (error: unknown) => {
          toast.error(getErrorMessage(error));
        },
      }
    );
  };

  const handleAddSubject = (sectionId: string, sectionName: string) => {
    setAddSubjectDialog({ sectionId, sectionName });
  };

  const handleManageFees = (section: SectionDto) => {
    setManageFeesSection(section);
  };

  const columns: ColumnDef<SectionDto>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
    },
    {
      accessorKey: "students",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Students" />
      ),
      cell: ({ row }) => row.original.students,
    },
    {
      accessorKey: "max_capacity",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Capacity" />
      ),
      cell: ({ row }) => row.original.max_capacity ?? "-",
    },
    {
      accessorKey: "active",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Badge variant={row.original.active ? "default" : "secondary"}>
            {row.original.active ? "Active" : "Inactive"}
          </Badge>
          <Switch
            checked={row.original.active}
            onCheckedChange={(checked) =>
              handleToggleActive(row.original, checked)
            }
            disabled={update.isPending}
          />
        </div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex gap-2 justify-end">
          <Button
            variant="link"
            size="sm"
            onClick={() => handleAddSubject(row.original.id, row.original.name)}
          >Manage Subjects</Button>
          <Button
            variant="link"
            size="sm"
            onClick={() => handleManageFees(row.original)}
          >Manage Fees</Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditingSection(row.original)}
            icon={<Pencil className="size-3" />}
          >Edit</Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDeletingSection(row.original)}
            icon={<Trash className="size-3" />}
          >Delete</Button>
        </div>
      ),
    },
  ];

  return (
    <PageLayout
      title="Sections"
      description="Manage class sections and homerooms"
      actions={
        <div className="flex items-center gap-3">
        <div className="flex items-center gap-4 w-full">
            <h2 className="text-sm font-medium">Select Grade Level:</h2>
            <GradeLevelSelect
            noTitle
            // searchable
            placeholder="Select grade level"
            autoSelectFirst
            selectClassName="w-full sm:w-[200px]"
          />
          </div>
        <Button
          onClick={() => setShowCreate(true)}
          icon={<HugeiconsIcon icon={Add01Icon} className="h-4 w-4" />}
          disabled={!gradeLevelId}
        >
          Add Section
        </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[280px_1fr] lg:items-end">
          
          {/* {selectedGradeLevel && (
            <div className="text-sm text-muted-foreground">
              Viewing sections for
              <span className="ml-1 font-medium text-foreground">
                {selectedGradeLevel.name}
              </span>
            </div>
          )} */}
        </div>

        <Tabs
          value={statusFilter}
          onValueChange={(value) =>
            setStatusFilter(value as SectionStatus)
          }
        >
          <TabsList>
            <TabsTrigger value="active">
              Active ({activeSections.length})
            </TabsTrigger>
            <TabsTrigger value="inactive">
              Inactive ({inactiveSections.length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {(gradeLevelsLoading || isLoading) && (
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        )}

        {!gradeLevelId && !gradeLevelsLoading && (
          <EmptyState className="border-none bg-muted/20">
            <EmptyStateTitle>Select a grade level</EmptyStateTitle>
            <EmptyStateDescription>
              Choose a grade level to view and manage its sections.
            </EmptyStateDescription>
          </EmptyState>
        )}

        {gradeLevelId && !isLoading && filteredSections.length === 0 && (
          <EmptyState className="border-none bg-muted/20">
            <EmptyStateTitle>No sections yet</EmptyStateTitle>
            <EmptyStateDescription>
              Create the first section for this grade level.
            </EmptyStateDescription>
            <EmptyStateAction>
              <Button
                onClick={() => setShowCreate(true)}
                icon={<HugeiconsIcon icon={Add01Icon} className="h-4 w-4" />}
              >
                Add Section
              </Button>
            </EmptyStateAction>
          </EmptyState>
        )}

        {gradeLevelId && filteredSections.length > 0 && (
          <DataTable columns={columns} data={filteredSections} showPagination={false} />
        )}

        {/* Add Subject Dialog */}
        <AddSubjectDialog
          open={!!addSubjectDialog}
          onOpenChange={(open) => !open && setAddSubjectDialog(null)}
          sectionId={addSubjectDialog?.sectionId || ""}
          sectionName={addSubjectDialog?.sectionName || ""}
        />

        <DialogBox
          open={!!manageFeesSection}
          onOpenChange={(open) => !open && setManageFeesSection(null)}
          title={`Manage Fees for ${manageFeesSection?.name ?? ""}`}
          description="Assign and manage fees for this section"
          className="max-w-4xl"
          cancelLabel="Close"
        >
          {generalFeesLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          ) : manageFeesSection ? (
            <SectionFeeList
              section={{
                id: manageFeesSection.id,
                name: manageFeesSection.name,
              }}
              availableFees={generalFees ?? []}
            />
          ) : null}
        </DialogBox>

        <DialogBox
          open={showCreate}
          onOpenChange={setShowCreate}
          title="Create Section"
          description="Add a new section under the selected grade level"
          onAction={() => form.handleSubmit(handleCreate)()}
          actionLabel="Create"
          actionLoading={create.isPending}
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
                      <Input placeholder="e.g., Section A" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="max_capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacity</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="room_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Room Number (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Room 101" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Section description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </DialogBox>

        <DialogBox
          open={!!editingSection}
          onOpenChange={(open) => !open && setEditingSection(null)}
          title="Edit Section"
          description="Update section details"
          onAction={() => form.handleSubmit(handleUpdate)()}
          actionLabel="Update"
          actionLoading={update.isPending}
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
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-2">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Active</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </DialogBox>

        <DialogBox
          open={!!deletingSection}
          onOpenChange={(open) => !open && setDeletingSection(null)}
          title="Delete Section"
          description={`Are you sure you want to delete "${deletingSection?.name}"? This action cannot be undone.`}
          onAction={handleDelete}
          actionVariant="destructive"
          actionLoading={deleteById.isPending}
        />
      </div>
    </PageLayout>
  );
}
