import type { ComponentProps } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  UserGroupIcon,
  Invoice01Icon,
  Calendar01Icon,
  UserIcon,
  Notification01Icon,
  Comment01Icon,
  Settings01Icon,
  Task01Icon,
  Tick01Icon,
  Cancel01Icon,
  Coins01Icon,
  MoneyReceiveSquareIcon,
  BankIcon,
  CreditCardIcon,
} from "@hugeicons/core-free-icons";

type IconType = ComponentProps<typeof HugeiconsIcon>["icon"];

const iconMap: Record<string, IconType> = {
  employees: UserGroupIcon,
  invoices: Invoice01Icon,
  attendance: Calendar01Icon,
  user: UserIcon,
  notification: Notification01Icon,
  mentions: Comment01Icon,
  settings: Settings01Icon,
  performance: Task01Icon,
  check: Tick01Icon,
  cancel: Cancel01Icon,
  payroll: Coins01Icon,
  income: MoneyReceiveSquareIcon,
  bank: BankIcon,
  balance: CreditCardIcon,
  transactions: Coins01Icon,
};

/**
 * Resolve a serialisable icon key (from API responses) to an actual icon component.
 * Returns UserGroupIcon as fallback when the key is unknown.
 */
export function getIconByKey(key: string): IconType {
  return iconMap[key] ?? UserGroupIcon;
}
