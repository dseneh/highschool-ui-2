"use client";

import BaseDataSelect from "./base-data-select";
import { useAccountingCurrencies } from "@/hooks/use-accounting";
import type { AccountingCurrencyDto } from "@/lib/api2/accounting-types";
import type { DataSelectBaseProps } from "./types";

type CurrencyLabelMode = "code-name" | "code" | "name" | "symbol-code";

type AccountingCurrencySelectProps = DataSelectBaseProps & {
  urlParamName?: string;
  labelMode?: CurrencyLabelMode;
};

export default function AccountingCurrencySelect({
  urlParamName = "currency",
  labelMode = "code-name",
  ...props
}: AccountingCurrencySelectProps) {
  return (
    <BaseDataSelect<AccountingCurrencyDto>
      {...props}
      urlParamName={urlParamName}
      useDataHook={useAccountingCurrencies}
      title={props.title ?? "Currency"}
      mapOptions={(items) => {
        const list = Array.isArray(items) ? items : [];
        return list
          .filter((currency) => currency.is_active)
          .map((currency) => {
            let label = `${currency.code} - ${currency.name}`;
            if (labelMode === "code") label = currency.code;
            if (labelMode === "name") label = currency.name;
            if (labelMode === "symbol-code") label = `${currency.symbol} ${currency.code}`;

            return {
              value: currency.id,
              label,
              active: currency.is_active,
            };
          });
      }}
      searchable={props.searchable ?? true}
    />
  );
}
