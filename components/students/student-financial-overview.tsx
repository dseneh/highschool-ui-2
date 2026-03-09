"use client"

import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  CheckmarkCircle01Icon,
  Invoice01Icon,
  Wallet01Icon,
  MoneyReceive01Icon,
  MoneyNotFound01Icon,
} from "@hugeicons/core-free-icons"
import type { StudentDto } from "@/lib/api2/student-types"
import { cn } from "@/lib/utils"
import {CircleCheck} from 'lucide-react';

interface StudentFinancialOverviewProps {
  student: StudentDto
}

export function StudentFinancialOverview({ student }: StudentFinancialOverviewProps) {
  const billing = student?.current_enrollment?.billing_summary

  if (!billing) {
    return (
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Financial Overview</h2>
        <p className="text-sm text-muted-foreground">No billing information available</p>
      </Card>
    )
  }

  const currency = billing.currency || '$'
  const paymentStatus = billing.payment_status
  const grossTotalBill = billing.gross_total_bill ?? billing.total_bill
  const totalConcession = billing.total_concession ?? 0
  const netTotalBill = billing.net_total_bill ?? billing.total_bill
  const balanceDue = billing.balance

  const isPaidInFull = paymentStatus.is_paid_in_full

  const statCards = [
    {
      label: "Gross Total Bill",
      amount: grossTotalBill,
      icon: Invoice01Icon,
      iconColor: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-950/20",
    },
    {
      label: "Concession",
      amount: totalConcession,
      icon: MoneyReceive01Icon,
      iconColor: "text-amber-500",
      bgColor: "bg-amber-50 dark:bg-amber-950/20",
      isNegative: true,
    },
    {
      label: "Net Bill",
      amount: netTotalBill,
      icon: Wallet01Icon,
      iconColor: "text-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-950/20",
    },
    {
      label: "Balance Due",
      amount: balanceDue,
      icon: MoneyNotFound01Icon,
      iconColor: balanceDue > 0 ? "text-destructive" : "text-emerald-500",
      bgColor: balanceDue > 0 
        ? "bg-red-50 dark:bg-red-950/20" 
        : "bg-emerald-50 dark:bg-emerald-950/20",
    },
  ]

  return (
    <div className="space-y-4">
      {/* Success Alert for Paid in Full */}
      {isPaidInFull && (
        <div className="p-3 rounded-lg border bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900 flex items-center gap-2">
            <CircleCheck className="size-5 text-emerald-600 dark:text-emerald-400" />
            <div className="text-emerald-800 dark:text-emerald-200 font-medium text-sm">
              Payment Complete! All fees have been paid in full.
            </div>
          </div>
      )}

      {/* Financial Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <Card key={index} className="p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  {stat.label}
                </p>
                <p className={cn(
                  "text-2xl font-bold tracking-tight",
                  stat.label === "Balance Due" && balanceDue === 0 && "text-emerald-600"
                )}>
                  {currency}{Math.abs(stat.amount).toLocaleString()}
                </p>
              </div>
              <div className={cn(
                "rounded-full p-2.5",
                stat.bgColor
              )}>
                <HugeiconsIcon 
                  icon={stat.icon} 
                  className={cn("size-5", stat.iconColor)} 
                />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
