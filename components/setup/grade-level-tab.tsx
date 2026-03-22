"use client";

import * as React from "react";
import { DataTable } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DialogBox } from "@/components/ui/dialog-box";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
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
} from "@/lib/api2/grade-level-types";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/shared/data-table-column-header";
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
import { Pencil, TriangleAlert, RefreshCcw, Loader2, Check } from "lucide-react";
import { useRouter } from "next/navigation";

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
  const { create, update, deleteById, updateTuitions } = useGradeLevelMutations();

  const [statusFilter, setStatusFilter] = useQueryState("gradeStatus", {
    defaultValue: "active",
  });

  const [showCreate, setShowCreate] = React.useState(false);
  const [editingLevel, setEditingLevel] = React.useState<GradeLevelDto | null>(
    null,
  );
  const [deletingLevel, setDeletingLevel] =
    React.useState<GradeLevelDto | null>(null);
  const [savingTuitionKeys, setSavingTuitionKeys] = React.useState<Record<string, boolean>>({});
  const [savingTuitionRows, setSavingTuitionRows] = React.useState<Record<string, number>>({});
  const [savedTuitionKeys, setSavedTuitionKeys] = React.useState<Record<string, boolean>>({});
  const savedIndicatorTimeoutsRef = React.useRef<Record<string, ReturnType<typeof setTimeout>>>({});

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

  React.useEffect(() => {
    const savedIndicatorTimeouts = savedIndicatorTimeoutsRef.current;
    return () => {
      Object.values(savedIndicatorTimeouts).forEach((timeoutId) => {
        clearTimeout(timeoutId);
      });
    };
  }, []);

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

  const getTuitionByType = React.useCallback(
    (level: GradeLevelDto, feeType: "returning" | "new") =>
      level.tuition_fees.find((fee) => fee.fee_type === feeType),
    [],
  );

  const getTuitionDraftKey = (levelId: string, feeType: "returning" | "new") =>
    `${levelId}:${feeType}`;

  const formatCurrencyInputValue = React.useCallback((value: number) => {
    if (!Number.isFinite(value)) {
      return "0.00";
    }
    return value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }, []);

  const parseCurrencyInputValue = React.useCallback((rawValue: string) => {
    const cleaned = rawValue.replace(/,/g, "").trim();
    if (!cleaned) {
      return 0;
    }
    return Number(cleaned);
  }, []);

  const isRowTuitionSaving = React.useCallback(
    (levelId: string) => Boolean(savingTuitionRows[levelId]),
    [savingTuitionRows],
  );

  const markTuitionSaved = (key: string) => {
    if (savedIndicatorTimeoutsRef.current[key]) {
      clearTimeout(savedIndicatorTimeoutsRef.current[key]);
    }

    setSavedTuitionKeys((prev) => ({ ...prev, [key]: true }));
    savedIndicatorTimeoutsRef.current[key] = setTimeout(() => {
      setSavedTuitionKeys((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      delete savedIndicatorTimeoutsRef.current[key];
    }, 1200);
  };

  const handleTuitionInputBlur = (
    level: GradeLevelDto,
    feeType: "returning" | "new",
    rawValue: string,
    inputEl?: HTMLInputElement,
  ) => {
    if (!level.active) {
      return;
    }

    const targetFee = getTuitionByType(level, feeType);
    if (!targetFee) {
      return;
    }

    const key = getTuitionDraftKey(level.id, feeType);
    const parsedAmount = parseCurrencyInputValue(rawValue);

    if (Number.isNaN(parsedAmount) || parsedAmount < 0) {
      toast.error("Please enter a valid tuition amount");
      if (inputEl) {
        inputEl.value = formatCurrencyInputValue(Number(targetFee.amount ?? 0));
      }
      return;
    }

    const nextAmount = Number(parsedAmount.toFixed(2));

    if (nextAmount === Number(targetFee.amount)) {
      if (inputEl) {
        inputEl.value = formatCurrencyInputValue(nextAmount);
      }
      return;
    }

    setSavingTuitionKeys((prev) => ({ ...prev, [key]: true }));
    setSavingTuitionRows((prev) => ({
      ...prev,
      [level.id]: (prev[level.id] ?? 0) + 1,
    }));

    const payload = {
      tuition_fees: level.tuition_fees.map((fee) => ({
        id: fee.id,
        amount:
          fee.id === targetFee.id ? nextAmount : fee.amount,
      })),
    };

    updateTuitions.mutate(
      {
        id: level.id,
        payload,
      },
      {
        onSuccess: () => {
          if (inputEl) {
            inputEl.value = formatCurrencyInputValue(nextAmount);
          }
          markTuitionSaved(key);
        },
        onError: (error: unknown) => {
          toast.error(getErrorMessage(error));
        },
        onSettled: () => {
          setSavingTuitionKeys((prev) => {
            const next = { ...prev };
            delete next[key];
            return next;
          });
          setSavingTuitionRows((prev) => {
            const current = prev[level.id] ?? 0;
            if (current <= 1) {
              const next = { ...prev };
              delete next[level.id];
              return next;
            }
            return {
              ...prev,
              [level.id]: current - 1,
            };
          });
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
        );
        const isRowSaving = isRowTuitionSaving(row.original.id);
        return (
          <div className="flex items-center gap-2">
            <Switch
              checked={row.original.active}
              onCheckedChange={(checked) =>
                handleToggleActive(row.original, checked)
              }
              disabled={update.isPending || isRowSaving}
            />
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
      id: "tuition_returning",
      header: "Old Students Tuition",
      cell: ({ row }) => {
        const fee = getTuitionByType(row.original, "returning");
        if (!fee) {
          return <span className="text-muted-foreground">-</span>;
        }
        const key = getTuitionDraftKey(row.original.id, "returning");
        const symbol = row.original.currency?.symbol ?? "";
        const isSaving = Boolean(savingTuitionKeys[key]);
        const isSaved = Boolean(savedTuitionKeys[key]);
        const isRowSaving = isRowTuitionSaving(row.original.id);
        const isRowEditable = row.original.active;
        return (
          <div className="w-full">
            <InputGroup data-disabled={isRowSaving || !isRowEditable}  className="bg-accent/20 dark:bg-accent/50">
              {symbol && (
                <InputGroupAddon align="inline-start" className="text-xs text-muted-foreground bg-transparent">
                  {symbol}
                </InputGroupAddon>
              )}
              <InputGroupInput
              type="text"
              inputMode="decimal"
              defaultValue={formatCurrencyInputValue(Number(fee.amount ?? 0))}
              onFocus={(e) => {
                e.currentTarget.value = String(Number(fee.amount ?? 0));
              }}
              onBlur={(e) => handleTuitionInputBlur(row.original, "returning", e.currentTarget.value, e.currentTarget)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  e.currentTarget.blur();
                }
                if (e.key === "Escape") {
                  e.preventDefault();
                  e.currentTarget.value = formatCurrencyInputValue(Number(fee.amount ?? 0));
                  e.currentTarget.blur();
                }
              }}
              disabled={isRowSaving || !isRowEditable}
              className="h-8 text-right"
            />
              <InputGroupAddon align="inline-end" className="pr-2 bg-transparent">
                {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
                {!isSaving && isSaved && <Check className="h-3.5 w-3.5 text-emerald-600" />}
              </InputGroupAddon>
            </InputGroup>
          </div>
        );
      },
    },
    {
      id: "tuition_new",
      header: "New Students Tuition",
      cell: ({ row }) => {
        const fee = getTuitionByType(row.original, "new");
        if (!fee) {
          return <span className="text-muted-foreground">-</span>;
        }
        const key = getTuitionDraftKey(row.original.id, "new");
        const symbol = row.original.currency?.symbol ?? "";
        const isSaving = Boolean(savingTuitionKeys[key]);
        const isSaved = Boolean(savedTuitionKeys[key]);
        const isRowSaving = isRowTuitionSaving(row.original.id);
        const isRowEditable = row.original.active;
        return (
          <div className="w-full">
            <InputGroup data-disabled={isRowSaving || !isRowEditable} className="bg-accent/20 dark:bg-accent/50">
              {symbol && (
                <InputGroupAddon align="inline-start" className="text-xs text-muted-foreground bg-transparent">
                  {symbol}
                </InputGroupAddon>
              )}
              <InputGroupInput
              type="text"
              inputMode="decimal"
              defaultValue={formatCurrencyInputValue(Number(fee.amount ?? 0))}
              onFocus={(e) => {
                e.currentTarget.value = String(Number(fee.amount ?? 0));
              }}
              onBlur={(e) => handleTuitionInputBlur(row.original, "new", e.currentTarget.value, e.currentTarget)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  e.currentTarget.blur();
                }
                if (e.key === "Escape") {
                  e.preventDefault();
                  e.currentTarget.value = formatCurrencyInputValue(Number(fee.amount ?? 0));
                  e.currentTarget.blur();
                }
              }}
              disabled={isRowSaving || !isRowEditable}
              className="h-8 text-right"
            />
              <InputGroupAddon align="inline-end" className="pr-2 bg-transparent">
                {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
                {!isSaving && isSaved && <Check className="h-3.5 w-3.5 text-emerald-600" />}
              </InputGroupAddon>
            </InputGroup>
          </div>
        );
      },
    },
    {
      accessorKey: "division.name",
      header: () => (
        <div>Division</div>
      ),
      cell: ({ row }) => row.original.division.name,
    },
    {
      accessorKey: "sections",
      header: () => (
        <div className="text-center">Classes</div>
      ),
      cell: ({ row }) => <div className="text-center">{row.original.sections.length}</div>,
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
        );
        const isRowSaving = isRowTuitionSaving(row.original.id);
        const isRowEditable = row.original.active;
        return (
        <div className="flex gap-2 justify-end">
          <Button
            variant="link"
            size="sm"
            onClick={() => setEditingLevel(row.original)}
            icon={<Pencil className="size-3" />}
            disabled={isRowSaving || !isRowEditable}
          >
            Edit
          </Button>
          <Button
            variant="link"
            size="sm"
            onClick={() =>
              router.push(`/setup/sections?gradeLevel=${row.original.id}`)
            }
            disabled={isRowSaving}
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
          {/* <Button
          onClick={() => setShowCreate(true)}
          icon={<HugeiconsIcon icon={Add01Icon} className="h-4 w-4" />}
        >
          Add Grade Level
        </Button> */}
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
          <TabsList className="space-x-2">
            <TabsTrigger value="active">
              Active ({activeLevels.length})
            </TabsTrigger>
            <TabsTrigger value="inactive">
              Inactive ({inactiveLevels.length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <DataTable
          columns={columns}
          data={filteredLevels}
          showPagination={false}
          containerClassName="[&_table]:border-collapse [&_th]:border [&_td]:border [&_th]:border-border/60 [&_td]:border-border/40 [&_th:nth-child(4)]:w-36 [&_td:nth-child(4)]:w-48 [&_th:nth-child(5)]:w-48 [&_td:nth-child(5)]:w-48 "
          // containerClassName="[&_table]:border-collapse [&_th]:border [&_td]:border [&_th]:border-border/60 [&_td]:border-border/40 [&_th:nth-child(4)]:w-36 [&_td:nth-child(4)]:w-48 [&_th:nth-child(5)]:w-48 [&_td:nth-child(5)]:w-48 [&_th:nth-child(4)]:bg-primary/10 [&_td:nth-child(4)]:bg-primary/4 [&_th:nth-child(5)]:bg-primary/10 [&_td:nth-child(5)]:bg-primary/4 dark:[&_th:nth-child(4)]:bg-primary/18 dark:[&_td:nth-child(4)]:bg-primary/8 dark:[&_th:nth-child(5)]:bg-primary/18 dark:[&_td:nth-child(5)]:bg-primary/8"
        />

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
                disabled
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
                      <Textarea {...field}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* <FormField
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
              /> */}
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

      </div>
    </PageLayout>
  );
}
