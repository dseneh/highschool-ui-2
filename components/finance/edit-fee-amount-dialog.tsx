"use client";

import * as React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogBox } from "@/components/ui/dialog-box";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { formatCurrency } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Schema                                                             */
/* ------------------------------------------------------------------ */

const schema = z.object({
  amount: z.coerce.number().min(0, "Amount must be at least 0"),
});

type FormData = z.infer<typeof schema>;

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface EditFeeAmountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (amount: number) => void;
  loading?: boolean;
  currentAmount: number;
  feeName: string;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function EditFeeAmountDialog({
  open,
  onOpenChange,
  onSubmit,
  loading = false,
  currentAmount,
  feeName,
}: EditFeeAmountDialogProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      amount: currentAmount,
    },
  });

  // Reset form when dialog opens with fee data
  React.useEffect(() => {
    if (open) {
      form.reset({
        amount: currentAmount,
      });
    }
  }, [open, currentAmount, form]);

  const handleSubmit = (data: FormData) => {
    onSubmit(data.amount);
  };

  const dialogContent = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {/* Current Amount Display */}
        <div className="rounded-lg border p-3 bg-muted/50">
          <div className="text-sm text-muted-foreground mb-1">
            Current Amount
          </div>
          <div className="text-2xl font-bold tabular-nums">
            {formatCurrency(currentAmount)}
          </div>
        </div>

        {/* New Amount Input */}
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Amount</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                This will update the fee amount for this section only.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );

  return (
    <DialogBox
      open={open}
      onOpenChange={onOpenChange}
      title="Edit Fee Amount"
      description={`Update the amount for "${feeName}" in this section.`}
      actionLabel="Update Amount"
      onAction={form.handleSubmit(handleSubmit)}
      actionLoading={loading}
    >
      {dialogContent}
    </DialogBox>
  );
}
