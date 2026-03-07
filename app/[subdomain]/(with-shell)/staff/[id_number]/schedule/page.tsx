"use client"

import { useMemo } from "react"
import { useParams } from "next/navigation"
import { useStaff } from "@/lib/api2/staff"
import { PageContent } from "@/components/dashboard/page-content"
import { PageHeader } from "@/components/dashboard/page-header"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  EmptyState,
  EmptyStateIcon,
  EmptyStateTitle,
  EmptyStateDescription,
} from "@/components/ui/empty-state"
import { HugeiconsIcon } from "@hugeicons/react"
import { AlertCircleIcon, SchoolIcon, Calendar03Icon } from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import type { SectionScheduleDto } from "@/lib/api2/contacts-types"
import { Button } from "@/components/ui/button"
import { RefreshCcw } from "lucide-react"
import PageLayout from "@/components/dashboard/page-layout"

const DAY_NAMES: Record<number, string> = {
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
  7: "Sunday",
}

const DAY_SHORT: Record<number, string> = {
  1: "Mon",
  2: "Tue",
  3: "Wed",
  4: "Thu",
  5: "Fri",
  6: "Sat",
  7: "Sun",
}

const SUBJECT_COLORS = [
  "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
  "bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800",
  "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
  "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800",
  "bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800",
  "bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800",
  "bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800",
]

function formatTime(time: string) {
  const [h, m] = time.split(":")
  const hour = parseInt(h, 10)
  const ampm = hour >= 12 ? "PM" : "AM"
  const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
  return `${h12}:${m} ${ampm}`
}

function ScheduleSkeleton() {
  return (
    <PageContent>
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-80 rounded-xl" />
          ))}
        </div>
      </div>
    </PageContent>
  )
}

export default function StaffSchedulePage() {
  const params = useParams()
  const idNumber = params.id_number as string

  const staffApi = useStaff()
  const { data: staff, isLoading: staffLoading } = staffApi.getStaffMember(idNumber, {
    enabled: !!idNumber && window.location.href.includes("/staff/")
  })

  // TODO: Implement staff schedule API
  const schedules: any[] = []
  const scheduleLoading = false
  const scheduleError = null
  const refetchSchedule = () => {}
  const isFetchingSchedule = false

  // Build a subject → color map
  const subjectColorMap = useMemo(() => {
    if (!schedules) return new Map<string, string>()
    const uniqueSubjects = [...new Set(schedules.map((s) => s.subject.name))]
    const map = new Map<string, string>()
    uniqueSubjects.forEach((name, i) => {
      map.set(name, SUBJECT_COLORS[i % SUBJECT_COLORS.length])
    })
    return map
  }, [schedules])

  // Group schedules by day
  const byDay = useMemo(() => {
    if (!schedules) return new Map<number, SectionScheduleDto[]>()
    const map = new Map<number, SectionScheduleDto[]>()
    for (const s of schedules) {
      const day = s.period_time.day_of_week
      if (!map.has(day)) map.set(day, [])
      map.get(day)!.push(s)
    }
    // Sort each day by start_time
    for (const [, items] of map) {
      items.sort((a, b) => a.period_time.start_time.localeCompare(b.period_time.start_time))
    }
    return map
  }, [schedules])

  const activeDays = useMemo(() => {
    return Array.from(byDay.keys()).sort((a, b) => a - b)
  }, [byDay])

  if (staffLoading) return <ScheduleSkeleton />

  if (!staff) {
    return (
      <PageContent>
        <Card className="p-6 border-destructive/50 bg-destructive/10">
          <div className="flex items-start gap-3">
            <HugeiconsIcon icon={AlertCircleIcon} className="size-5 text-destructive mt-0.5" />
            <div>
              <h3 className="font-semibold text-destructive mb-1">Error Loading Staff</h3>
              <p className="text-sm text-muted-foreground">Staff member not found</p>
            </div>
          </div>
        </Card>
      </PageContent>
    )
  }

  // Staff schedule will show teaching schedules
  const isTeacher = staff.is_teacher

  return (
    <PageLayout
      title="Teaching Schedule"
      description={`Schedule for Teaching Staff`}
      noData={!isTeacher}
      loading={staffLoading || scheduleLoading}
      fetching={isFetchingSchedule}
      refreshAction={refetchSchedule}
      error={scheduleError}
      skeleton={<ScheduleSkeleton />}
      emptyStateTitle="No Schedule Available"
      emptyStateDescription="This staff member does not have a teaching schedule."
    >
      <div className="space-y-4">
         <EmptyState>
              <EmptyStateIcon className="p-4 [&_svg]:size-8">
                <HugeiconsIcon icon={Calendar03Icon} />
              </EmptyStateIcon>
              <EmptyStateTitle>Teaching Schedules</EmptyStateTitle>
              <EmptyStateDescription>
                Teaching schedule functionality will be available soon.
              </EmptyStateDescription>
            </EmptyState>
      </div>
    </PageLayout>
  )
}
