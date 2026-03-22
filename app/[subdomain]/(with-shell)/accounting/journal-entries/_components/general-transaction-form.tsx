"use client";

import { format } from "date-fns";
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
import { Input } from "@/components/ui/input";
import {
  AccountingCurrencySelect,
  AccountingLedgerAccountSelect,
} from "@/components/shared/data-reusable";
import { Textarea } from "@/components/ui/textarea";

import { GeneralFormValues } from "./posting-form-schemas";

type GeneralTransactionFormProps = {
  form: UseFormReturn<GeneralFormValues>;
};

export function GeneralTransactionForm({
  form,
}: GeneralTransactionFormProps) {
  return (
    <Form {...form}>
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="debit_account"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Debit Account</FormLabel>
                <FormControl>
                  <AccountingLedgerAccountSelect
                    useUrlState={false}
                    noTitle
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Select debit account"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="credit_account"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Credit Account</FormLabel>
                <FormControl>
                  <AccountingLedgerAccountSelect
                    useUrlState={false}
                    noTitle
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Select credit account"
                  />
                </FormControl>
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
                <Input placeholder="Journal entry description" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea rows={2} placeholder="Additional notes..." {...field} />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </Form>
  );
}
