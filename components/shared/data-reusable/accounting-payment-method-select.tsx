"use client";

import BaseDataSelect from "./base-data-select";
import { usePaymentMethods } from "@/hooks/use-accounting";
import type { AccountingPaymentMethodDto } from "@/lib/api2/accounting-types";
import type { DataSelectBaseProps } from "./types";

type AccountingPaymentMethodSelectProps = DataSelectBaseProps & {
  urlParamName?: string;
  includeNoneOption?: boolean;
  noneLabel?: string;
};

export default function AccountingPaymentMethodSelect({
  urlParamName = "payment_method",
  includeNoneOption = false,
  noneLabel = "None",
  ...props
}: AccountingPaymentMethodSelectProps) {
  return (
    <BaseDataSelect<AccountingPaymentMethodDto>
      {...props}
      urlParamName={urlParamName}
      useDataHook={usePaymentMethods}
      title={props.title ?? "Payment Method"}
      mapOptions={(items) => {
        const list = Array.isArray(items) ? items : [];

        const mapped = list.map((method) => ({
          value: method.id,
          label: method.name,
          active: method.is_active,
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
