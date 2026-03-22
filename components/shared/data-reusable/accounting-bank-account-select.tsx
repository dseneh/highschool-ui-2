"use client";

import BaseDataSelect from "./base-data-select";
import { useAccountingBankAccounts } from "@/hooks/use-accounting";
import type { AccountingBankAccountDto } from "@/lib/api2/accounting-types";
import type { DataSelectBaseProps } from "./types";

type BankAccountLabelMode = "account-bank" | "account" | "bank";

type AccountingBankAccountSelectProps = DataSelectBaseProps & {
  urlParamName?: string;
  excludeIds?: string[];
  includeStatuses?: Array<"active" | "inactive" | "closed">;
  labelMode?: BankAccountLabelMode;
};

export default function AccountingBankAccountSelect({
  urlParamName = "bank_account",
  excludeIds,
  includeStatuses = ["active"],
  labelMode = "account-bank",
  ...props
}: AccountingBankAccountSelectProps) {
  const excluded = new Set((excludeIds ?? []).filter(Boolean));

  return (
    <BaseDataSelect<AccountingBankAccountDto>
      {...props}
      urlParamName={urlParamName}
      useDataHook={useAccountingBankAccounts}
      title={props.title ?? "Bank Account"}
      mapOptions={(items) => {
        const list = Array.isArray(items) ? items : [];

        return list
          .filter((account) => includeStatuses.includes(account.status))
          .filter((account) => !excluded.has(account.id))
          .map((account) => {
            let label = `${account.account_name} (${account.bank_name})`;
            if (labelMode === "account") label = account.account_name;
            if (labelMode === "bank") label = account.bank_name;

            return {
              value: account.id,
              label,
              active: account.status === "active",
            };
          });
      }}
      searchable={props.searchable ?? true}
    />
  );
}
