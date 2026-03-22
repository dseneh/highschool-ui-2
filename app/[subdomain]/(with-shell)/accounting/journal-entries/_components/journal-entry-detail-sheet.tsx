"use client";

import { format } from "date-fns";

import { ActionSheet } from "@/components/shared/action-sheet";
import StatusBadge from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  AccountingJournalEntryDetailDto,
} from "@/lib/api2/accounting-types";

function formatAmount(value: string | number | null | undefined) {
  return Number(value ?? 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function getLineNetImpact(line: {
  debit_amount: string | number | null | undefined;
  credit_amount: string | number | null | undefined;
}) {
  return Number(line.debit_amount ?? 0) - Number(line.credit_amount ?? 0);
}

function formatSignedAmount(value: number) {
  const sign = value > 0 ? "+" : value < 0 ? "-" : "";
  return `${sign}${formatAmount(Math.abs(value))}`;
}

function DetailRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="grid gap-2 border-b border-border/60 py-3 first:pt-0 last:border-b-0 last:pb-0 sm:grid-cols-[170px_minmax(0,1fr)] sm:items-start">
      <span className="Ftext-[11px] font-semibold text-muted-foreground">
        {label}
      </span>
      <span className={mono ? "font-mono text-sm text-foreground" : "text-sm text-foreground"}>
        {value}
      </span>
    </div>
  );
}

interface JournalEntryDetailSheetProps {
  entry: AccountingJournalEntryDetailDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isLoading?: boolean;
}

export function JournalEntryDetailSheet({
  entry,
  open,
  onOpenChange,
  isLoading,
}: JournalEntryDetailSheetProps) {
  return (
    <ActionSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Journal Entry Details"
      description={entry?.reference_number || ""}
      className="sm:max-w-4xl!"
      footer={
        entry ? (
          <div className="flex w-full flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Total Debit</p>
                <p className="font-mono text-base font-semibold text-emerald-600 md:text-lg">{formatAmount(entry.total_debit)}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Total Credit</p>
                <p className="font-mono text-base font-semibold text-rose-600 md:text-lg">{formatAmount(entry.total_credit)}</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        ) : null
      }
    >
      {isLoading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-full" />
            </div>
          ))}
        </div>
      ) : entry ? (
        <div className="space-y-4">
          <section className="rounded-sm border border-border/70 bg-card p-5 ">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Summary
              </p>
              <StatusBadge status={entry.status} className="capitalize" />
            </div>

            <div className="mt-4 space-y-1">
              <DetailRow label="Posting Date" value={entry.posting_date ? format(new Date(entry.posting_date), "PPP") : "-"} />
              <DetailRow label="Reference" value={entry.reference_number || "-"} mono />
              <DetailRow label="Source" value={entry.source || "-"} />
              <DetailRow label="Description" value={entry.description || "-"} />
              <DetailRow label="Source Reference" value={entry.source_reference || "-"} mono />
            </div>
          </section>

          <section className="rounded-sm border border-border/70 bg-card p-5 ">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Journal Lines
            </p>

            <div className="mt-4 frounded-xl fborder border-border/70">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Line</TableHead>
                    <TableHead>Ledger Account</TableHead>
                    <TableHead>Currency</TableHead>
                    <TableHead className="text-right">Debit</TableHead>
                    <TableHead className="text-right">Credit</TableHead>
                    <TableHead className="text-right">Base Amount</TableHead>
                    <TableHead className="text-right">Net Impact</TableHead>
                    {/* <TableHead>Description</TableHead> */}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(entry.lines ?? []).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="py-6 text-center text-sm text-muted-foreground">
                        No journal lines found for this entry.
                      </TableCell>
                    </TableRow>
                  ) : (
                    (entry.lines ?? []).map((line) => {
                      const netImpact = getLineNetImpact(line);
                      return (
                        <TableRow key={line.id}>
                          <TableCell className="font-mono text-xs">{line.line_sequence}</TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-sm">{line.ledger_account_name || "-"}</span>
                              <span className="font-mono text-xs text-muted-foreground">{line.ledger_account_code || "-"}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-xs">{line.currency_code || "-"}</TableCell>
                          <TableCell className="text-right font-mono text-xs text-emerald-600">{formatAmount(line.debit_amount)}</TableCell>
                          <TableCell className="text-right font-mono text-xs text-rose-600">{formatAmount(line.credit_amount)}</TableCell>
                          <TableCell className="text-right font-mono text-xs">{formatAmount(line.base_amount)}</TableCell>
                          <TableCell className={`text-right font-mono text-xs ${netImpact > 0 ? "text-emerald-600" : netImpact < 0 ? "text-rose-600" : "text-muted-foreground"}`}>
                            {formatSignedAmount(netImpact)}
                          </TableCell>
                          {/* <TableCell className="text-sm text-muted-foreground">{line.description || "-"}</TableCell> */}
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </section>
        </div>
      ) : (
        <div className="p-4 text-center text-muted-foreground">No journal entry details available</div>
      )}
    </ActionSheet>
  );
}
