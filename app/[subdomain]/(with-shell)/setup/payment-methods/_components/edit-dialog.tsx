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
  FormDescription,
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
import { usePaymentMethodMutations } from "@/hooks/use-finance";
import { showToast } from "@/lib/toast";
import type { PaymentMethodDto } from "@/lib/api2/finance-types";

const schema = z.object({
  name: z.string().min(1, "Name is required").min(3, "Name must be at least 3 characters"),
  description: z.string(),
  active: z.enum(["true", "false"]),
});

type FormValues = z.infer<typeof schema>;

interface EditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  method: PaymentMethodDto;
  onSuccess?: () => void;
}

export function EditDialog({ open, onOpenChange, method, onSuccess }: EditDialogProps) {
  const mutations = usePaymentMethodMutations();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: method.name,
      description: method.description || "",
      active: method.active ? "true" : "false",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: method.name,
        description: method.description || "",
        active: method.active ? "true" : "false",
      });
    }
  }, [open, method, form]);

  const onSubmit = async (values: FormValues) => {
    try {
      await mutations.update.mutateAsync({
        id: method.id,
        payload: {
          name: values.name,
          description: values.description || undefined,
          active: values.active === "true",
        },
      });
      showToast.success("Payment method updated successfully");
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      showToast.error("Failed to update payment method");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Payment Method</DialogTitle>
          <DialogDescription>
            Update the payment method details.
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
                    <Input placeholder="e.g., Bank Transfer, Credit Card" {...field} />
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
                    <Textarea
                      placeholder="Optional description for this payment method"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide details about how students should use this payment method.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="active"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="true">Active</SelectItem>
                      <SelectItem value="false">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
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
