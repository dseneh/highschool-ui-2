"use client";

import BaseDataSelect from "./base-data-select";
import { useLedgerAccounts } from "@/hooks/use-accounting";
import type { AccountType, AccountingLedgerAccountDto } from "@/lib/api2/accounting-types";
import type { DataSelectBaseProps } from "./types";

type AccountingLedgerAccountSelectProps = DataSelectBaseProps & {
  urlParamName?: string;
  includeHeaders?: boolean;
  includeNoneOption?: boolean;
  noneLabel?: string;
  includeAddNewOption?: boolean;
  addNewLabel?: string;
  onAddNewAccount?: () => void;
  accountTypes?: AccountType[];
  excludeIds?: string[];
  codeNameSeparator?: string;
};

const ADD_NEW_LEDGER_VALUE = "__add_new_ledger_account__";

export default function AccountingLedgerAccountSelect({
  urlParamName = "ledger_account",
  includeHeaders = false,
  includeNoneOption = false,
  noneLabel = "None",
  includeAddNewOption = false,
  addNewLabel = "Add New Account",
  onAddNewAccount,
  accountTypes,
  excludeIds,
  codeNameSeparator = " - ",
  ...props
}: AccountingLedgerAccountSelectProps) {
  const excluded = new Set((excludeIds ?? []).filter(Boolean));

  return (
    <BaseDataSelect<AccountingLedgerAccountDto>
      {...props}
      urlParamName={urlParamName}
      useDataHook={useLedgerAccounts}
      onChange={(value) => {
        if (value === ADD_NEW_LEDGER_VALUE) {
          onAddNewAccount?.();
          return;
        }
        props.onChange?.(value);
      }}
      title={props.title ?? "Ledger Account"}
      mapOptions={(items) => {
        const list = Array.isArray(items) ? items : [];

        const mapped = list
          .filter((account) => includeHeaders || !account.is_header)
          .filter((account) => !accountTypes || accountTypes.includes(account.account_type))
          .filter((account) => !excluded.has(account.id))
          .map((account) => ({
            value: account.id,
            label: `${account.code}${codeNameSeparator}${account.name}`,
            active: account.is_active,
          }));

        const addNewOption = includeAddNewOption
          ? [{ value: ADD_NEW_LEDGER_VALUE, label: addNewLabel, active: true }]
          : [];

        const withAddNew = [...addNewOption, ...mapped];

        const withOptionalNone = includeNoneOption
          ? [{ value: "", label: noneLabel, active: true }, ...withAddNew]
          : withAddNew;

        return withOptionalNone;
      }}
      searchable={props.searchable ?? true}
      showActiveOnly={props.showActiveOnly ?? true}
    />
  );
}
