"use client"

import { Card } from "@/components/ui/card"
import { CircularProgress } from "@/components/ui/circular-progress"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  BookOpen01Icon,
  Medal01Icon,
  DollarCircleIcon,
  Calendar03Icon,
} from "@hugeicons/core-free-icons"
import type { StudentDto } from "@/lib/api2/student-types"
import { cn } from "@/lib/utils"

interface StudentDashboardMetricsProps {
  student: StudentDto
}

export function StudentDashboardMetrics({ student }: StudentDashboardMetricsProps) {
  const billing = student?.current_enrollment?.billing_summary
  const currency = billing?.currency || '$'
  const balance = billing?.balance || 0
  const totalBill = billing?.total_bill || 0
  
  // Calculate balance percentage
  const balancePercentage = totalBill > 0 ? Math.round((balance / totalBill) * 100) : 0
  
  // Format grade average
  const gradeAverage = student?.total_average || 0
  
  // Get academic year dates
  const academicYear = student?.current_enrollment?.academic_year
  const startDate = academicYear?.start_date ? new Date(academicYear.start_date) : null
  const endDate = academicYear?.end_date ? new Date(academicYear.end_date) : null
  const today = new Date()
  
  // Calculate days in session (rough estimate)
  let daysInSession = 0
  let totalDays = 0
  if (startDate && endDate) {
    totalDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    if (today >= startDate && today <= endDate) {
      daysInSession = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    } else if (today > endDate) {
      daysInSession = totalDays
    }
  }
  const sessionProgress = totalDays > 0 ? Math.round((daysInSession / totalDays) * 100) : 0

  const metrics = [
    {
      icon: BookOpen01Icon,
      label: "Total Subjects",
      value: student?.total_subjects?.toString() || "0",
      subtext: "Enrolled",
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-950",
      progress: null,
    },
    {
      icon: Medal01Icon,
      label: "Grade Average",
      value: `${gradeAverage.toFixed(1)}%`,
      subtext: "Cumulative Average",
      color: "text-emerald-600",
      bgColor: "bg-emerald-100 dark:bg-emerald-950",
      progress: gradeAverage,
      progressColor: gradeAverage >= 70 ? "text-emerald-600" : gradeAverage >= 50 ? "text-amber-600" : "text-red-600",
    },
    {
      icon: Calendar03Icon,
      label: "Session Progress",
      value: `${sessionProgress}%`,
      subtext: `${daysInSession} of ${totalDays} days`,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-950",
      progress: sessionProgress,
      progressColor: "text-purple-600",
    },
    {
      icon: DollarCircleIcon,
      label: "Outstanding Balance",
      value: `${currency}${balance.toLocaleString()}`,
      subtext: balance === 0 ? "Paid in Full" : `${balancePercentage}% of total`,
      color: balance > 0 ? "text-destructive" : "text-emerald-600",
      bgColor: balance > 0 ? "bg-red-100 dark:bg-red-950" : "bg-emerald-100 dark:bg-emerald-950",
      progress: balance > 0 ? balancePercentage : 100,
      progressColor: balance > 0 ? "text-destructive" : "text-emerald-600",
      inverted: balance > 0, // Show balance as negative progress
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => (
        <Card key={index} className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">{metric.label}</p>
              <p className={cn("text-2xl font-bold", metric.color)}>
                {metric.value}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {metric.subtext}
              </p>
            </div>
            {metric.progress !== null ? (
              <CircularProgress
                value={metric.inverted ? 100 - metric.progress : metric.progress}
                size={56}
                strokeWidth={5.2}
                className={metric.progressColor}
              />
            ) : (
              <div className={cn("size-12 rounded-full flex items-center justify-center", metric.bgColor)}>
                <HugeiconsIcon
                  icon={metric.icon}
                  className={cn("size-6", metric.color)}
                />
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  )
}
