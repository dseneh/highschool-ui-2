import { BankAccountDto } from "@/lib/api/finance-types";
import { getIconByKey } from "@/lib/icon-map";
import { formatCurrency } from "@/lib/utils";

export function buildSummary(accounts: BankAccountDto[]) {
  const totalIncome = accounts.reduce(
    (s, a) => s + (a.basic_analysis?.totals.total_income ?? 0),
    0,
  );
  const totalExpense = accounts.reduce(
    (s, a) => s + (a.basic_analysis?.totals.total_expense ?? 0),
    0,
  );
  const totalBalance = accounts.reduce((s, a) => s + Number(a.balance ?? 0), 0);

  return [
    {
      title: "Total Income",
      value: formatCurrency(totalIncome),
      subtitle: `Across ${accounts.filter((a) => a.active).length} active accounts`,
      icon: getIconByKey("income"),
    },
    {
      title: "Total Expenses",
      value: formatCurrency(totalExpense),
      subtitle: "All accounts",
      icon: getIconByKey("cancel"),
    },
    {
      title: "Current Balance",
      value: formatCurrency(totalBalance),
      subtitle: `${accounts.length} total accounts`,
      icon: getIconByKey("balance"),
    },
  ];
}
