"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateGradebook } from "@/hooks/use-grading";
import { useSubjects } from "@/hooks/use-subject";
import { useSections } from "@/hooks/use-section";
import { useGradeLevels } from "@/hooks/use-grade-level";
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
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CalculationMethod } from "@/lib/api/grading-types";

const createGradebookSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  section: z.string().min(1, "Section is required"),
  calculation_method: z.enum(["weighted", "unweighted", "points_based"]).optional(),
});

type CreateGradebookForm = z.infer<typeof createGradebookSchema>;

interface CreateGradebookDialogProps {
  academicYearId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateGradebookDialog({
  academicYearId,
  open,
  onOpenChange,
}: CreateGradebookDialogProps) {
  const [selectedGradeLevel, setSelectedGradeLevel] = useState<string | undefined>();
  
  const { data: subjects } = useSubjects();
  const { data: gradeLevels } = useGradeLevels();
  const { data: sections } = useSections(selectedGradeLevel);
  const createMutation = useCreateGradebook(academicYearId);

  const form = useForm<CreateGradebookForm>({
    resolver: zodResolver(createGradebookSchema),
    defaultValues: {
      calculation_method: CalculationMethod.WEIGHTED,
    },
  });

  const onSubmit = async (values: CreateGradebookForm) => {
    await createMutation.mutateAsync(values);
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Gradebook</DialogTitle>
          <DialogDescription>
            Create a new gradebook for a subject and section
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {subjects?.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Grade Level Selector (not part of form, just for filtering sections) */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Grade Level (for filtering sections)</label>
              <Select
                value={selectedGradeLevel || ""}
                onValueChange={(value) => setSelectedGradeLevel(value || undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select grade level" />
                </SelectTrigger>
                <SelectContent>
                  {gradeLevels?.map((level) => (
                    <SelectItem key={level.id} value={level.id}>
                      {level.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <FormField
              control={form.control}
              name="section"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Section</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select section" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {sections?.map((section) => (
                        <SelectItem key={section.id} value={section.id}>
                          {section.name} ({section.grade_level?.name})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="calculation_method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Calculation Method</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select calculation method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={CalculationMethod.WEIGHTED}>
                        Weighted Average
                      </SelectItem>
                      <SelectItem value={CalculationMethod.UNWEIGHTED}>
                        Unweighted Average
                      </SelectItem>
                      <SelectItem value={CalculationMethod.POINTS_BASED}>
                        Points Based
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
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
              <Button type="submit" loading={createMutation.isPending}>
                Create Gradebook
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
