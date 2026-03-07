"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateAssessmentType, useUpdateAssessmentType } from "@/hooks/use-grading";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import type { AssessmentTypeDto } from "@/lib/api/grading-types";

const assessmentTypeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required").toUpperCase(),
  weight: z.coerce.number().min(0).max(100).default(0),
  description: z.string().default(""),
  color: z.string().default(""),
  is_active: z.boolean().default(true),
});

type AssessmentTypeForm = z.infer<typeof assessmentTypeSchema>;

interface AssessmentTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assessmentType: AssessmentTypeDto | null;
}

export function AssessmentTypeDialog({
  open,
  onOpenChange,
  assessmentType,
}: AssessmentTypeDialogProps) {
  const createMutation = useCreateAssessmentType();
  const updateMutation = useUpdateAssessmentType();

  const form = useForm<AssessmentTypeForm>({
    resolver: zodResolver(assessmentTypeSchema),
    defaultValues: {
      name: "",
      code: "",
      description: "",
      color: "",
      is_active: true,
      weight: 0,
    },
  });

  useEffect(() => {
    if (assessmentType) {
      form.reset({
        name: assessmentType.name,
        code: assessmentType.code,
        weight: assessmentType.weight,
        description: assessmentType.description || "",
        color: assessmentType.color || "",
        is_active: assessmentType.is_active,
      });
    } else {
      form.reset({
        name: "",
        code: "",
        description: "",
        color: "",
        is_active: true,
        weight: 0,
      });
    }
  }, [assessmentType, form]);

  const onSubmit = async (values: AssessmentTypeForm) => {
    if (assessmentType) {
      await updateMutation.mutateAsync({
        id: assessmentType.id,
        command: values,
      });
    } else {
      await createMutation.mutateAsync(values);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {assessmentType ? "Edit Assessment Type" : "Create Assessment Type"}
          </DialogTitle>
          <DialogDescription>
            Configure assessment types like Quiz, Exam, Project, etc.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Quiz" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Code</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., QZ" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight (%)</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} max={100} {...field} />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Default weight for assessments
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color (optional)</FormLabel>
                  <FormControl>
                    <Input type="color" {...field} />
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
                  <FormLabel>Description (optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Additional notes" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Active</FormLabel>
                    <FormDescription className="text-xs">
                      Allow this type to be used in new assessments
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={createMutation.isPending || updateMutation.isPending}
              >
                {assessmentType ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
