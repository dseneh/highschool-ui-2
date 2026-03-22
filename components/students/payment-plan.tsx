"use client"

import { useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  CalendarIcon,
  CheckmarkCircle01Icon,
  AlertCircleIcon,
  Clock01Icon,
} from "@hugeicons/core-free-icons"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Progress } from "../ui/progress"

export interface PaymentPlanItem {
  id: string
  payment_date: string
  amount: number
  cumulative_amount_due: number
  amount_paid: number
  cumulative_paid: number
  balance: number
  cumulative_balance: number
  percentage: number
  cumulative_percentage: number
}

interface PaymentPlanProps {
  paymentPlan?: PaymentPlanItem[]
  onInstallmentClick?: (item: PaymentPlanItem) => void
}

export function PaymentPlan({ paymentPlan = [], onInstallmentClick }: PaymentPlanProps) {
  // Calculate overall payment progress - recalculates when paymentPlan changes
  const paymentProgress = useMemo(() => {
    if (!paymentPlan || paymentPlan.length === 0) {
      return { paid: 0, due: 0, balance: 0, percentage: 0 }
    }

    const lastItem = paymentPlan[paymentPlan.length - 1]
    if (!lastItem) {
      return { paid: 0, due: 0, balance: 0, percentage: 0 }
    }

    const totalAmount = lastItem.cumulative_amount_due || 0
    const totalPaid = lastItem.cumulative_paid || 0
    const totalBalance = lastItem.cumulative_balance || 0
    const percentage = totalAmount > 0 ? (totalPaid / totalAmount) * 100 : 0

    return {
      paid: totalPaid,
      due: totalAmount,
      balance: totalBalance,
      percentage: Math.min(percentage, 100),
    }
  }, [paymentPlan])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatPercentage = (value: number) => `${Math.round(value)}%`

  const getInstallmentLabel = (index: number) => {
    const position = index + 1
    const suffix =
      position % 10 === 1 && position % 100 !== 11
        ? "st"
        : position % 10 === 2 && position % 100 !== 12
          ? "nd"
          : position % 10 === 3 && position % 100 !== 13
            ? "rd"
            : "th"
    return `${position}${suffix} Installment`
  }

  
  const getInstallmentStatusIcon = (item: PaymentPlanItem) => {
    if (item.cumulative_balance <= 0) {
      return <HugeiconsIcon icon={CheckmarkCircle01Icon} className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
    }
    if (new Date(item.payment_date) < new Date()) {
      return <HugeiconsIcon icon={AlertCircleIcon} className="h-5 w-5 text-red-600 dark:text-red-400" />
    }
    return <HugeiconsIcon icon={Clock01Icon} className="h-5 w-5 text-blue-600 dark:text-blue-400" />
  }

  const getInstallmentStatusBadge = (item: PaymentPlanItem) => {
    if (item.cumulative_balance <= 0) {
      return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:hover:bg-emerald-900/50 text-xs font-semibold">Paid</Badge>
    }
    if (new Date(item.payment_date) < new Date()) {
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50 text-xs font-semibold">Overdue</Badge>
    }
    return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 text-xs font-semibold">Upcoming</Badge>
  }

  if (!paymentPlan || paymentPlan.length === 0) {
    return (
      <Card className="p-6 border border-border/50 bg-linear-to-br from-muted/20 to-muted/5 dark:from-slate-800/50 dark:to-slate-900/20">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 dark:bg-blue-950 rounded-lg">
            <HugeiconsIcon icon={CalendarIcon} className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold dark:text-gray-50">Payment Plan</h3>
        </div>
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted dark:bg-slate-800 mb-4">
            <HugeiconsIcon icon={CalendarIcon} className="h-8 w-8 text-muted-foreground dark:text-slate-400" />
          </div>
          <p className="text-muted-foreground dark:text-slate-400">No payment plan available for this academic year</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-0 overflow-hidden  gap-y-0 ">
      {/* Header */}
      <div className="bg-gray-50 dark:bg-slate-950 px-4 sm:px-3 py-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full">
            <div className="p-2.5 bg-blue-600/10 dark:bg-blue-900/40 rounded-lg">
              <HugeiconsIcon icon={CalendarIcon} className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50">Payment Schedule</h3>
              <p className="text-sm text-muted-foreground dark:text-slate-400 mt-0.5">
                {paymentPlan.length} installment{paymentPlan.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <div className="md:max-w-sm flex flex-col items-start gap-1 w-full justify-end">
            <b>Payment Progress:</b>
            <div className="flex items-center gap-1 w-full justify-end">
          <Progress 
            value={paymentProgress.percentage} 
            className="w-full h-2 rounded-full"
            />
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-50">
            {paymentProgress.percentage.toFixed(1)}%
          </span>
            </div>
            <div className="w-full text-xs text-muted-foreground dark:text-slate-400 text-right">
              <span>{formatCurrency(paymentProgress.paid)} paid</span>
              <span className="mx-1.5">/</span>
              <span>{formatCurrency(paymentProgress.due)} due</span>
              <span className="mx-1.5">-</span>
              <span className={cn(paymentProgress.balance > 0 ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400")}>{formatCurrency(paymentProgress.balance)} balance</span>
            </div>
          </div>
        </div>
      </div>

      {/* Table View - Desktop */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full caption-bottom text-sm">
          <thead className="border-b border-border/30 dark:border-slate-700">
            <tr className="hover:bg-transparent">
              <th className="h-12 px-4 text-left font-semibold text-muted-foreground dark:text-slate-400">Installment</th>
              <th className="h-12 px-4 text-left font-semibold text-muted-foreground dark:text-slate-400">Due Date</th>
              <th className="h-12 px-4 text-right font-semibold text-muted-foreground dark:text-slate-400">Amount Due</th>
              <th className="h-12 px-4 text-right font-semibold text-muted-foreground dark:text-slate-400">Cumulative Due</th>
              <th className="h-12 px-4 text-right font-semibold text-muted-foreground dark:text-slate-400">Cumulative Paid</th>
              <th className="h-12 px-4 text-right font-semibold text-muted-foreground dark:text-slate-400">Cumulative Balance</th>
            </tr>
          </thead>
          <tbody>
            {paymentPlan.map((item, index) => (
              <tr
                key={item.id || index}
                className="border-t border-border/30 dark:border-slate-700 hover:bg-muted/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                // onClick={() => onInstallmentClick?.(item)}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span>{getInstallmentStatusIcon(item)}</span>
                    <span className="font-semibold text-sm text-gray-900 dark:text-gray-50">
                      {getInstallmentLabel(index)}
                      </span>
                    </div>
                </td>
                <td className="px-4 py-3 text-sm">
                  {format(new Date(item.payment_date), "MMM dd, yyyy")}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex flex-col items-end">
                    <span className="font-semibold text-gray-900 dark:text-gray-50">{formatCurrency(item.amount)}</span>
                    <span className="text-xs text-muted-foreground dark:text-slate-400">({formatPercentage(item.percentage)} of total)</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex flex-col items-end">
                    <span className="font-semibold text-gray-900 dark:text-gray-50">{formatCurrency(item.cumulative_amount_due)}</span>
                    <span className="text-xs text-muted-foreground dark:text-slate-400">({formatPercentage(item.cumulative_percentage)} of total)</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(item.cumulative_paid)}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span
                    className={`font-semibold ${
                      item.cumulative_balance > 0 ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"
                    }`}
                  >
                    {formatCurrency(item.cumulative_balance)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Card View - Mobile */}
      <div className="md:hidden px-4 py-4 space-y-3">
        {paymentPlan.map((item, index) => (
          <div
            key={item.id || index}
            className={cn(
              "p-4 rounded-lg border transition-all cursor-pointer active:scale-95",
              item.cumulative_balance <= 0
                ? "bg-emerald-50/50 border-emerald-200/50 hover:border-emerald-300 dark:bg-emerald-950/30 dark:border-emerald-900/50 dark:hover:border-emerald-800"
                : new Date(item.payment_date) < new Date()
                ? "bg-red-50/50 border-red-200/50 hover:border-red-300 dark:bg-red-950/30 dark:border-red-900/50 dark:hover:border-red-800"
                : "bg-blue-50/50 border-blue-200/50 hover:border-blue-300 dark:bg-blue-950/30 dark:border-blue-900/50 dark:hover:border-blue-800"
            )}
            onClick={() => onInstallmentClick?.(item)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                {getInstallmentStatusIcon(item)}
                <div>
                  <p className="font-semibold text-sm text-gray-900 dark:text-gray-50">
                    {getInstallmentLabel(index)}
                  </p>
                  <p className="text-xs text-muted-foreground dark:text-slate-400 mt-0.5">
                    Due {format(new Date(item.payment_date), "MMM dd, yyyy")}
                  </p>
                </div>
              </div>
              {getInstallmentStatusBadge(item)}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-current border-opacity-10 dark:border-opacity-20">
              <div>
                <p className="text-xs text-muted-foreground dark:text-slate-400">Amount</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-50">{formatCurrency(item.amount)}</p>
                <p className="text-[11px] text-muted-foreground dark:text-slate-400">{formatPercentage(item.percentage)} of total</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground dark:text-slate-400">Cumulative Due</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-50">{formatCurrency(item.cumulative_amount_due)}</p>
                <p className="text-[11px] text-muted-foreground dark:text-slate-400">{formatPercentage(item.cumulative_percentage)} of total</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground dark:text-slate-400">Cumulative Paid</p>
                <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(item.cumulative_paid)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground dark:text-slate-400">Cumulative Balance</p>
                <p
                  className={`text-sm font-semibold ${
                    item.cumulative_balance > 0 ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"
                  }`}
                >
                  {formatCurrency(item.cumulative_balance)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Legend Footer */}
      {/* <div className="border-t border-border/30 dark:border-slate-700 bg-muted/20  px-4 sm:px-6 py-4">
        <p className="text-xs font-medium text-muted-foreground dark:text-slate-400 uppercase tracking-wide mb-3">Status Legend</p>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/40 rounded-md">
              <HugeiconsIcon icon={CheckmarkCircle01Icon} className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="text-muted-foreground dark:text-slate-400">Paid in full</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-red-100 dark:bg-red-900/40 rounded-md">
              <HugeiconsIcon icon={AlertCircleIcon} className="h-4 w-4 text-red-600 dark:text-red-400" />
            </div>
            <span className="text-muted-foreground dark:text-slate-400">Overdue payment</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-blue-100 dark:bg-blue-900/40 rounded-md">
              <HugeiconsIcon icon={Clock01Icon} className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-muted-foreground dark:text-slate-400">Upcoming payment</span>
          </div>
        </div>
      </div> */}
    </Card>
  )
}
