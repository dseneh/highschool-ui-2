"use client";

import { format } from "date-fns";
import { Search } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

import { DatePicker } from "@/components/ui/date-picker";
import { AccountingAmountField } from "@/components/accounting/accounting-amount-field";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  AccountingBankAccountSelect,
  AccountingCurrencySelect,
  AccountingPaymentMethodSelect,
} from "@/components/shared/data-reusable";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

import { StudentPaymentFormValues } from "./posting-form-schemas";

type StudentPaymentFormProps = {
  form: UseFormReturn<StudentPaymentFormValues>;
  onOpenStudentFinder: () => void;
};

export function StudentPaymentForm({
  form,
  onOpenStudentFinder,
}: StudentPaymentFormProps) {
  return (
    <Form {...form}>
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="student_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Student ID</FormLabel>
              <FormControl>
                <InputGroup>
                  <InputGroupInput
                    placeholder="e.g. STU-2024-001"
                    className="font-mono"
                    {...field}
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      type="button"
                      variant="ghost"
                      size="xs"
                      onClick={onOpenStudentFinder}
                    >
                      <Search className="h-4 w-4" /> Find
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bank_account"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bank Account</FormLabel>
              <FormControl>
                <AccountingBankAccountSelect
                  useUrlState={false}
                  noTitle
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select account"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="payment_method"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Method</FormLabel>
                <FormControl>
                  <AccountingPaymentMethodSelect
                    useUrlState={false}
                    noTitle
                    includeNoneOption
                    value={field.value ?? ""}
                    onChange={(value) => field.onChange(value || null)}
                    placeholder="Select method"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Currency</FormLabel>
                <FormControl>
                  <AccountingCurrencySelect
                    useUrlState={false}
                    noTitle
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Select currency"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <AccountingAmountField
                    field={field}
                    currencyCode={form.watch("currency")}
                    placeholder="0.00"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="entry_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <DatePicker
                    value={field.value ? new Date(field.value) : undefined}
                    onChange={(date) =>
                      field.onChange(date ? format(date, "yyyy-MM-dd") : "")
                    }
                    placeholder="Select date"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="e.g. Term 1 school fees payment" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </Form>
  );
}
