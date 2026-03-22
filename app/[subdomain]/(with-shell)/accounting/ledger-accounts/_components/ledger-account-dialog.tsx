"use client";

import { useEffect, useMemo, useRef, useState, type ComponentType } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  BadgeDollarSign,
  ChevronLeft,
  GraduationCap,
  HandCoins,
  Landmark,
  ReceiptText,
  Settings2,
  Wallet,
} from "lucide-react";

import { DialogBox } from "@/components/ui/dialog-box";
import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/ui/select-field";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import type {
  AccountingLedgerAccountDto,
  AccountType,
  LedgerAccountTemplateKey,
  NormalBalance,
} from "@/lib/api2/accounting-types";

type DialogMode = "create" | "edit";

type TemplateOption = {
  value: LedgerAccountTemplateKey;
  label: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
};

const ACCOUNT_TYPE_OPTIONS: { value: AccountType; label: string }[] = [
  { value: "asset", label: "Asset" },
  { value: "liability", label: "Liability" },
  { value: "equity", label: "Equity" },
  { value: "income", label: "Income" },
  { value: "expense", label: "Expense" },
];

const NORMAL_BALANCE_OPTIONS: { value: NormalBalance; label: string }[] = [
  { value: "debit", label: "Debit" },
  { value: "credit", label: "Credit" },
];

const CATEGORY_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "Uncategorized" },
  { value: "current_assets", label: "Current Assets" },
  { value: "non_current_assets", label: "Non-Current Assets" },
  { value: "current_liabilities", label: "Current Liabilities" },
  { value: "non_current_liabilities", label: "Non-Current Liabilities" },
  { value: "equity", label: "Equity" },
  { value: "operating_income", label: "Operating Income" },
  { value: "other_income", label: "Other Income" },
  { value: "cost_of_sales", label: "Cost of Sales" },
  { value: "operating_expenses", label: "Operating Expenses" },
  { value: "other_expenses", label: "Other Expenses" },
  { value: "taxes", label: "Taxes" },
];

const DEFAULT_NORMAL_BALANCE_BY_TYPE: Record<AccountType, NormalBalance> = {
  asset: "debit",
  expense: "debit",
  liability: "credit",
  equity: "credit",
  income: "credit",
};

const ACCOUNT_TEMPLATE_OPTIONS: TemplateOption[] = [
  {
    value: "manual",
    label: "Manual",
    description: "Start from scratch with full control",
    icon: Settings2,
  },
  {
    value: "bank_account",
    label: "Bank Account",
    description: "Standard bank/cash equivalent account",
    icon: Landmark,
  },
  {
    value: "petty_cash",
    label: "Petty Cash",
    description: "Small daily expenses cash account",
    icon: Wallet,
  },
  {
    value: "accounts_receivable",
    label: "Accounts Receivable",
    description: "Money expected from students/customers",
    icon: HandCoins,
  },
  {
    value: "accounts_payable",
    label: "Accounts Payable",
    description: "Outstanding bills to vendors",
    icon: ReceiptText,
  },
  {
    value: "general_income",
    label: "General Income",
    description: "Generic income or miscellaneous receipts account",
    icon: BadgeDollarSign,
  },
  {
    value: "other_income",
    label: "Other Income",
    description: "Non-operating or irregular income account",
    icon: HandCoins,
  },
  {
    value: "tuition_revenue",
    label: "Tuition Revenue",
    description: "Income account for tuition collection",
    icon: GraduationCap,
  },
  {
    value: "general_expense",
    label: "General Expense",
    description: "Generic operating expense account",
    icon: ReceiptText,
  },
  {
    value: "utilities_expense",
    label: "Utilities Expense",
    description: "Power, water, internet, and utility costs",
    icon: Wallet,
  },
  {
    value: "salary_expense",
    label: "Salary Expense",
    description: "Expense account for payroll",
    icon: BadgeDollarSign,
  },
];

