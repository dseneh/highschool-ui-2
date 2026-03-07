"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useTransactionTypeMutations } from "@/hooks/use-finance";
import { showToast } from "@/lib/toast";
import type { TransactionTypeDto } from "@/lib/api2/finance-types";

const schema = z.object({
  name: z.string().min(1, "Name is required").min(3, "Name must be at least 3 characters"),
  type: z.enum(["income", "expense"]),
  description: z.string(),
  is_hidden: z.boolean(),
  active: z.enum(["true", "false"]),
});

type FormValues = z.infer<typeof schema>;

interface EditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: TransactionTypeDto;
  onSuccess?: () => void;
}

export function EditDialog({ open, onOpenChange, type, onSuccess }: EditDialogProps) {
  const mutations = useTransactionTypeMutations();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: type.name,
      type: type.type,
      description: type.description || "",
      is_hidden: type.is_hidden,
      active: type.active ? "true" : "false",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: type.name,
        type: type.type,
        description: type.description || "",
        is_hidden: type.is_hidden,
        active: type.active ? "true" : "false",
      });
    }
  }, [open, type, form]);

  const onSubmit = async (values: FormValues) => {
    try {
      await mutations.update.mutateAsync({
        id: type.id,
        payload: {
          name: values.name,
          type: values.type,
          description: values.description || undefined,
          is_hidden: values.is_hidden,
        },
      });
      showToast.success("Transaction type updated successfully");
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      showToast.error("Failed to update transaction type");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Transaction Type</DialogTitle>
          <DialogDescription>
            Update the transaction type details.
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
                    <Input placeholder="e.g., Tuition Fee, Library Fine" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>
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
                    <Textarea
                      placeholder="Optional description for this transaction type"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_hidden"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel>Hide this type from general use</FormLabel>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={mutations.update.isPending}
                loadingText="Saving..."
              >
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
