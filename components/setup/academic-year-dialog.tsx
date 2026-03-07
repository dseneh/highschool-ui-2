"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { DialogBox } from "@/components/ui/dialog-box";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { useAcademicYearMutations } from "@/hooks/use-academic-year";
import { getErrorMessage } from "@/lib/utils";
import type { AcademicYearDto } from "@/lib/api2/academic-year-types";

const formSchema = z.object({
  name: z.string().min(1, "Academic year name is required"),
  start_date: z.date({ message: "Start date is required" }),
  end_date: z.date({ message: "End date is required" }),
}).refine((data) => data.end_date > data.start_date, {
  message: "End date must be after start date",
  path: ["end_date"],
});

type FormInput = z.infer<typeof formSchema>;

interface AcademicYearDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  year?: AcademicYearDto | null;
}

export function AcademicYearDialog({
  open,
  onOpenChange,
  year,
}: AcademicYearDialogProps) {
  const { create, update } = useAcademicYearMutations();
  const isEditing = !!year;

  const form = useForm<FormInput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: year?.name || "",
      start_date: year?.start_date ? new Date(year.start_date) : undefined,
      end_date: year?.end_date ? new Date(year.end_date) : undefined,
    },
  });

  React.useEffect(() => {
    if (open) {
      if (year) {
        form.reset({
          name: year.name,
          start_date: new Date(year.start_date),
          end_date: new Date(year.end_date),
        });
      } else {
        form.reset({
          name: "",
          start_date: undefined,
          end_date: undefined,
        });
      }
    }
  }, [year, open, form]);

  const onSubmit = (data: FormInput) => {
    const payload = {
      name: data.name,
      start_date: data.start_date.toISOString().split("T")[0],
      end_date: data.end_date.toISOString().split("T")[0],
    };

    if (isEditing && year?.id) {
      update.mutate(
        { id: year.id, payload },
        {
          onSuccess: () => {
            toast.success("Academic year updated successfully");
            onOpenChange(false);
          },
          onError: (error: unknown) => {
            toast.error(getErrorMessage(error));
          },
        }
      );
    } else {
      create.mutate(payload, {
        onSuccess: () => {
          toast.success("Academic year created successfully");
          onOpenChange(false);
        },
        onError: (error: unknown) => {
          toast.error(getErrorMessage(error));
        },
      });
    }
  };

  return (
    <DialogBox
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Edit Academic Year" : "Create Academic Year"}
      description={
        isEditing
          ? "Update the academic year details"
          : "Set up a new academic year"
      }
      actionLabel={isEditing ? "Update" : "Create"}
      actionLoading={create.isPending || update.isPending}
      onAction={form.handleSubmit(onSubmit)}
      actionDisabled={!form.formState.isDirty}
      cancelLabel="Cancel"
      onCancel={() => onOpenChange(false)}
    >
      <Form {...form}>
        <form className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Academic Year Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., 2024-2025" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Controller
            control={form.control}
            name="start_date"
            render={({ field, fieldState: { error } }) => (
              <FormItem>
                <FormLabel>Start Date</FormLabel>
                <FormControl>
                  <DatePicker
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Pick start date"
                    dateFormat="yyyy-MM-dd"
                  />
                </FormControl>
                {error && <FormMessage>{error.message}</FormMessage>}
              </FormItem>
            )}
          />

          <Controller
            control={form.control}
            name="end_date"
            render={({ field, fieldState: { error } }) => (
              <FormItem>
                <FormLabel>End Date</FormLabel>
                <FormControl>
                  <DatePicker
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Pick end date"
                    dateFormat="yyyy-MM-dd"
                  />
                </FormControl>
                {error && <FormMessage>{error.message}</FormMessage>}
              </FormItem>
            )}
          />
        </form>
      </Form>
    </DialogBox>
  );
}
