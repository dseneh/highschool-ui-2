"use client";

import BaseDataSelect from "./base-data-select";
import { useTransactionTypes } from "@/hooks/use-accounting";
import type { AccountingTransactionTypeDto, TransactionCategory } from "@/lib/api2/accounting-types";
import type { DataSelectBaseProps } from "./types";

type AccountingTransactionTypeSelectProps = DataSelectBaseProps & {
  urlParamName?: string;
  category?: TransactionCategory;
  includeNoneOption?: boolean;
  noneLabel?: string;
};

export default function AccountingTransactionTypeSelect({
  urlParamName = "transaction_type",
  category,
  includeNoneOption = false,
  noneLabel = "None",
  ...props
}: AccountingTransactionTypeSelectProps) {
  return (
    <BaseDataSelect<AccountingTransactionTypeDto>
      {...props}
      urlParamName={urlParamName}
      useDataHook={useTransactionTypes}
      title={props.title ?? "Transaction Type"}
      mapOptions={(items) => {
        const list = Array.isArray(items) ? items : [];

        const mapped = list
          .filter((item) => (category ? item.transaction_category === category : true))
          .map((item) => ({
            value: item.id,
            label: item.name,
            active: item.is_active,
          }));

        return includeNoneOption
          ? [{ value: "", label: noneLabel, active: true }, ...mapped]
          : mapped;
      }}
      searchable={props.searchable ?? true}
      showActiveOnly={props.showActiveOnly ?? true}
    />
  );
}
