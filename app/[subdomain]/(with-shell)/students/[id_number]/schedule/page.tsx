"use client"

import { useMemo } from "react"
import { useStudents as useStudentsApi } from "@/lib/api2/student"
import { useSectionSchedule } from "@/hooks/use-contacts"
import { PageContent } from "@/components/dashboard/page-content"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { HugeiconsIcon } from "@hugeicons/react"
import { AlertCircleIcon, Calendar03Icon } from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import type { SectionScheduleDto } from "@/lib/api2/contacts-types"
import PageLayout from "@/components/dashboard/page-layout"
import { useResolvedStudentIdNumber } from "@/hooks/use-resolved-student-id-number"

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

function getScheduleLabel(item: SectionScheduleDto) {
  if (item.is_recess || item.period.period_type === "recess" || !item.subject) {
    return "Recess";
  }
  return item.subject.name;
}

function isRecess(item: SectionScheduleDto) {
  return item.is_recess || item.period.period_type === "recess" || !item.subject;
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

export default function StudentSchedulePage() {
  const idNumber = useResolvedStudentIdNumber()

  const studentsApi = useStudentsApi()
  const { data: student, isLoading: studentLoading, error: studentError, refetch: refetchStudent, isFetching: isFetchingStudent } = studentsApi.getStudent(idNumber)


  const sectionId = student?.current_enrollment?.section?.id
  const {
    data: schedules,
    isLoading: scheduleLoading,
    error: scheduleError,
        refetch: refetchSchedule,
        isFetching: isFetchingSchedule,
  } = useSectionSchedule(sectionId)

  // Build a subject → color map
  const subjectColorMap = useMemo(() => {
    if (!schedules) return new Map<string, string>()
    const uniqueSubjects = [...new Set(
      schedules
        .filter((s) => !isRecess(s) && s.subject)
        .map((s) => s.subject!.name)
    )]
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

  const handleRefresh = () => {
    refetchStudent()
    refetchSchedule()
  }

  if (studentLoading) return <ScheduleSkeleton />

  if (!student) {
    return (
      <PageContent>
        <Card className="p-6 border-destructive/50 bg-destructive/10">
          <div className="flex items-start gap-3">
            <HugeiconsIcon icon={AlertCircleIcon} className="size-5 text-destructive mt-0.5" />
            <div>
              <h3 className="font-semibold text-destructive mb-1">Error Loading Student</h3>
              <p className="text-sm text-muted-foreground">Student not found</p>
            </div>
          </div>
        </Card>
      </PageContent>
    )
  }

  const enrollment = student.current_enrollment

  return (
    <PageLayout
      title="Class Schedule"
      description={enrollment
        ? `${enrollment.grade_level?.name} - ${enrollment.section?.name}`
        : "No current enrollment"}
      noData={!student || !enrollment || !schedules || schedules.length === 0}
      loading={studentLoading || scheduleLoading}
      refreshAction={handleRefresh}
      error={studentError || scheduleError}
      fetching={isFetchingStudent || isFetchingSchedule}
      emptyStateTitle={!enrollment ? "No Current Enrollment" : "No Schedule Set"}
      emptyStateDescription={
        !enrollment
          ? "This student is not currently enrolled. Enroll the student to see their class schedule."
          : "No class schedule has been configured for this section yet. The schedule will appear here once an administrator sets it up."
      }
      emptyStateIcon={<HugeiconsIcon icon={Calendar03Icon} className="size-5 text-muted-foreground" />}
    >
      {schedules && (
      <div className="space-y-4">
        <>
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
                      {daySchedules.map((item) => (
                        <div
                          key={item.id}
                          className={cn(
                            "rounded-lg border p-3 space-y-1",
                            isRecess(item)
                              ? "bg-muted text-muted-foreground border-border"
                              : subjectColorMap.get(getScheduleLabel(item)) || "bg-muted"
                          )}
                        >
                          <p className="font-medium text-sm leading-tight">
                            {getScheduleLabel(item)}
                          </p>
                          <p className="text-xs opacity-80">
                            {formatTime(item.period_time.start_time)} – {formatTime(item.period_time.end_time)}
                          </p>
                          <Badge variant="outline" className="text-[10px] px-1.5 mt-1">
                            {item.period.name}
                          </Badge>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Subjects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {Array.from(subjectColorMap.entries()).map(([name, color]) => {
                    const count = schedules.filter((s) => !isRecess(s) && getScheduleLabel(s) === name).length
                    return (
                      <div key={name} className="flex items-center gap-2 text-sm">
                        <div className={cn("size-3 rounded-sm border", color.split(" ").slice(0, 2).join(" "))} />
                        <span>{name}</span>
                        <span className="text-muted-foreground text-xs">
                          ({count} {count === 1 ? "period" : "periods"}/week)
                        </span>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="sm:hidden">
              <CardHeader>
                <CardTitle className="text-base">Full Schedule</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {activeDays.map((day) => {
                    const daySchedules = byDay.get(day) || []
                    return daySchedules.map((item) => (
                      <div key={item.id} className="px-4 py-3 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{getScheduleLabel(item)}</p>
                          <p className="text-xs text-muted-foreground">
                            {DAY_SHORT[day]} · {item.period.name}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatTime(item.period_time.start_time)} – {formatTime(item.period_time.end_time)}
                        </p>
                      </div>
                    ))
                  })}
                </div>
              </CardContent>
            </Card>
        </>
      </div>
      )}
    </PageLayout>
  )
}
