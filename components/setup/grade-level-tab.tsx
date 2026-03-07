"use client";

import * as React from "react";
import { DataTable } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DialogBox } from "@/components/ui/dialog-box";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  useGradeLevels,
  useGradeLevelMutations,
} from "@/hooks/use-grade-level";
import type {
  GradeLevelDto,
  CreateGradeLevelCommand,
  UpdateGradeLevelCommand,
} from "@/lib/api/grade-level-types";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/shared/data-table-column-header";
import {
  Add01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { getErrorMessage } from "@/lib/utils";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryState } from "nuqs";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import PageLayout from "@/components/dashboard/page-layout";
import { Pencil, AlertCircle, FileExclamationPoint, TriangleAlert, RefreshCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { ManageGradeLevelTuitionDialog } from "./manage-grade-level-tuition-dialog";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  level: z.coerce.number().min(1, "Level must be at least 1"),
  division_id: z.string().min(1, "Division is required"),
  short_name: z.string().optional(),
  description: z.string().optional(),
  active: z.boolean().default(true),
});

type FormInput = z.input<typeof formSchema>;

export function GradeLevelTab() {
  const { data: gradeLevels, isLoading, error, refetch, isFetching } = useGradeLevels();
  const { create, update, deleteById } = useGradeLevelMutations();

  const [statusFilter, setStatusFilter] = useQueryState("gradeStatus", {
    defaultValue: "active",
  });

  const [showCreate, setShowCreate] = React.useState(false);
  const [editingLevel, setEditingLevel] = React.useState<GradeLevelDto | null>(
    null,
  );
  const [deletingLevel, setDeletingLevel] =
    React.useState<GradeLevelDto | null>(null);
  const [tuitionManagingLevel, setTuitionManagingLevel] =
    React.useState<GradeLevelDto | null>(null);

  const form = useForm<FormInput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      level: 1,
      division_id: "",
      short_name: "",
      description: "",
      active: true,
    },
  });

  React.useEffect(() => {
    if (editingLevel) {
      form.reset({
        name: editingLevel.name,
        level: editingLevel.level,
        division_id: editingLevel.division.id,
        short_name: editingLevel.short_name || "",
        description: editingLevel.description || "",
        active: editingLevel.active,
      });
    }
  }, [editingLevel, form]);

  const handleCreate = (data: FormInput) => {
    create.mutate(data as CreateGradeLevelCommand, {
      onSuccess: () => {
        toast.success("Grade level created successfully");
        setShowCreate(false);
        form.reset();
      },
      onError: (error: unknown) => {
        toast.error(getErrorMessage(error));
      },
    });
  };

  const handleUpdate = (data: FormInput) => {
    if (!editingLevel) return;
    update.mutate(
      { id: editingLevel.id, payload: data as UpdateGradeLevelCommand },
      {
        onSuccess: () => {
          toast.success("Grade level updated successfully");
          setEditingLevel(null);
        },
        onError: (error: unknown) => {
          toast.error(getErrorMessage(error));
        },
      },
    );
  };

  const handleDelete = () => {
    if (!deletingLevel) return;
    deleteById.mutate(deletingLevel.id, {
      onSuccess: () => {
        toast.success("Grade level deleted successfully");
        setDeletingLevel(null);
      },
      onError: (error: unknown) => {
        toast.error(getErrorMessage(error));
      },
    });
  };

  const handleToggleActive = (level: GradeLevelDto, nextActive: boolean) => {
    update.mutate(
      { id: level.id, payload: { active: nextActive } },
      {
        onSuccess: () => {
          toast.success(
            `Grade level ${nextActive ? "activated" : "deactivated"} successfully`,
          );
        },
        onError: (error: unknown) => {
          toast.error(getErrorMessage(error));
        },
      },
    );
  };

  const activeLevels = React.useMemo(
    () => (gradeLevels || []).filter((level) => level.active),
    [gradeLevels],
  );

  const inactiveLevels = React.useMemo(
    () => (gradeLevels || []).filter((level) => !level.active),
    [gradeLevels],
  );

  const filteredLevels =
    statusFilter === "inactive" ? inactiveLevels : activeLevels;

  const router = useRouter();

  const columns: ColumnDef<GradeLevelDto>[] = [
    // {
    //   accessorKey: "level",
    //   header: ({ column }) => (
    //     <DataTableColumnHeader column={column} title="Level" />
    //   ),
    // },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => {
        const allTuititionsEmpty = row.original.tuition_fees.every(
          (fee) => !fee.amount || fee.amount === 0
        )
        return (
          <div className="flex items-center gap-2">
            <span>{row.original.name}</span>
            {allTuititionsEmpty && (
              <Tooltip>
                <TooltipTrigger>
                  <TriangleAlert className="size-4 text-orange-500 shrink-0" />
                </TooltipTrigger>
                <TooltipContent side="right">
                  Tuition fees not configured
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "short_name",
      header: "Short Name",
    },
    {
      accessorKey: "description",
      header: "Description",
    },
    {
      accessorKey: "division.name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Division" />
      ),
      cell: ({ row }) => row.original.division.name,
    },
    {
      accessorKey: "sections",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Sections" />
      ),
      cell: ({ row }) => row.original.sections.length,
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
    // {
    //   id: "toggle",
    //   header: () => <span className="text-xs font-medium">Active</span>,
    //   cell: ({ row }) => (
    //     <Switch
    //       checked={row.original.active}
    //       onCheckedChange={(checked) => handleToggleActive(row.original, checked)}
    //       disabled={update.isPending}
    //     />
    //   ),
    // },
    {
      id: "actions",
      cell: ({ row }) => {
        const allTuititionsEmpty = row.original.tuition_fees.every(
          (fee) => !fee.amount || fee.amount === 0
        )
        return (
        <div className="flex gap-2 justify-end">
          {allTuititionsEmpty && (
              <Tooltip>
                <TooltipTrigger>
                  <TriangleAlert className="size-4 text-orange-500 shrink-0" />
                </TooltipTrigger>
                <TooltipContent side="right">
                  Tuition fees not configured
                </TooltipContent>
              </Tooltip>
            )}
          <div className="flex items-center gap-1">
            <Button
            variant="outline"
            size="sm"
            onClick={() => setTuitionManagingLevel(row.original)}
          >
            Manage Tuition
          </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditingLevel(row.original)}
            icon={<Pencil className="size-3" />}
          >
            Edit
          </Button>
          <Button
            variant="link"
            size="sm"
            onClick={() =>
              router.push(`/setup/sections?gradeLevel=${row.original.id}`)
            }
            // icon={<Pencil className="size-3" />}
          >
            Go to Sections
          </Button>
          {/* <Button
            variant="ghost"
            size="icon"
            onClick={() => setDeletingLevel(row.original)}
            icon={<Trash className="h-4 w-4" />}
          /> */}
        </div>
      )},
    },
  ];

  //   if (isLoading) {
  //     return (
  //       <div className="space-y-4">
  //         <Skeleton className="h-12 w-full" />
  //         <Skeleton className="h-64 w-full" />
  //       </div>
  //     );
  //   }

  return (
    <PageLayout
      title="Grade Levels"
      description="Manage grade levels and track active status"
      actions={
        <div className="flex items-center gap-2">
          <Button
          onClick={() => setShowCreate(true)}
          icon={<HugeiconsIcon icon={Add01Icon} className="h-4 w-4" />}
        >
          Add Grade Level
        </Button>
        <Button 
          variant="outline"
          onClick={() => refetch()}
          icon={<RefreshCcw className="h-4 w-4" />}
          loading={isFetching || isLoading}
        />
        </div>
      }
      loading={isLoading}
      skeleton={
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      }
      error={error}
    >
      <div className="space-y-4">
        <Tabs value={statusFilter} onValueChange={(value) => void setStatusFilter(value)}>
          <TabsList>
            <TabsTrigger value="active">
              Active ({activeLevels.length})
            </TabsTrigger>
            <TabsTrigger value="inactive">
              Inactive ({inactiveLevels.length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <DataTable columns={columns} data={filteredLevels}  showPagination={false} />

        {/* Create Dialog */}
        <DialogBox
          open={showCreate}
          onOpenChange={setShowCreate}
          title="Create Grade Level"
          description="Add a new grade level to your academic system"
          onAction={() => form.handleSubmit(handleCreate)()}
          actionLabel="Create"
          actionLoading={create.isPending}
        >
          <Form {...form}>
            <form className="space-y-4">
              <FormField
                control={form.control}
                name="level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Level</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Form 1, Class A" {...field} />
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
                      <Input placeholder="e.g., F1" {...field} />
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
                      <Textarea
                        placeholder="Grade level description..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </DialogBox>

        {/* Edit Dialog */}
        <DialogBox
          open={!!editingLevel}
          onOpenChange={(open) => !open && setEditingLevel(null)}
          title="Edit Grade Level"
          description="Update grade level details"
          onAction={() => form.handleSubmit(handleUpdate)()}
          actionLabel="Update"
          actionLoading={update.isPending}
        >
          <Form {...form}>
            <form className="space-y-4">
              <FormField
                control={form.control}
                name="level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Level</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                name="short_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Short Name</FormLabel>
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
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <Label>Active</Label>
                    </div>
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </DialogBox>

        {/* Delete Dialog */}
        <DialogBox
          open={!!deletingLevel}
          onOpenChange={(open) => !open && setDeletingLevel(null)}
          title="Delete Grade Level"
          description={`Are you sure you want to delete "${deletingLevel?.name}"? This action cannot be undone.`}
          onAction={handleDelete}
          actionVariant="destructive"
          actionLoading={deleteById.isPending}
        />

        {/* Manage Tuition Dialog */}
        {tuitionManagingLevel && (
          <ManageGradeLevelTuitionDialog
            open={!!tuitionManagingLevel}
            onOpenChange={(open) => !open && setTuitionManagingLevel(null)}
            gradeLevel={tuitionManagingLevel}
          />
        )}
      </div>
    </PageLayout>
  );
}