const schema = z.object({
  template_key: z.enum([
    "manual",
    "bank_account",
    "petty_cash",
    "accounts_receivable",
    "accounts_payable",
    "general_income",
    "other_income",
    "tuition_revenue",
    "general_expense",
    "utilities_expense",
    "salary_expense",
  ]),
  code: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  account_type: z.enum(["asset", "liability", "equity", "income", "expense"]),
  category: z.string().optional(),
  parent_account: z.string().nullable().optional(),
  normal_balance: z.enum(["debit", "credit"]),
  is_active: z.boolean(),
  is_header: z.boolean(),
  description: z.string().nullable().optional(),
});

export type LedgerAccountDialogValues = z.infer<typeof schema>;

type CreateTemplateDefaults = Partial<
  Record<LedgerAccountTemplateKey, Partial<LedgerAccountDialogValues>>
>;

const TEMPLATE_DEFAULTS: CreateTemplateDefaults = {
  bank_account: {
    account_type: "asset",
    normal_balance: "debit",
    category: "current_assets",
  },
  petty_cash: {
    name: "Petty Cash",
    account_type: "asset",
    normal_balance: "debit",
    category: "current_assets",
  },
  accounts_receivable: {
    name: "Accounts Receivable",
    account_type: "asset",
    normal_balance: "debit",
    category: "current_assets",
  },
  accounts_payable: {
    name: "Accounts Payable",
    account_type: "liability",
    normal_balance: "credit",
    category: "current_liabilities",
  },
  general_income: {
    name: "General Income",
    account_type: "income",
    normal_balance: "credit",
    category: "operating_income",
  },
  other_income: {
    name: "Other Income",
    account_type: "income",
    normal_balance: "credit",
    category: "other_income",
  },
  tuition_revenue: {
    name: "Tuition Revenue",
    account_type: "income",
    normal_balance: "credit",
    category: "operating_income",
  },
  general_expense: {
    name: "General Expense",
    account_type: "expense",
    normal_balance: "debit",
    category: "operating_expenses",
  },
  utilities_expense: {
    name: "Utilities Expense",
    account_type: "expense",
    normal_balance: "debit",
    category: "operating_expenses",
  },
  salary_expense: {
    name: "Salary Expense",
    account_type: "expense",
    normal_balance: "debit",
    category: "operating_expenses",
  },
};

const emptyForm: LedgerAccountDialogValues = {
  template_key: "manual",
  code: "",
  name: "",
  account_type: "asset",
  category: "",
  parent_account: null,
  normal_balance: "debit",
  is_active: true,
  is_header: false,
  description: "",
};

function findCashAndBankParentId(accounts: AccountingLedgerAccountDto[]) {
  const headerAccounts = accounts.filter((account) => account.is_header);
  const cashBankHeader = headerAccounts.find((account) => {
    const label = `${account.code} ${account.name}`.toLowerCase();
    return label.includes("cash") || label.includes("bank") || label.includes("equivalent");
  });
  return cashBankHeader?.id ?? null;
}

interface LedgerAccountDialogProps {
  open: boolean;
  mode: DialogMode;
  record?: AccountingLedgerAccountDto;
  accounts: AccountingLedgerAccountDto[];
  isSubmitting: boolean;
  createTemplateKey?: LedgerAccountTemplateKey;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: LedgerAccountDialogValues) => Promise<void>;
}

function AnimatedLedgerStepContent({
  animKey,
  direction,
  children,
}: {
  animKey: number;
  direction: "forward" | "backward";
  children: React.ReactNode;
}) {
  const innerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | "auto">("auto");

  useEffect(() => {
    const node = innerRef.current;
    if (!node) return;

    setHeight(node.getBoundingClientRect().height);

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setHeight(entry.contentRect.height);
      }
    });

    observer.observe(node);
    return () => observer.disconnect();
  }, [animKey]);

  const animationClass =
    direction === "forward" ? "animate-step-forward" : "animate-step-backward";

  return (
    <div
      className="overflow-hidden transition-[height] duration-300 ease-out"
      style={{ height: typeof height === "number" ? `${height}px` : "auto" }}
    >
      <div ref={innerRef} key={animKey} className={animationClass}>
        {children}
      </div>
    </div>
  );
}

