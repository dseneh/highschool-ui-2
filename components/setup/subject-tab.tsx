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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  EmptyState,
  EmptyStateAction,
  EmptyStateDescription,
  EmptyStateTitle,
} from "@/components/ui/empty-state";
import PageLayout from "@/components/dashboard/page-layout";
import { useSubjects, useSubjectMutations } from "@/hooks/use-subject";
import type {
  SubjectDto,
  CreateSubjectCommand,
  UpdateSubjectCommand,
} from "@/lib/api/subject-types";
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
import { Pencil, RefreshCcw, Trash } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  active: z.boolean().default(true),
});

type FormInput = z.input<typeof formSchema>;

type SubjectStatus = "active" | "inactive";

export function SubjectTab() {
  const { data: subjects, isLoading, refetch, isFetching, error } = useSubjects();
  const { create, update, deleteById } = useSubjectMutations();

  const [statusFilter, setStatusFilter] = useQueryState("subjectStatus", {
    defaultValue: "active",
  });

  const [showCreate, setShowCreate] = React.useState(false);
  const [editingSubject, setEditingSubject] = React.useState<SubjectDto | null>(
    null
  );
  const [deletingSubject, setDeletingSubject] = React.useState<SubjectDto | null>(
    null
  );
  const [forceDelete, setForceDelete] = React.useState(false);

  const form = useForm<FormInput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      active: true,
    },
  });

  React.useEffect(() => {
    if (editingSubject) {
      form.reset({
        name: editingSubject.name,
        description: editingSubject.description || "",
        active: editingSubject.active,
      });
    }
  }, [editingSubject, form]);

  const activeSubjects = React.useMemo(
    () => (subjects || []).filter((subject) => subject.active),
    [subjects]
  );

  const inactiveSubjects = React.useMemo(
    () => (subjects || []).filter((subject) => !subject.active),
    [subjects]
  );

  const filteredSubjects =
    statusFilter === "inactive" ? inactiveSubjects : activeSubjects;

  const handleCreate = (data: FormInput) => {
    create.mutate(data as CreateSubjectCommand, {
      onSuccess: () => {
        toast.success("Subject created successfully");
        setShowCreate(false);
        form.reset();
      },
      onError: (error: unknown) => {
        toast.error(getErrorMessage(error));
      },
    });
  };

  const handleUpdate = (data: FormInput) => {
    if (!editingSubject) return;
    update.mutate(
      { subjectId: editingSubject.id, payload: data as UpdateSubjectCommand },
      {
        onSuccess: () => {
          toast.success("Subject updated successfully");
          setEditingSubject(null);
        },
        onError: (error: unknown) => {
          toast.error(getErrorMessage(error));
        },
      }
    );
  };

  const handleDelete = () => {
    if (!deletingSubject) return;
    
    // If must deactivate, update instead of delete
    if (deletingSubject.must_deactivate) {
      update.mutate(
        { subjectId: deletingSubject.id, payload: { active: false } },
        {
          onSuccess: () => {
            toast.success("Subject deactivated successfully");
            setDeletingSubject(null);
            setForceDelete(false);
          },
          onError: (error: unknown) => {
            toast.error(getErrorMessage(error));
          },
        }
      );
      return;
    }
    
    // For subjects that need force, check if force is enabled
    if (deletingSubject.can_force_delete && !forceDelete) {
      toast.error("Please confirm force deletion by checking the box");
      return;
    }
    
    // Otherwise, proceed with delete (with or without force)
    deleteById.mutate(
      { subjectId: deletingSubject.id, force: forceDelete },
      {
        onSuccess: () => {
          toast.success("Subject deleted successfully");
          setDeletingSubject(null);
          setForceDelete(false);
        },
        onError: (error: unknown) => {
          toast.error(getErrorMessage(error));
        },
      }
    );
  };

  const handleToggleActive = (subject: SubjectDto, nextActive: boolean) => {
    update.mutate(
      { subjectId: subject.id, payload: { active: nextActive } },
      {
        onSuccess: () => {
          toast.success(
            `Subject ${nextActive ? "activated" : "deactivated"} successfully`
          );
        },
        onError: (error: unknown) => {
          toast.error(getErrorMessage(error));
        },
      }
    );
  };

  const columns: ColumnDef<SubjectDto>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
    },
    {
      accessorKey: "description",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Description" />
      ),
      cell: ({ row }) => row.original.description || "-",
    },
    {
      accessorKey: "usage",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Usage" />
      ),
      cell: ({ row }) => {
        const { has_grades, has_scored_grades } = row.original;
        if (!has_grades) return <Badge variant="outline">Not in use</Badge>;
        if (has_scored_grades) return <Badge variant="default">Has grades</Badge>;
        return <Badge variant="secondary">Grade records</Badge>;
      },
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
      cell: ({ row }) => {
        const canDelete = row.original.can_delete;
        const mustDeactivate = row.original.must_deactivate;
        const canForceDelete = row.original.can_force_delete;
        
        const deleteTooltip = mustDeactivate
          ? "Has graded records - will deactivate"
          : canForceDelete
          ? "Has grade records - requires confirmation"
          : canDelete
          ? "Delete subject"
          : "Delete";
        
        return (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setEditingSubject(row.original)}
              icon={<Pencil className="h-4 w-4" />}
            />
            <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setDeletingSubject(row.original)}
                    icon={<Trash className="h-4 w-4" />}
                    className={mustDeactivate ? "text-orange-600 hover:text-orange-700" : canDelete ? "text-red-600 hover:text-red-700" : ""}
                    tooltip={deleteTooltip}
                  />
          </div>
        );
      },
    },
  ];


  return (
    <PageLayout
      title="Subjects"
      description="Manage subjects and academic offerings"
      actions={
        <div className="flex gap-2 items-center">
            <Button
          onClick={() => refetch()}
          icon={<RefreshCcw className="h-4 w-4" />}
            loading={isFetching}
            variant="outline"
        />
            <Button
          onClick={() => setShowCreate(true)}
          icon={<HugeiconsIcon icon={Add01Icon} className="h-4 w-4" />}
        >
          Add Subject
        </Button>
        </div>
      }
      error={error}
      loading={isLoading}
      skeleton={
        <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
      }
    >
      <div className="space-y-4">
        <Tabs
          value={statusFilter}
          onValueChange={(value) =>
            setStatusFilter(value as SubjectStatus)
          }
        >
          <TabsList>
            <TabsTrigger value="active">
              Active ({activeSubjects.length})
            </TabsTrigger>
            <TabsTrigger value="inactive">
              Inactive ({inactiveSubjects.length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {filteredSubjects.length === 0 && (
          <EmptyState className="border-none bg-muted/20">
            <EmptyStateTitle>No subjects yet</EmptyStateTitle>
            <EmptyStateDescription>
              Create the first subject for your academic catalog.
            </EmptyStateDescription>
            <EmptyStateAction>
              <Button
                onClick={() => setShowCreate(true)}
                icon={<HugeiconsIcon icon={Add01Icon} className="h-4 w-4" />}
              >
                Add Subject
              </Button>
            </EmptyStateAction>
          </EmptyState>
        )}

        {filteredSubjects.length > 0 && (
          <DataTable 
          columns={columns} data={filteredSubjects} 
          searchKey="name" 
          showPagination={filteredSubjects.length > 10}
          />
        )}

        <DialogBox
          open={showCreate}
          onOpenChange={setShowCreate}
          title="Create Subject"
          description="Add a new subject to your academic catalog"
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
                      <Input placeholder="e.g., Mathematics" {...field} />
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
                      <Textarea placeholder="Subject description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </DialogBox>

        <DialogBox
          open={!!editingSubject}
          onOpenChange={(open) => !open && setEditingSubject(null)}
          title="Edit Subject"
          description="Update subject details"
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
          open={!!deletingSubject}
          onOpenChange={(open) => {
            if (!open) {
              setDeletingSubject(null);
              setForceDelete(false);
            }
          }}
          title={deletingSubject?.must_deactivate ? "Deactivate Subject" : "Delete Subject"}
          description={
            deletingSubject?.must_deactivate
              ? `"${deletingSubject?.name}" has grades with scores and cannot be deleted. It will be deactivated instead.`
              : deletingSubject?.can_force_delete
              ? `"${deletingSubject?.name}" has grade records but no scores.`
              : `Are you sure you want to delete "${deletingSubject?.name}"? This action cannot be undone.`
          }
          onAction={handleDelete}
          actionVariant={deletingSubject?.must_deactivate ? "default" : "destructive"}
          actionLoading={deleteById.isPending || update.isPending}
          actionLabel={deletingSubject?.must_deactivate ? "Deactivate" : "Delete"}
        >
          {deletingSubject?.can_force_delete && (
            <div className="flex items-center space-x-2 pt-4 border-t overflow-hidden">
              <Switch
                id="force-delete"
                checked={forceDelete}
                onCheckedChange={setForceDelete}
              />
              <label
                htmlFor="force-delete"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I understand this subject has grade records and want to delete it anyway
              </label>
            </div>
          )}
        </DialogBox>
      </div>
    </PageLayout>
  );
}
