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
import {
  AccountingBankAccountSelect,
  AccountingCurrencySelect,
} from "@/components/shared/data-reusable";
import { Textarea } from "@/components/ui/textarea";

import { AccountTransferFormValues } from "./posting-form-schemas";

type AccountTransferFormProps = {
  form: UseFormReturn<AccountTransferFormValues>;
};

export function AccountTransferForm({
  form,
}: AccountTransferFormProps) {
  const fromAccount = form.watch("from_account");
  const toAccount = form.watch("to_account");

  return (
    <Form {...form}>
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="from_account"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Source Account</FormLabel>
                <FormControl>
                  <AccountingBankAccountSelect
                    useUrlState={false}
                    noTitle
                    excludeIds={toAccount ? [toAccount] : []}
                    value={field.value}
                    onChange={(value) => {
                      field.onChange(value);
                      if (value === form.getValues("to_account")) {
                        form.setValue("to_account", "", {
                          shouldDirty: true,
                          shouldValidate: true,
                        });
                      }
                    }}
                    placeholder="Transfer from"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="to_account"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Destination Account</FormLabel>
                <FormControl>
                  <AccountingBankAccountSelect
                    useUrlState={false}
                    noTitle
                    excludeIds={fromAccount ? [fromAccount] : []}
                    value={field.value}
                    onChange={(value) => {
                      field.onChange(value);
                      if (value === form.getValues("from_account")) {
                        form.setValue("from_account", "", {
                          shouldDirty: true,
                          shouldValidate: true,
                        });
                      }
                    }}
                    placeholder="Transfer to"
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
                <Textarea placeholder="Reason for transfer" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </Form>
  );
}
