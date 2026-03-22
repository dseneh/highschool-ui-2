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
  AccountingBankAccountSelect,
  AccountingCurrencySelect,
  AccountingTransactionTypeSelect,
} from "@/components/shared/data-reusable";

import { IncomeFormValues } from "./posting-form-schemas";

type NewIncomeFormProps = {
  form: UseFormReturn<IncomeFormValues>;
};

export function NewIncomeForm({
  form,
}: NewIncomeFormProps) {
  return (
    <Form {...form}>
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                    placeholder="Receiving account"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="income_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Income Type</FormLabel>
                <FormControl>
                  <AccountingTransactionTypeSelect
                    useUrlState={false}
                    noTitle
                    category="income"
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Select income type"
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
            name="payer"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payer</FormLabel>
                <FormControl>
                  <Input placeholder="Name of payer / source" {...field} />
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
                <Input placeholder="Brief description of income" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </Form>
  );
}
