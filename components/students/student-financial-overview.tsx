"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  CheckmarkCircle01Icon,
  AlertCircleIcon,
  TimeQuarterPassIcon,
  CreditCardIcon,
  Invoice01Icon,
} from "@hugeicons/core-free-icons"
import type { StudentDto } from "@/lib/api/student-types"
import { cn } from "@/lib/utils"

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

  const billingItems = [
    { label: "Tuition", amount: billing.tuition },
    { label: "Other Fees", amount: billing.total_fees },
  ]

  const getPaymentStatusConfig = () => {
    if (paymentStatus.is_paid_in_full) {
      return {
        label: "Paid in Full",
        variant: "default" as const,
        className: "bg-emerald-500 hover:bg-emerald-600 text-white",
        icon: CheckmarkCircle01Icon,
      }
    }
    if (!paymentStatus.is_on_time) {
      return {
        label: "Payment Overdue",
        variant: "destructive" as const,
        className: "",
        icon: AlertCircleIcon,
      }
    }
    return {
      label: "On Track",
      variant: "default" as const,
      className: "bg-blue-500 hover:bg-blue-600 text-white",
      icon: TimeQuarterPassIcon,
    }
  }

  const statusConfig = getPaymentStatusConfig()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
      {/* Payment Status Card */}
      <div className="rounded-xl border border-border bg-card p-5 h-full flex flex-col justify-between">
        <div className="flex items-center justify-between flex-wrap">
        <div className="flex items-center gap-2 text-muted-foreground fmb-4">
          <HugeiconsIcon icon={CreditCardIcon} className="size-5" />
          <span className="font-medium">Payment Status</span>
        </div>
         <div className="flex justify-center">
            <Badge className={cn("px-4 py-1.5 text-sm gap-2 rounded-full", statusConfig.className)}>
              <HugeiconsIcon icon={statusConfig.icon} className="size-4" />
              {statusConfig.label}
            </Badge>
          </div>
        </div>
        
        <div className="flex-1 flex flex-col justify-center space-y-2">
          <div className="grid grid-cols-3 gap-4 text-center p-4 rounded-lg bg-muted/30">
            <div>
              <p className="text-2xl font-bold">
                {Math.round(paymentStatus.paid_percentage)}%
              </p>
              <p className="text-xs text-muted-foreground mt-1">Paid</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-600">
                {Math.round(paymentStatus.expected_payment_percentage - paymentStatus.paid_percentage > 0 ? paymentStatus.expected_payment_percentage - paymentStatus.paid_percentage : 0)}%
              </p>
              <p className="text-xs text-muted-foreground mt-1">Behind</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-destructive">
                {Math.round(paymentStatus.overdue_percentage)}%
              </p>
              <p className="text-xs text-muted-foreground mt-1">Overdue</p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Overall Progress</span>
                <span className="text-xs font-semibold">
                  {Math.round(paymentStatus.paid_percentage)}%
                </span>
              </div>
              <Progress value={paymentStatus.paid_percentage} className="h-2" />
            </div>
            
            {(paymentStatus.overdue_count > 0 || paymentStatus.next_due_date) && (
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm justify-center pt-2">
                {paymentStatus.overdue_count > 0 && (
                  <span className="text-destructive font-medium flex items-center gap-1">
                    <HugeiconsIcon icon={AlertCircleIcon} className="size-3.5" />
                    {paymentStatus.overdue_count} Overdue
                  </span>
                )}
                {paymentStatus.next_due_date && (
                  <span className="text-muted-foreground">
                    Next Due: <span className="text-foreground font-medium">{new Date(paymentStatus.next_due_date).toLocaleDateString("en-US", { month: "short", day: "numeric"})}</span>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bill Breakdown */}
      <div className="rounded-xl border border-border bg-card p-5 h-full flex flex-col">
        <div className="flex items-center gap-2 text-muted-foreground mb-6">
          <HugeiconsIcon icon={Invoice01Icon} className="size-5" />
          <span className="font-medium">Financial Summary</span>
        </div>

        <div className="flex-1 space-y-6">
           {/* <div className="text-center py-2">
             <p className="text-sm text-muted-foreground mb-1">Total Outstanding Balance</p>
              <p className={cn(
                "text-4xl font-bold tracking-tight",
                billing.balance > 0 ? "text-destructive" : "text-emerald-600"
              )}>
                {currency}{billing.balance.toLocaleString()}
              </p>
           </div> */}

           <Separator />

          <div className="space-y-3">
            {/* Billing Items */}
             {billingItems.map((item, index) => (
              <div key={index} className="flex justify-between items-center py-1">
                <span className="text-sm text-muted-foreground">{item.label}</span>
                <span className="text-sm font-medium">
                  {currency}{item.amount.toLocaleString()}
                </span>
              </div>
            ))}
            
            <Separator className="my-2" />
            
             <div className="flex justify-between items-center py-1">
                <span className="text-sm font-medium">Total Billed</span>
                <span className="text-sm font-bold">
                  {currency}{billing.total_bill.toLocaleString()}
                </span>
              </div>
             <div className="flex justify-between items-center py-1">
                <span className="text-sm font-medium">Total Paid</span>
                <span className="text-sm font-bold text-emerald-600">
                  {currency}{billing.paid.toLocaleString()}
                </span>
              </div>
          </div>
        </div>
      </div>
    </div>
  )
}
