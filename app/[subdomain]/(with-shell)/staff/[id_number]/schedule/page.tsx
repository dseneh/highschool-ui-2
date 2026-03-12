"use client"

import { useMemo } from "react"
import { useParams } from "next/navigation"
import { useStaff } from "@/lib/api2/staff"
import { PageContent } from "@/components/dashboard/page-content"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { HugeiconsIcon } from "@hugeicons/react"
import { AlertCircleIcon, Calendar03Icon } from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import PageLayout from "@/components/dashboard/page-layout"

type TeacherScheduleRow = {
  id?: string
  section?: { id?: string; name?: string } | null
  subject?: { id?: string; name?: string } | null
  period?: { id?: string; name?: string; period_type?: "class" | "recess" } | null
  period_time?: {
    id?: string
    start_time?: string
    end_time?: string
    day_of_week?: number
  } | null
  is_recess?: boolean
}

const DAY_NAMES: Record<number, string> = {
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
  7: "Sunday",
}

const SUBJECT_COLORS = [
  "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
  "bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800",
  "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
  "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800",
  "bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800",
]

function formatTime(time?: string) {
  if (!time) return "--"
  const [h, m] = time.split(":")
  const hour = parseInt(h, 10)
  const ampm = hour >= 12 ? "PM" : "AM"
  const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
  return `${h12}:${m} ${ampm}`
}

function isRecess(item: TeacherScheduleRow) {
  return item.is_recess || item.period?.period_type === "recess" || !item.subject
}

function getLabel(item: TeacherScheduleRow) {
  if (isRecess(item)) return "Recess"
  return item.subject?.name || "Subject"
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
  const { data: staff, isLoading: staffLoading, error, refetch, isFetching } = staffApi.getStaffMember(idNumber, {
    enabled: !!idNumber && window.location.href.includes("/staff/"),
  })

  const schedules: TeacherScheduleRow[] = useMemo(
    () =>
      ((staff?.schedules as Array<{ class_schedule?: TeacherScheduleRow }> | undefined) ?? [])
        .map((row) => row.class_schedule)
        .filter((row): row is TeacherScheduleRow => Boolean(row)),
    [staff?.schedules]
  )

  const subjectColorMap = useMemo(() => {
    const uniqueSubjects = [...new Set(
      schedules.filter((s) => !isRecess(s)).map((s) => s.subject?.name || "Subject")
    )]
    const map = new Map<string, string>()
    uniqueSubjects.forEach((name, i) => {
      map.set(name, SUBJECT_COLORS[i % SUBJECT_COLORS.length])
    })
    return map
  }, [schedules])

  const byDay = useMemo(() => {
    const map = new Map<number, TeacherScheduleRow[]>()
    for (const item of schedules) {
      const day = item.period_time?.day_of_week
      if (!day) continue
      if (!map.has(day)) map.set(day, [])
      map.get(day)!.push(item)
    }
    for (const [, items] of map) {
      items.sort((a, b) =>
        (a.period_time?.start_time || "99:99").localeCompare(b.period_time?.start_time || "99:99")
      )
    }
    return map
  }, [schedules])

  const activeDays = useMemo(() => Array.from(byDay.keys()).sort((a, b) => a - b), [byDay])

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

  return (
    <PageLayout
      title="Teaching Calendar"
      description="Your class schedule by day and time"
      noData={!staff.is_teacher || schedules.length === 0}
      loading={staffLoading}
      fetching={isFetching}
      refreshAction={refetch}
      error={error}
      emptyStateTitle={!staff.is_teacher ? "Not a Teacher" : "No Schedule Entries"}
      emptyStateDescription={!staff.is_teacher
        ? "This staff member is not marked as a teacher."
        : "No class schedule has been configured for this teacher yet."}
      emptyStateIcon={<HugeiconsIcon icon={Calendar03Icon} className="size-5 text-muted-foreground" />}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {activeDays.map((day) => {
          const daySchedules = byDay.get(day) || []
          return (
            <Card key={day}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">
                  {DAY_NAMES[day] || `Day ${day}`}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {daySchedules.map((item, idx) => {
                  const label = getLabel(item)
                  return (
                    <div
                      key={item.id || `${day}-${idx}`}
                      className={cn(
                        "rounded-lg border p-3 space-y-1",
                        isRecess(item)
                          ? "bg-muted text-muted-foreground border-border"
                          : subjectColorMap.get(label) || "bg-muted"
                      )}
                    >
                      <p className="font-medium text-sm leading-tight">{label}</p>
                      <p className="text-xs opacity-80">
                        {formatTime(item.period_time?.start_time)} - {formatTime(item.period_time?.end_time)}
                      </p>
                      <p className="text-xs opacity-80">{item.section?.name || "Section"}</p>
                      <Badge variant="outline" className="text-[10px] px-1.5 mt-1">
                        {item.period?.name || "Period"}
                      </Badge>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </PageLayout>
  )
}
