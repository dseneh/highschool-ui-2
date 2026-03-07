"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateGradeLetter, useUpdateGradeLetter } from "@/hooks/use-grading";
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
import type { GradeLetterDto } from "@/lib/api/grading-types";

const gradeLetterSchema = z.object({
  letter: z.string().min(1, "Letter is required").max(3),
  min_score: z.coerce.number().min(0).max(100),
  max_score: z.coerce.number().min(0).max(100),
  gpa_value: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.coerce.number().optional()
  ),
  description: z.string().optional(),
  is_passing: z.boolean().default(true),
}).refine((data) => data.max_score >= data.min_score, {
  message: "Max score must be greater than or equal to min score",
  path: ["max_score"],
});

type GradeLetterFormInput = z.input<typeof gradeLetterSchema>;
type GradeLetterForm = z.output<typeof gradeLetterSchema>;

interface GradeLetterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gradeLetter: GradeLetterDto | null;
}

export function GradeLetterDialog({
  open,
  onOpenChange,
  gradeLetter,
}: GradeLetterDialogProps) {
  const createMutation = useCreateGradeLetter();
  const updateMutation = useUpdateGradeLetter();

  const form = useForm<GradeLetterFormInput, unknown, GradeLetterForm>({
    resolver: zodResolver(gradeLetterSchema),
    defaultValues: {
      letter: "",
      description: "",
      gpa_value: "" as unknown as number,
      is_passing: true,
      min_score: 0,
      max_score: 100,
    },
  });

  useEffect(() => {
    if (gradeLetter) {
      form.reset({
        letter: gradeLetter.letter,
        min_score: gradeLetter.min_score,
        max_score: gradeLetter.max_score,
        gpa_value: gradeLetter.gpa_value ?? ("" as unknown as number),
        description: gradeLetter.description || "",
        is_passing: gradeLetter.is_passing,
      });
    } else {
      form.reset({
        letter: "",
        description: "",
        gpa_value: "" as unknown as number,
        is_passing: true,
        min_score: 0,
        max_score: 100,
      });
    }
  }, [gradeLetter, form]);

  const onSubmit = async (values: GradeLetterForm) => {
    if (gradeLetter) {
      await updateMutation.mutateAsync({
        id: gradeLetter.id,
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
            {gradeLetter ? "Edit Grade Letter" : "Create Grade Letter"}
          </DialogTitle>
          <DialogDescription>
            Define a grade letter with its score range and GPA value
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="letter"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Letter Grade</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., A, B+, C" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="min_score"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Min Score (%)</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} max={100} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="max_score"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Score (%)</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} max={100} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="gpa_value"
              render={({ field }) => {
                const { value, ...fieldProps } = field;
                return (
                  <FormItem>
                    <FormLabel>GPA Value (optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="e.g., 4.0"
                        {...fieldProps}
                        value={typeof value === "number" || typeof value === "string" ? value : ""}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Grade point average value for this letter
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., Excellent" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_passing"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Passing Grade</FormLabel>
                    <FormDescription className="text-xs">
                      Mark this as a passing grade
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
                {gradeLetter ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