export function LedgerAccountDialog({
  open,
  mode,
  record,
  accounts,
  isSubmitting,
  createTemplateKey = "manual",
  onOpenChange,
  onSubmit,
}: LedgerAccountDialogProps) {
  const form = useForm<LedgerAccountDialogValues>({
    resolver: zodResolver(schema),
    defaultValues: emptyForm,
  });

  const [createStep, setCreateStep] = useState<"template" | "form">("template");
  const [stepDirection, setStepDirection] = useState<"forward" | "backward">("forward");
  const [stepAnimKey, setStepAnimKey] = useState(0);

  const accountTypeValue = useWatch({ control: form.control, name: "account_type" });
  const accountNameValue = useWatch({ control: form.control, name: "name" });
  const normalBalanceValue = useWatch({ control: form.control, name: "normal_balance" });
  const categoryValue = useWatch({ control: form.control, name: "category" });
  const templateKeyValue = useWatch({ control: form.control, name: "template_key" });

  const parentOptions = useMemo(
    () =>
      accounts
        .filter((account) => account.is_header && account.account_type === accountTypeValue)
        .map((account) => ({ value: account.id, label: `${account.code} - ${account.name}` })),
    [accounts, accountTypeValue]
  );

  const suggestedCashBankParentId = useMemo(
    () => findCashAndBankParentId(accounts),
    [accounts]
  );

  useEffect(() => {
    if (!open) return;

    if (mode === "edit" && record) {
      form.reset({
        template_key: "manual",
        code: record.code,
        name: record.name,
        account_type: record.account_type,
        category: record.category,
        parent_account: record.parent_account,
        normal_balance: record.normal_balance,
        is_active: record.is_active,
        is_header: record.is_header,
        description: record.description,
      });
      return;
    }

    const defaults = TEMPLATE_DEFAULTS[createTemplateKey] ?? {};
    form.reset({
      ...emptyForm,
      template_key: createTemplateKey,
      ...defaults,
      parent_account: suggestedCashBankParentId,
    });
  }, [createTemplateKey, form, mode, open, record, suggestedCashBankParentId]);

  useEffect(() => {
    if (!open || mode !== "create" || createStep !== "form") return;
    const expected = DEFAULT_NORMAL_BALANCE_BY_TYPE[accountTypeValue];
    if (form.getValues("normal_balance") !== expected) {
      form.setValue("normal_balance", expected, { shouldDirty: true });
    }
  }, [accountTypeValue, createStep, form, mode, open]);

  useEffect(() => {
    if (!open || mode !== "create" || createStep !== "form") return;
    if (accountTypeValue !== "asset") return;
    if (form.getValues("parent_account")) return;
    if (!suggestedCashBankParentId) return;

    const name = (accountNameValue || "").toLowerCase();
    if (name.includes("bank") || name.includes("cash") || name.includes("petty")) {
      form.setValue("parent_account", suggestedCashBankParentId, { shouldDirty: true });
    }
  }, [
    accountNameValue,
    accountTypeValue,
    createStep,
    form,
    mode,
    open,
    suggestedCashBankParentId,
  ]);

  useEffect(() => {
    const parentAccountId = form.getValues("parent_account");
    if (!parentAccountId) return;

    const isValidParent = accounts.some(
      (account) =>
        account.id === parentAccountId &&
        account.is_header &&
        account.account_type === accountTypeValue
    );

    if (!isValidParent) {
      form.setValue("parent_account", null, { shouldDirty: true, shouldValidate: true });
    }
  }, [accountTypeValue, accounts, form]);

  function applyTemplate(template: LedgerAccountTemplateKey) {
    const previousTemplate = form.getValues("template_key")
    const previousDefaultName = TEMPLATE_DEFAULTS[previousTemplate]?.name?.trim()
    const currentName = (form.getValues("name") ?? "").trim()

    form.setValue("template_key", template, { shouldDirty: true });

    const defaults = TEMPLATE_DEFAULTS[template];
    if (defaults) {
      if (defaults.account_type) {
        form.setValue("account_type", defaults.account_type, { shouldDirty: true });
      }
      if (defaults.normal_balance) {
        form.setValue("normal_balance", defaults.normal_balance, { shouldDirty: true });
      }
      if (defaults.category !== undefined) {
        form.setValue("category", defaults.category, { shouldDirty: true });
      }

      const canReplaceName = !currentName || (!!previousDefaultName && currentName === previousDefaultName)

      if (defaults.name) {
        if (canReplaceName) {
          form.setValue("name", defaults.name, { shouldDirty: true });
        }
      } else if (canReplaceName) {
        form.setValue("name", "", { shouldDirty: true });
      }
    }

    setStepDirection("forward");
    setStepAnimKey((previous) => previous + 1);
    setCreateStep("form");
  }

  async function handleSubmit(values: LedgerAccountDialogValues) {
    await onSubmit(values);
  }

  const title =
    mode === "create"
      ? createStep === "template"
        ? "Choose Account Type"
        : "Add Ledger Account"
      : "Edit Ledger Account";

  const description =
    mode === "create" && createStep === "template"
      ? "Pick a template to prefill account setup."
      : "Configure the account code, type, and classification.";

  const showSubmitAction = mode === "edit" || createStep === "form";
  const showCodeField = mode === "edit" || templateKeyValue === "manual";
  const showClassificationFields = mode === "edit" || templateKeyValue === "manual";
  const selectedTemplate = ACCOUNT_TEMPLATE_OPTIONS.find(
    (template) => template.value === templateKeyValue
  );
  const categoryLabel = CATEGORY_OPTIONS.find(
    (option) => option.value === (categoryValue ?? "")
  )?.label;

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setStepDirection("backward");
      setStepAnimKey((previous) => previous + 1);
      setCreateStep(createTemplateKey === "manual" ? "template" : "form");
    }
    onOpenChange(nextOpen);
  }

  function handleBackToTemplates() {
    setStepDirection("backward");
    setStepAnimKey((previous) => previous + 1);
    setCreateStep("template");
  }

  return (
    <DialogBox
      open={open}
      onOpenChange={handleOpenChange}
      title={title}
      description={description}
      actionLabel={showSubmitAction ? (mode === "create" ? "Create Account" : "Update Account") : undefined}
      actionLoadingText={mode === "create" ? "Creating..." : "Updating..."}
      actionLoading={isSubmitting}
      formId={showSubmitAction ? "ledger-account-form" : undefined}
      className="max-w-2xl"
      showCloseButton={false}
      footer={
        mode === "create" && createStep === "form" ? (
          <div className="flex w-full items-center justify-between gap-3 p-2 sm:p-3 border-t">
            <Button
              type="button"
              variant="ghost"
              onClick={handleBackToTemplates}
              disabled={isSubmitting}
              icon={<ChevronLeft className="h-4 w-4" />}
            >
              Back to Templates
            </Button>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form="ledger-account-form"
                loading={isSubmitting}
                loadingText={mode === "create" ? "Creating..." : "Updating..."}
              >
                Create Account
              </Button>
            </div>
          </div>
        ) : undefined
      }
    >
      <AnimatedLedgerStepContent animKey={stepAnimKey} direction={stepDirection}>
        {mode === "create" && createStep === "template" ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {ACCOUNT_TEMPLATE_OPTIONS.map((template) => {
              const Icon = template.icon;
              return (
                <button
                  key={template.value}
                  type="button"
                  onClick={() => applyTemplate(template.value)}
                  className="rounded-lg border border-border bg-card p-4 text-left transition hover:border-primary/50 hover:bg-muted/40"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <span className="rounded-md bg-muted p-2">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="font-medium">{template.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{template.description}</p>
                </button>
              );
            })}
          </div>
        ) : (
          <Form {...form}>
          <form
            id="ledger-account-form"
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4 p-1"
          >
            {mode === "create" && templateKeyValue === "manual" && (
              <div className="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-[11px] text-blue-800">
                <span>
                  Tip: for physical bank or cash accounts, use <br />
                  <span className="font-semibold"> Account Type = Asset</span> and
                  <span className="font-semibold"> Normal Balance = Debit</span>.
                </span>
              </div>
            )}

            {mode === "create" && templateKeyValue !== "manual" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2 border rounded-lg border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/50 px-3 py-2 text-[11px] text-green-800">
                  <p className="text-sm font-semibold tracking-wide text-muted-foreground fuppercase">
                    Account Type: {selectedTemplate?.label ?? "Selected Template"}
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <div className="rounded-md border border-border bg-background px-3 py-2">
                    <p className="text-[11px] text-muted-foreground">Type</p>
                    <p className="text-sm font-medium capitalize">{accountTypeValue}</p>
                  </div>
                  <div className="rounded-md border border-border bg-background px-3 py-2">
                    <p className="text-[11px] text-muted-foreground">Normal Balance</p>
                    <p className="text-sm font-medium capitalize">{normalBalanceValue}</p>
                  </div>
                  <div className="rounded-md border border-border bg-background px-3 py-2">
                    <p className="text-[11px] text-muted-foreground">Category</p>
                    <p className="text-sm font-medium">{categoryLabel ?? "Uncategorized"}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Account code will be auto-generated for this template unless you switch to Manual.
                </p>
              </div>
            )}
            <div className="grid grid-cols-1 fsm:grid-cols-2 gap-4">
              {showCodeField && (
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Code (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Auto-generated if left empty"
                          className="font-mono max-w-sm"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <div className="-mt-1 text-xs text-muted-foreground">
                        If left empty, the system will generate a code based on the type of account or parent group.
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Account Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Cash and Cash Equivalents" {...field} autoFocus />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {showClassificationFields && (
                <>
                  <FormField
                    control={form.control}
                    name="account_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Type</FormLabel>
                        <FormControl>
                          <SelectField
                            items={ACCOUNT_TYPE_OPTIONS}
                            value={field.value}
                            onValueChange={field.onChange}
                            placeholder="Select type"
                          />
                        </FormControl>
                        <p className="text-xs text-muted-foreground">
                          Choose where this account lives (e.g. bank account = Asset).
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="normal_balance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Normal Balance</FormLabel>
                        <FormControl>
                          <SelectField
                            items={NORMAL_BALANCE_OPTIONS}
                            value={field.value}
                            onValueChange={field.onChange}
                            placeholder="Select balance side"
                          />
                        </FormControl>
                        <p className="text-xs text-muted-foreground">
                          Auto-set from account type. Assets/Expenses usually Debit, Income/Liability/Equity usually Credit.
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <SelectField
                            searchable
                            items={CATEGORY_OPTIONS}
                            value={field.value ?? ""}
                            onValueChange={field.onChange}
                            placeholder="Select category"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
              {parentOptions.length > 0 && (
                <FormField
                  control={form.control}
                  name="parent_account"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parent Account</FormLabel>
                      <FormControl>
                        <SelectField
                          items={[{ value: "", label: "None" }, ...parentOptions]}
                          value={field.value ?? ""}
                          onValueChange={(value) => field.onChange(value || null)}
                          placeholder="Select parent"
                          searchable
                        />
                      </FormControl>
                      <p className="text-[11px] -mt-1 text-muted-foreground">
                        Only header accounts with the same account type are available here.
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Optional notes about this account..."
                      rows={2}
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              {(mode === "edit" || templateKeyValue === "manual") && (
                <FormField
                  control={form.control}
                  name="is_header"
                  render={({ field }) => (
                    <FormItem className="w-full rounded-lg border border-border bg-muted/30 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="space-y-1">
                          <FormLabel>Header Account</FormLabel>
                          <p className="text-xs text-muted-foreground">
                            Use this as a parent grouping account. Transactions should be posted to child accounts.
                          </p>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </div>
                    </FormItem>
                  )}
                />
              )}

              {mode === "edit" && (
                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="w-full rounded-lg border border-border bg-muted/30 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="space-y-1">
                          <FormLabel>Active</FormLabel>
                          <p className="text-xs text-muted-foreground">
                            Make this account available for transactions. Inactive accounts are hidden from selection but historical data is retained.
                          </p>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </div>
                    </FormItem>
                  )}
                />
              )}
            </div>
          </form>
          </Form>
        )}
      </AnimatedLedgerStepContent>
    </DialogBox>
  );
}
