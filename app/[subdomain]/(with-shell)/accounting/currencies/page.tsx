"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PlusSignIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import PageLayout from "@/components/dashboard/page-layout";
import { DialogBox } from "@/components/ui/dialog-box";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { AccountingTableSkeleton } from "@/components/accounting/accounting-table-skeleton";
import { showToast } from "@/lib/toast";
import {
  useAccountingCurrencies,
  useAccountingCurrencyMutations,
} from "@/hooks/use-accounting";
import type { AccountingCurrencyDto } from "@/lib/api2/accounting-types";
import { CurrenciesTable } from "./_components/currencies-table";

/* ------------------------------------------------------------------ */
/*  Schema                                                              */
/* ------------------------------------------------------------------ */

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().min(2).max(3, "ISO code must be 2-3 characters"),
  symbol: z.string().min(1, "Symbol is required"),
  is_base_currency: z.boolean(),
  is_active: z.boolean(),
  decimal_places: z.coerce.number().int().min(0).max(4),
});

type FormValues = z.infer<typeof schema>;

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */

export default function CurrenciesPage() {
  const { data: currencies = [], isLoading, error, refetch } = useAccountingCurrencies();
  const { create, update, remove } = useAccountingCurrencyMutations();

  const [dialog, setDialog] = useState<{
    open: boolean;
    mode: "create" | "edit";
    record?: AccountingCurrencyDto;
  }>({ open: false, mode: "create" });

  const [deleteTarget, setDeleteTarget] = useState<AccountingCurrencyDto | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      code: "",
      symbol: "",
      is_base_currency: false,
      is_active: true,
      decimal_places: 2,
    },
  });

  function openCreate() {
    form.reset({
      name: "",
      code: "",
      symbol: "",
      is_base_currency: false,
      is_active: true,
      decimal_places: 2,
    });
    setDialog({ open: true, mode: "create" });
  }

  function openEdit(record: AccountingCurrencyDto) {
    form.reset({
      name: record.name,
      code: record.code,
      symbol: record.symbol,
      is_base_currency: record.is_base_currency,
      is_active: record.is_active,
      decimal_places: record.decimal_places,
    });
    setDialog({ open: true, mode: "edit", record });
  }

  async function handleSubmit(values: FormValues) {
    try {
      if (dialog.mode === "create") {
        const createPayload = {
          name: values.name,
          code: values.code,
          symbol: values.symbol,
          is_base_currency: values.is_base_currency,
          decimal_places: values.decimal_places,
        };
        await create.mutateAsync(createPayload);
        showToast.success("Currency created");
      } else {
        await update.mutateAsync({ id: dialog.record!.id, payload: values });
        showToast.success("Currency updated");
      }
      setDialog({ open: false, mode: "create" });
    } catch {
      showToast.error("Failed to save currency");
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await remove.mutateAsync(deleteTarget.id);
      showToast.success("Currency deleted");
    } catch {
      showToast.error("Failed to delete currency");
    } finally {
      setDeleteTarget(null);
    }
  }

  return (
    <>
      <PageLayout
        title="Currencies"
        description="Manage currencies for accounting transactions"
        actions={
          <Button icon={<HugeiconsIcon icon={PlusSignIcon} />} onClick={openCreate}>
            Add Currency
          </Button>
        }
        skeleton={<AccountingTableSkeleton columns={6} />}
        loading={isLoading}
        error={error}
        refreshAction={refetch}
      >
        <CurrenciesTable
          currencies={currencies}
          isLoading={isLoading}
          onEdit={openEdit}
          onDelete={setDeleteTarget}
        />
      </PageLayout>

      {/* Create / Edit Dialog */}
      <DialogBox
        open={dialog.open}
        onOpenChange={(open) => setDialog((s) => ({ ...s, open }))}
        title={dialog.mode === "create" ? "Add Currency" : "Edit Currency"}
        description="Configure currency code, symbol, and settings."
        actionLabel={dialog.mode === "create" ? "Create" : "Submit"}
        actionLoading={create.isPending || update.isPending}
        formId="currency-form"
      >
        <Form {...form}>
          <form
            id="currency-form"
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="US Dollar" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ISO Code</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="USD"
                        className="uppercase"
                        maxLength={3}
                        {...field}
                        onChange={(e) =>
                          field.onChange(e.target.value.toUpperCase())
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="symbol"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Symbol</FormLabel>
                    <FormControl>
                      <Input placeholder="$" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="decimal_places"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Decimal Places</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} max={4} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {/* Settings Cards */}
            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="is_base_currency"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="border rounded-lg p-4 bg-slate-50 hover:bg-slate-100 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <FormLabel  htmlFor="switch-focus-mode" className="">
                              Base Currency
                            </FormLabel>
                            <p className="text-xs text-slate-600">
                              Set this as the default currency for accounting operations
                            </p>
                          </div>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="fml-3"
                            id="switch-focus-mode"
                          />
                        </div>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
              {dialog.mode === "edit" && (
                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="border rounded-lg p-4 bg-slate-50 hover:bg-slate-100 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <FormLabel  htmlFor="switch-focus-mode1" className="">
                                Active
                              </FormLabel>
                              <p className="text-xs text-slate-600">
                                Inactive currencies cannot be used in new transactions
                              </p>
                            </div>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              id="switch-focus-mode1"
                            />
                          </div>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}
            </div>
          </form>
        </Form>
      </DialogBox>

      {/* Delete Confirmation */}
      <DialogBox
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Currency"
        actionLabel="Delete"
        actionVariant="destructive"
        actionLoading={remove.isPending}
        onAction={handleDelete}
      >
        Are you sure you want to delete &apos;{deleteTarget?.name}&apos;? This cannot be undone.
    </DialogBox>
    </>
  );
}
